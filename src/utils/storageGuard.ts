/**
 * Storage Guard & Confidentiality Shield for VCinema
 *
 * Ensures that no confidential credentials, JWT tokens, user objects,
 * or Firebase Auth persistence states are leaked into browser DevTools
 * (Local Storage, Session Storage, IndexedDB, or Cookies).
 */

const SENSITIVE_KEY_NAMES = [
  'token',
  'user',
  'authtoken',
  'auth_token',
  'jwt',
  'id_token',
  'refreshtoken',
  'refresh_token',
  'access_token',
  'vcinema_tmdb_api_key',
  'password',
  'secret',
  'apikey',
  'credentials',
];

/**
 * Checks if a key or value contains confidential or token patterns.
 */
function isSensitive(key: string, value?: string): boolean {
  const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
  if (SENSITIVE_KEY_NAMES.some((k) => lowerKey === k || lowerKey.includes(k))) {
    return true;
  }

  if (value && typeof value === 'string') {
    // Detect JWT tokens
    if (value.startsWith('eyJ') && value.includes('.')) {
      return true;
    }
    // Detect Firebase Auth refreshToken or user JSON dumps
    if (
      value.includes('"refreshToken"') ||
      value.includes('"stsTokenManager"') ||
      (value.includes('"id"') && value.includes('"username"'))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Purges all sensitive keys and legacy values from LocalStorage and SessionStorage.
 */
export function purgeSensitiveStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Purge LocalStorage
    if (window.localStorage) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key) || '';
        if (isSensitive(key, val)) {
          localStorage.removeItem(key);
        }
      }
    }

    // 2. Purge SessionStorage
    if (window.sessionStorage) {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (!key) continue;
        const val = sessionStorage.getItem(key) || '';
        if (isSensitive(key, val)) {
          sessionStorage.removeItem(key);
        }
      }
    }

    // 3. Purge existing sensitive IndexedDB databases (e.g. firebaseLocalStorageDb, heartbeat)
    if ('indexedDB' in window) {
      try {
        window.indexedDB.deleteDatabase('firebaseLocalStorageDb');
        window.indexedDB.deleteDatabase('firebase-heartbeat-database');
      } catch {
        // Deletion failure is non-fatal
      }
    }

    // 4. Scrub stale or non-HttpOnly cookies from localhost
    if (typeof document !== 'undefined' && document.cookie) {
      document.cookie.split(';').forEach((c) => {
        const eqPos = c.indexOf('=');
        const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
        if (
          name.includes('xsrf') ||
          name.includes('username') ||
          name.includes('token') ||
          name.includes('user')
        ) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
        }
      });
    }
  } catch {
    // Silent guard to never crash app initialization
  }
}

/**
 * Installs proxy guards on Storage.prototype to prevent future writes of
 * confidential tokens, user profiles, or plaintext keys into DevTools Storage.
 */
export function installStorageShield(): void {
  if (typeof window === 'undefined') return;

  try {
    const originalLocalSetItem = Storage.prototype.setItem;

    Storage.prototype.setItem = function (key: string, value: string): void {
      if (isSensitive(key, value)) {
        // Prevent storing confidential tokens or user IDs in DevTools storage
        return;
      }
      return originalLocalSetItem.call(this, key, value);
    };
  } catch {
    // Silent fallback
  }
}

/**
 * Initializes full storage guard.
 */
export function initStorageGuard(): void {
  purgeSensitiveStorage();
  installStorageShield();
}

/**
 * Safe, non-sensitive preferences for video playback quality.
 * These store purely generic resolution strings ('auto' | '4k' | '1080' | '720' | '480')
 * and contain zero user data or auth credentials.
 */
export function getVideoQualityPreference(): string {
  if (typeof window === 'undefined') return 'auto';
  try {
    return localStorage.getItem('vc_pref_video_quality') || 'auto';
  } catch {
    return 'auto';
  }
}

export function setVideoQualityPreference(quality: string): void {
  if (typeof window === 'undefined') return;
  try {
    const safeQuality = ['auto', '4k', '1080', '720', '480'].includes(quality) ? quality : 'auto';
    localStorage.setItem('vc_pref_video_quality', safeQuality);
  } catch {
    // Non-fatal
  }
}
