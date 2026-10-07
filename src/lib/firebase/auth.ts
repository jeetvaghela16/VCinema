import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './config';
import type { AuthenticatedUser } from '../../types/auth';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Transforms a Firebase User object into an AuthenticatedUser representation.
 */
export function mapFirebaseUser(user: User): AuthenticatedUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

/**
 * Signs in using Email & Password.
 */
export async function loginWithEmail(email: string, password: string): Promise<AuthenticatedUser> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return mapFirebaseUser(credential.user);
}

/**
 * Registers a new account with Email, Password, and Display Name.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<AuthenticatedUser> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  
  if (displayName.trim()) {
    await updateProfile(credential.user, { displayName: displayName.trim() });
  }

  return mapFirebaseUser(credential.user);
}

/**
 * Initiates Google OAuth authentication via popup.
 */
export async function loginWithGoogle(): Promise<AuthenticatedUser> {
  const credential = await signInWithPopup(auth, googleProvider);
  return mapFirebaseUser(credential.user);
}

/**
 * Signs out the current user session.
 */
export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Sends a password reset email for an authorized account.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Subscribes to Firebase Auth session changes.
 */
export function subscribeToAuthChanges(
  onChange: (user: AuthenticatedUser | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      onChange(mapFirebaseUser(firebaseUser));
    } else {
      onChange(null);
    }
  });
}
