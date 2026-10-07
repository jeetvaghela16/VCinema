import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="h-screen w-screen flex flex-col items-center justify-center bg-vc-bg-base text-vc-gold space-y-4"
        role="status"
        aria-label="Verifying credentials"
      >
        <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-vc-gold/30 animate-ping opacity-30" />
          <div className="w-12 h-12 rounded-full bg-vc-bg-card border border-vc-gold flex items-center justify-center font-serif text-2xl font-bold">
            V
          </div>
        </div>
        <p className="text-xs font-mono tracking-[0.25em] text-vc-text-muted uppercase">
          Verifying Auditorium Access...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to /login while preserving intended location in history state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
