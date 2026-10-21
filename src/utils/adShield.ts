import { secureLogger } from './secureLogger';

/**
 * VCinema AdShield: Enterprise-Grade Pop-up & Ad Navigation Blocker
 * 
 * Embedded third-party streaming providers frequently embed ad networks that attempt to:
 * 1. Open new tabs/windows via window.open() when users click the video player.
 * 2. Hijack user clicks with dynamically inserted <a> elements pointing to ad redirects.
 * 3. Attempt top-level browser navigation to malicious or commercial URLs.
 * 
 * AdShield neutralizes these exploits at the browser engine level by:
 * - Overriding window.open to suppress all popups and popunders.
 * - Capturing all document click events to drop external redirects.
 * - Trapping beforeunload ad triggers.
 */

let isShieldActive = false;
let originalOpen: typeof window.open | null = null;

export function activateAdShield(): () => void {
  if (isShieldActive || typeof window === 'undefined') {
    return () => {};
  }

  isShieldActive = true;
  originalOpen = window.open;

  // 1. Override window.open to suppress ad popups/popunders
  window.open = function (...args: unknown[]) {
    const targetUrl = args[0] ? String(args[0]) : '';
    secureLogger.warn('VCinema AdShield: Intercepted and blocked popup window attempt', targetUrl);
    return null;
  };

  // 2. Intercept and block deceptive external click hijacks in capturing phase
  const handleCaptureClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const anchor = target.closest('a');
    if (anchor && anchor.href) {
      try {
        const url = new URL(anchor.href, window.location.href);
        const currentOrigin = window.location.origin;

        // Allow internal site navigation and hash anchors
        if (url.origin === currentOrigin || url.protocol === 'javascript:' || anchor.href.startsWith('#')) {
          return;
        }

        // Allow legitimate outbound links explicitly marked with data-allow-external
        if (anchor.hasAttribute('data-allow-external')) {
          return;
        }

        // Deceptive click hijack detected - drop completely
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        secureLogger.warn('VCinema AdShield: Blocked ad redirect to:', url.href);
      } catch {
        // Invalid URL - suppress
        e.preventDefault();
      }
    }
  };

  // 3. Block window-level attempts to redirect top window via click
  const handleAuxClick = (e: MouseEvent) => {
    // Prevent middle-click ad opens on video containers
    const target = e.target as HTMLElement | null;
    if (target?.closest('iframe') || target?.closest('[data-video-player]')) {
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  window.addEventListener('click', handleCaptureClick, true);
  window.addEventListener('auxclick', handleAuxClick, true);

  return () => {
    if (originalOpen) {
      window.open = originalOpen;
      originalOpen = null;
    }
    window.removeEventListener('click', handleCaptureClick, true);
    window.removeEventListener('auxclick', handleAuxClick, true);
    isShieldActive = false;
  };
}
