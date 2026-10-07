/**
 * Maps raw Firebase Authentication error codes to elegant, accessible user messages.
 * Prevents technical internal error codes from surfacing unhelpfully in the cinema UI.
 */
export function formatAuthError(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Handle Error instances or FirebaseError objects
  const err = error as { code?: string; message?: string };
  const code = (err.code || '').toLowerCase();
  const message = (err.message || '').toLowerCase();

  // 1. Missing or Invalid Firebase Configuration / API Key
  if (
    code.includes('api-key') ||
    code.includes('invalid-api-key') ||
    message.includes('api key') ||
    message.includes('api-key')
  ) {
    return 'Firebase credentials not configured or API key is invalid. Please configure your VITE_FIREBASE_* variables in .env.local (see .env.example).';
  }

  // 2. Provider Disabled in Firebase Console
  if (code.includes('operation-not-allowed') || message.includes('operation-not-allowed')) {
    return 'This sign-in provider is not enabled in the Firebase Console. Please enable Email/Password or Google under Firebase Console > Authentication > Sign-in method.';
  }

  // 3. Domain Not Authorized in Firebase Console
  if (code.includes('unauthorized-domain') || message.includes('unauthorized-domain')) {
    return 'This domain is not authorized. Please add "localhost" under Firebase Console > Authentication > Settings > Authorized domains.';
  }

  // 4. Invalid Credentials or Account Not Found
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    code.includes('invalid-login-credentials')
  ) {
    return 'Invalid email or passkey. Please verify your credentials or create a new account.';
  }

  // 5. Account Conflicts
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email address already exists. Please sign in instead.';
  }

  // 6. Password Quality
  if (code === 'auth/weak-password') {
    return 'The passkey is too weak. Please choose a password with at least 6 characters.';
  }

  // 7. Invalid Email Format
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address format (e.g. viewer@vcinema.app).';
  }

  // 8. Account Disabled
  if (code === 'auth/user-disabled') {
    return 'This cinema account has been deactivated. Please contact concierge support.';
  }

  // 9. Popup Interruptions
  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in was cancelled before completion.';
  }

  if (code === 'auth/popup-blocked') {
    return 'The sign-in popup was blocked by your browser. Please allow popups for VCinema.';
  }

  if (code === 'auth/cancelled-popup-request') {
    return 'Another authentication attempt is currently in progress.';
  }

  // 10. Network & Rate Limiting
  if (code === 'auth/network-request-failed') {
    return 'Network connection issue. Please check your internet connectivity.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Access temporarily suspended due to repeated failed attempts. Please try again later or reset your passkey.';
  }

  if (code === 'auth/requires-recent-login') {
    return 'For security, please sign in again before modifying account settings.';
  }

  // 11. Clean Fallback
  return err.message && !err.message.includes('Firebase')
    ? err.message
    : 'Authentication failed. Please check your credentials or Firebase configuration.';
}
