import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { recentTheatres } from '../data/theatres';
import { getTheatreByCode } from '../services/theatreService';

export default function JoinTheatre() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [code, setCode] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [pendingPassword, setPendingPassword] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-populate code if provided in query params (e.g. from invite link)
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      setCode(urlCode.toUpperCase().trim());
    }
  }, [searchParams]);

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 10);
    setCode(val);
    setErrorMessage(null);
  };

  const extractCodeFromInput = (): string => {
    if (code.trim()) return code.trim();
    if (linkInput.trim()) {
      try {
        const url = new URL(linkInput.trim());
        const paramCode = url.searchParams.get('code');
        if (paramCode) return paramCode.toUpperCase();
        // check path /theatre/:id
        const parts = url.pathname.split('/');
        return parts[parts.length - 1].toUpperCase();
      } catch {
        return linkInput.trim().toUpperCase();
      }
    }
    return '';
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetCode = extractCodeFromInput();
    if (!targetCode) {
      setErrorMessage('Please enter an auditorium code or paste an invitation link.');
      return;
    }

    setIsSearching(true);

    try {
      const room = await getTheatreByCode(targetCode);
      if (!room) {
        setErrorMessage(`No active auditorium found for code "${targetCode}". Please verify your ticket.`);
        return;
      }

      // Check if password protected
      if (room.isPasswordProtected && room.password) {
        setPasswordRequired(true);
        setPendingRoomId(room.id);
        setPendingPassword(room.password);
        return;
      }

      // Navigate to live theatre
      navigate(`/theatre/${room.id}`);
    } catch {
      setErrorMessage('Network error while locating auditorium. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === pendingPassword && pendingRoomId) {
      navigate(`/theatre/${pendingRoomId}`);
    } else {
      setErrorMessage('Incorrect passkey for this private screening.');
    }
  };

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="max-w-2xl mx-auto px-6 md:px-10 pt-12 pb-20">
        {/* Header */}
        <div className="section-divider mb-0">
          <h1 className="font-sans text-[11px] font-semibold tracking-[0.25em] text-vc-gold uppercase">
            Admission Box Office
          </h1>
        </div>
        <h2 className="font-serif text-4xl md:text-5xl text-vc-text-primary mt-4 mb-2">
          Join a Theatre
        </h2>
        <p className="text-vc-text-muted text-sm mb-10">
          Enter an auditorium room code or paste an invitation link to enter the synchronized screening.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-[4px] bg-vc-burgundy/20 border border-vc-burgundy/50 text-vc-text-primary text-xs flex items-center gap-2 animate-slide-down">
            <span>⚠</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="glass-panel rounded-[6px] p-8 mb-8 border border-vc-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {passwordRequired ? (
            /* Passcode Verification Screen */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <span className="text-3xl mb-2 block">🔒</span>
                <h3 className="font-serif text-xl text-vc-text-primary">Private Auditorium</h3>
                <p className="text-xs text-vc-text-muted mt-1">
                  This screening requires a passkey issued by the host.
                </p>
              </div>

              <div>
                <label htmlFor="theatre-passkey" className="block text-xs font-mono uppercase tracking-widest text-vc-text-muted mb-2">
                  Auditorium Passkey
                </label>
                <input
                  id="theatre-passkey"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passkey"
                  autoFocus
                  required
                  className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3 text-sm text-vc-text-primary focus:border-vc-gold/60 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordRequired(false)}
                  className="w-1/3 py-3 border border-vc-border text-xs font-mono text-vc-text-muted rounded-[4px] hover:text-vc-text-primary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-vc-gold text-black text-xs font-mono font-semibold rounded-[4px] hover:bg-vc-gold/90 transition-all"
                >
                  Enter Screening &rarr;
                </button>
              </div>
            </form>
          ) : (
            /* Standard Admission Form */
            <form onSubmit={handleJoin}>
              {/* Room code input */}
              <div className="mb-6">
                <label htmlFor="room-code" className="block text-xs font-semibold text-vc-text-muted uppercase tracking-widest mb-3">
                  Room Code
                </label>
                <input
                  id="room-code"
                  type="text"
                  value={code}
                  onChange={handleCodeInput}
                  placeholder="VCX-XXXXXX"
                  className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-5 py-4 text-2xl font-mono text-center text-vc-text-primary placeholder-vc-text-muted/30 tracking-[0.3em] focus:border-vc-gold/50 focus:outline-none transition-colors"
                  autoComplete="off"
                  aria-describedby="code-hint"
                />
                <p id="code-hint" className="text-[11px] text-vc-text-muted mt-2 text-center font-mono">
                  Format: VCX-XXXXXX (e.g. VCX-7K9M2Q)
                </p>
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-[1px] bg-vc-border" />
                <span className="text-xs text-vc-text-muted">or</span>
                <div className="flex-1 h-[1px] bg-vc-border" />
              </div>

              {/* Invite link input */}
              <div className="mb-8">
                <label htmlFor="invite-link" className="block text-xs font-semibold text-vc-text-muted uppercase tracking-widest mb-3">
                  Paste Invite Link
                </label>
                <input
                  id="invite-link"
                  type="url"
                  value={linkInput}
                  onChange={(e) => {
                    setLinkInput(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="https://vcinema.app/join-theatre?code=..."
                  className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3 text-sm text-vc-text-primary placeholder-vc-text-muted focus:border-vc-gold/50 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-4 bg-vc-gold text-black text-sm font-semibold rounded-[4px] text-center hover:bg-vc-gold/90 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(198,167,106,0.3)] disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Locating Auditorium...</span>
                  </>
                ) : (
                  <span>Admit to Live Screening</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Demo Fallback Option */}
        <div className="text-center mb-10">
          <Link
            to="/theatre/demo"
            className="text-xs font-mono text-vc-text-muted hover:text-vc-gold transition-colors inline-flex items-center gap-1.5"
          >
            <span>Explore Virtual Cinema in Sandbox Demo Mode</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Recent Theatres */}
        <div>
          <h3 className="text-xs font-semibold text-vc-text-muted uppercase tracking-widest mb-4">
            Auditorium Previews
          </h3>
          <div className="flex flex-col gap-3">
            {recentTheatres.map((theatre) => (
              <Link
                to="/theatre/demo"
                key={theatre.id}
                className="glass-panel rounded-[4px] p-4 flex items-center justify-between hover:border-vc-border-strong transition-all group"
                aria-label={`View demo for ${theatre.name}`}
              >
                <div>
                  <p className="text-sm font-medium text-vc-text-primary mb-0.5">{theatre.name}</p>
                  <p className="text-xs text-vc-text-muted">
                    {theatre.code} &middot; {theatre.participantCount} watching &middot;{' '}
                    <span className="italic">{theatre.currentMovie}</span>
                  </p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-vc-text-muted group-hover:text-vc-gold group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
