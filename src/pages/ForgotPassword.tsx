import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isFirebaseConfigured } from '../lib/firebase/config';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resetPassword, error: authError, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!isFirebaseConfigured) {
      setLocalError('Firebase is not configured. Please create .env.local with your Firebase project credentials to send password reset links.');
      return;
    }

    if (!email.trim()) {
      setLocalError('Please enter the email associated with your VCinema account.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch {
      // Error handled via AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || authError;

  return (
    <div className="min-h-screen pt-[72px] flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden bg-vc-bg-base">
      {/* Background Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 30%, rgba(198, 167, 106, 0.08) 0%, transparent 60%),
            linear-gradient(180deg, #080807 0%, #0d0c0a 100%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-md glass-panel rounded-[6px] border border-vc-border/80 shadow-[0_24px_60px_rgba(0,0,0,0.8)] p-8 sm:p-10">
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
            Reset Passkey
          </h1>
          <p className="text-xs text-vc-text-muted mt-1.5 leading-relaxed">
            Enter your account email to receive an authorized passkey recovery dispatch.
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
                Create a <code className="text-vc-gold-dim">.env.local</code> file using <code className="text-vc-gold-dim">.env.example</code> with your Firebase project keys to enable recovery dispatch.
              </p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {isSuccess ? (
          <div className="space-y-6">
            <div className="p-4 rounded-[4px] bg-vc-gold/10 border border-vc-gold/30 text-xs text-vc-text-primary space-y-2">
              <div className="flex items-center gap-2 font-semibold text-vc-gold">
                <span>✓</span>
                <span>Reset Dispatch Transmitted</span>
              </div>
              <p className="text-vc-text-muted leading-relaxed">
                If an authorized account exists for <strong className="text-vc-text-primary">{email}</strong>, you will receive password reset instructions shortly.
              </p>
            </div>

            <Link
              to="/login"
              className="block w-full py-3.5 bg-vc-gold text-black font-semibold text-xs font-mono tracking-widest uppercase rounded-[4px] text-center hover:bg-vc-gold/90 transition-all shadow-[0_4px_20px_rgba(198,167,106,0.3)]"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <>
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

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-[11px] font-mono tracking-widest text-vc-text-muted uppercase mb-1.5"
                >
                  Cinema Account Email
                </label>
                <input
                  id="forgot-email"
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-vc-gold text-black font-semibold text-xs font-mono tracking-widest uppercase rounded-[4px] hover:bg-vc-gold/90 transition-all duration-200 active:scale-[0.99] shadow-[0_4px_20px_rgba(198,167,106,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <span>Transmit Reset Dispatch</span>
                  )}
                </button>
              </div>
            </form>

            <p className="text-center text-xs text-vc-text-muted mt-8">
              Remember your passkey?{' '}
              <Link to="/login" className="text-vc-gold hover:underline font-medium">
                Sign in here &rarr;
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
