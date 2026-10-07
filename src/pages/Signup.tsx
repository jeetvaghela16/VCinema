import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isFirebaseConfigured } from '../lib/firebase/config';

export default function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp, signInWithGoogle, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const validate = (): boolean => {
    if (!isFirebaseConfigured) {
      setLocalError('Firebase is not configured. Please create .env.local with your Firebase project credentials to register.');
      return false;
    }
    if (!displayName.trim()) {
      setLocalError('Please enter a display name for your theatre profile.');
      return false;
    }
    if (!email.trim()) {
      setLocalError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setLocalError('Please choose a password.');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError('Password confirmation does not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signUp(email, password, displayName);
      navigate(from, { replace: true });
    } catch {
      // Error is caught and surfaced through AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();

    if (!isFirebaseConfigured) {
      setLocalError('Firebase is not configured. Please create .env.local with your Firebase project credentials to register.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch {
      // Error caught by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || authError;

  return (
    <div className="min-h-screen pt-[72px] flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden bg-vc-bg-base">
      {/* Background Cinematic Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 25%, rgba(198, 167, 106, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(111, 32, 40, 0.12) 0%, transparent 50%),
            linear-gradient(180deg, #080807 0%, #0d0c0a 100%)
          `,
        }}
      />

      {/* Main Signup Card */}
      <div className="relative z-10 w-full max-w-md glass-panel rounded-[6px] border border-vc-border/80 shadow-[0_24px_60px_rgba(0,0,0,0.8)] p-8 sm:p-10">
        {/* Branding & Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-baseline gap-1 group mb-4 select-none"
            aria-label="VCinema Home"
          >
            <span className="font-serif text-3xl font-bold text-vc-gold leading-none group-hover:scale-105 transition-transform">
              V
            </span>
            <span className="font-sans text-xl font-light text-vc-text-primary tracking-[0.1em]">
              Cinema
            </span>
          </Link>

          <h1 className="font-serif text-2xl sm:text-3xl text-vc-text-primary font-semibold tracking-wide">
            Claim Your Seat
          </h1>
          <p className="text-xs text-vc-text-muted mt-1.5 leading-relaxed">
            Create an account to host synchronized screening rooms and invite friends to private virtual theatres.
          </p>
        </div>

        {/* Configuration Notice if .env.local is missing */}
        {!isFirebaseConfigured && (
          <div
            className="mb-6 p-3.5 rounded-[4px] bg-vc-gold/10 border border-vc-gold/40 text-vc-text-primary text-xs flex items-start gap-2.5 animate-slide-down"
            role="note"
          >
            <span className="text-sm text-vc-gold leading-none" aria-hidden="true">
              ℹ
            </span>
            <div className="leading-snug flex-1 space-y-1">
              <p className="font-semibold text-vc-gold">Firebase Setup Required</p>
              <p className="text-vc-text-muted text-[11px]">
                Create a <code className="text-vc-gold-dim">.env.local</code> file using <code className="text-vc-gold-dim">.env.example</code> with your Firebase project keys to enable registration.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {activeError && (
          <div
            className="mb-6 p-3.5 rounded-[4px] bg-vc-burgundy/20 border border-vc-burgundy/50 text-vc-text-primary text-xs flex items-start gap-2.5 animate-slide-down"
            role="alert"
          >
            <span className="text-sm leading-none" aria-hidden="true">
              ⚠
            </span>
            <span className="leading-snug flex-1">{activeError}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Display Name */}
          <div>
            <label
              htmlFor="signup-name"
              className="block text-[11px] font-mono tracking-widest text-vc-text-muted uppercase mb-1.5"
            >
              Auditorium Display Name
            </label>
            <input
              id="signup-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. CinemaLover"
              maxLength={32}
              required
              disabled={isSubmitting}
              className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3 text-sm text-vc-text-primary placeholder-vc-text-muted/40 focus:border-vc-gold/60 focus:outline-none transition-colors shadow-inner"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="signup-email"
              className="block text-[11px] font-mono tracking-widest text-vc-text-muted uppercase mb-1.5"
            >
              Cinema Pass Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="viewer@vcinema.app"
              autoComplete="email"
              required
              disabled={isSubmitting}
              className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3 text-sm text-vc-text-primary placeholder-vc-text-muted/40 focus:border-vc-gold/60 focus:outline-none transition-colors shadow-inner"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="signup-password"
              className="block text-[11px] font-mono tracking-widest text-vc-text-muted uppercase mb-1.5"
            >
              Passkey (Minimum 6 characters)
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3 text-sm text-vc-text-primary placeholder-vc-text-muted/40 focus:border-vc-gold/60 focus:outline-none transition-colors shadow-inner"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="signup-confirm"
              className="block text-[11px] font-mono tracking-widest text-vc-text-muted uppercase mb-1.5"
            >
              Confirm Passkey
            </label>
            <input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3 text-sm text-vc-text-primary placeholder-vc-text-muted/40 focus:border-vc-gold/60 focus:outline-none transition-colors shadow-inner"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-vc-gold text-black font-semibold text-xs font-mono tracking-widest uppercase rounded-[4px] hover:bg-vc-gold/90 transition-all duration-200 active:scale-[0.99] shadow-[0_4px_20px_rgba(198,167,106,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Initialize Cinema Account</span>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-vc-border/70" />
          </div>
          <span className="relative px-3 bg-[#131210] text-[10px] font-mono tracking-widest text-vc-text-muted uppercase">
            Or Register With
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-3 rounded-[4px] border border-vc-border hover:border-vc-gold/40 bg-vc-bg-card/70 hover:bg-vc-bg-card text-vc-text-primary text-xs font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.2 8.9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.1L1.6 16.1C3.5 20 7.4 23 12 23z"
            />
          </svg>
          <span className="group-hover:text-vc-gold transition-colors">
            Continue with Google
          </span>
        </button>

        {/* Footer Link */}
        <p className="text-center text-xs text-vc-text-muted mt-8">
          Already hold a pass?{' '}
          <Link
            to="/login"
            state={{ from: location.state?.from }}
            className="text-vc-gold hover:underline font-medium"
          >
            Sign in here &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
