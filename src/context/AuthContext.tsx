import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthenticatedUser, AuthContextValue } from '../types/auth';
import type { UserProfile } from '../types/user';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  sendPasswordReset,
  subscribeToAuthChanges,
} from '../lib/firebase/auth';
import { syncUserProfile } from '../services/userService';
import { formatAuthError } from '../lib/firebase/errors';
import { AuthContext } from './authContextDef';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Listen to Firebase auth state changes on mount
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        try {
          const synced = await syncUserProfile(authUser);
          setProfile(synced);
        } catch {
          // Fallback if profile sync fails
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email Sign In
  const signIn = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await loginWithEmail(email, pass);
      setUser(authUser);
      try {
        const synced = await syncUserProfile(authUser);
        setProfile(synced);
      } catch (syncErr) {
        console.warn('[VCinema Auth] Profile sync non-blocking warning on signIn:', syncErr);
      }
    } catch (err: unknown) {
      const friendlyMessage = formatAuthError(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Email Sign Up
  const signUp = useCallback(async (email: string, pass: string, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await registerWithEmail(email, pass, displayName);
      setUser(authUser);
      try {
        const synced = await syncUserProfile(authUser);
        setProfile(synced);
      } catch (syncErr) {
        console.warn('[VCinema Auth] Profile sync non-blocking warning on signUp:', syncErr);
      }
    } catch (err: unknown) {
      const friendlyMessage = formatAuthError(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Google OAuth Sign In
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await loginWithGoogle();
      setUser(authUser);
      try {
        const synced = await syncUserProfile(authUser);
        setProfile(synced);
      } catch (syncErr) {
        console.warn('[VCinema Auth] Profile sync non-blocking warning on Google signIn:', syncErr);
      }
    } catch (err: unknown) {
      const friendlyMessage = formatAuthError(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser();
      setUser(null);
      setProfile(null);
    } catch (err: unknown) {
      const friendlyMessage = formatAuthError(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Password Reset
  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await sendPasswordReset(email);
    } catch (err: unknown) {
      const friendlyMessage = formatAuthError(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
