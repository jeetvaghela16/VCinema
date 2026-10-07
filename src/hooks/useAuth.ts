import { useContext } from 'react';
import { AuthContext } from '../context/authContextDef';
import type { AuthContextValue } from '../types/auth';

/**
 * Custom hook to access the VCinema authentication context.
 * Throws a helpful error if used outside an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }

  return context;
}
