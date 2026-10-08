import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type FieldValue,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase/config';
import type { AuthenticatedUser } from '../types/auth';
import type { UserProfile } from '../types/user';

/**
 * Creates or updates the user profile document in Firestore at users/{uid}.
 * Called upon successful registration or initial sign in.
 */
export async function syncUserProfile(user: AuthenticatedUser): Promise<UserProfile> {
  const fallbackProfile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    moviesWatched: 0,
    theatresHosted: 0,
    watchHours: 0,
  };

  // If Firebase is not configured with real project ID, return memory profile
  if (!isFirebaseConfigured) {
    return fallbackProfile;
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userDocRef);

    if (existingSnap.exists()) {
      const data = existingSnap.data();
      const updatedProfile: UserProfile = {
        uid: user.uid,
        displayName: data.displayName ?? user.displayName,
        email: data.email ?? user.email,
        photoURL: data.photoURL ?? user.photoURL,
        createdAt: data.createdAt ? (data.createdAt.toMillis?.() ?? data.createdAt) : Date.now(),
        updatedAt: Date.now(),
        moviesWatched: data.moviesWatched ?? 0,
        theatresHosted: data.theatresHosted ?? 0,
        watchHours: data.watchHours ?? 0,
      };

      // Update last seen / updatedAt
      await updateDoc(userDocRef, {
        updatedAt: serverTimestamp(),
      });

      return updatedProfile;
    } else {
      // First-time registration
      const newProfileData = {
        uid: user.uid,
        displayName: user.displayName ?? null,
        email: user.email ?? null,
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        moviesWatched: 0,
        theatresHosted: 0,
        watchHours: 0,
      };

      await setDoc(userDocRef, newProfileData);

      return {
        ...fallbackProfile,
      };
    }
  } catch (error) {
    console.warn('[VCinema User Profile] Firestore profile sync error, using local fallback:', error);
    return fallbackProfile;
  }
}

/**
 * Retrieves the stored UserProfile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) {
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      uid,
      displayName: data.displayName ?? null,
      email: data.email ?? null,
      photoURL: data.photoURL ?? null,
      createdAt: data.createdAt ? (data.createdAt.toMillis?.() ?? data.createdAt) : Date.now(),
      updatedAt: data.updatedAt ? (data.updatedAt.toMillis?.() ?? data.updatedAt) : Date.now(),
      moviesWatched: data.moviesWatched ?? 0,
      theatresHosted: data.theatresHosted ?? 0,
      watchHours: data.watchHours ?? 0,
    };
  } catch (err) {
    console.warn('[VCinema User Profile] Could not fetch profile from Firestore:', err);
    return null;
  }
}

/**
 * Updates partial fields of the user profile document.
 */
export async function updateUserProfile(
  uid: string,
  partial: Partial<Pick<UserProfile, 'displayName' | 'photoURL'>>
): Promise<void> {
  if (!isFirebaseConfigured) return;

  try {
    const userDocRef = doc(db, 'users', uid);
    const sanitizedUpdate: Record<string, string | null | FieldValue> = {
      updatedAt: serverTimestamp(),
    };
    if (partial.displayName !== undefined) {
      sanitizedUpdate.displayName = partial.displayName ?? null;
    }
    if (partial.photoURL !== undefined) {
      sanitizedUpdate.photoURL = partial.photoURL ?? null;
    }
    await updateDoc(userDocRef, sanitizedUpdate);
  } catch (err) {
    console.warn('[VCinema User Profile] Failed to update Firestore profile:', err);
  }
}
