/**
 * Secure Logger for VCinema
 *
 * Prevents confidential tokens, user IDs, internal Firebase error structures
 * (such as customData._tokenResponse), and sensitive keys from being exposed
 * in browser Developer Tools (Console tab).
 *
 * In production builds, non-critical logs are completely silenced.
 */

// Patterns matching JWT tokens, Firebase Auth bearer tokens, and refresh tokens
const TOKEN_PATTERN = /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]*/g;
const BEARER_PATTERN = /Bearer\s+[a-zA-Z0-9_.-]{20,}/gi;
const REFRESH_TOKEN_PATTERN = /AIza[0-9A-Za-z-_]{35}/g;

/**
 * Sanitizes any string by redacting potential tokens, secrets, and keys.
 */
export function sanitizeString(val: string): string {
  if (!val) return '';
  return val
    .replace(TOKEN_PATTERN, '[REDACTED_TOKEN]')
    .replace(BEARER_PATTERN, 'Bearer [REDACTED]')
    .replace(REFRESH_TOKEN_PATTERN, '[REDACTED_KEY]');
}

/**
 * Safely converts an unknown error or log argument into a secure, non-leaking string.
 * Strips out internal object graphs, Firebase customData, credentials, and token structures.
 */
export function formatSafeMessage(arg: unknown): string {
  if (arg === null || arg === undefined) {
    return '';
  }

  if (typeof arg === 'string') {
    return sanitizeString(arg);
  }

  if (typeof arg === 'number' || typeof arg === 'boolean') {
    return String(arg);
  }

  // Handle Error instances and Firebase error objects safely
  if (typeof arg === 'object') {
    const obj = arg as Record<string, unknown>;
    
    // If it's an error with code or message, extract only the safe textual message
    const code = typeof obj.code === 'string' ? obj.code : '';
    const message = typeof obj.message === 'string' ? obj.message : '';

    if (code && message) {
      return sanitizeString(`[${code}] ${message}`);
    }
    if (message) {
      return sanitizeString(message);
    }
    if (code) {
      return sanitizeString(`[${code}]`);
    }

    // Generic safe summary for objects - never print raw object trees to console
    return '[Protected Object]';
  }

  return '[Unknown Type]';
}

function processArgs(args: unknown[]): string {
  return args.map(formatSafeMessage).filter(Boolean).join(' ');
}

const isProduction = import.meta.env.PROD;

export const secureLogger = {
  debug(...args: unknown[]): void {
    if (isProduction) return;
    const msg = processArgs(args);
    if (msg) console.debug(msg);
  },

  info(...args: unknown[]): void {
    if (isProduction) return;
    const msg = processArgs(args);
    if (msg) console.info(msg);
  },

  warn(...args: unknown[]): void {
    if (isProduction) return;
    const msg = processArgs(args);
    if (msg) console.warn(msg);
  },

  error(...args: unknown[]): void {
    // In production, we log only the sanitized message string to aid observability without exposing secrets
    const msg = processArgs(args);
    if (msg) console.error(msg);
  },
};
