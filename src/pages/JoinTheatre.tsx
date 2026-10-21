import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTheatreByCode, getTheatreById } from '../services/theatreService';
import type { LiveTheatreRoom } from '../types/theatre';
import { verifyRoomPassword } from '../utils/crypto';

/**
 * Intelligent parser to extract auditorium code or room ID from any input:
 * - Direct codes: "VCX-7K9M2Q", "7K9M2Q"
 * - Invite links: "http://localhost:5173/join-theatre?code=VCX-7K9M2Q"
 * - Direct theatre URLs: "http://localhost:5173/theatre/KrKK6sy7JvSggq0qGOjl"
 * - Raw Firestore room IDs: "KrKK6sy7JvSggq0qGOjl"
 */
function parseAuditoriumInput(input: string): { code?: string; roomId?: string } {
  const trimmed = input.trim();
  if (!trimmed) return {};

  const lower = trimmed.toLowerCase();

  // Check if it looks like a URL or path
  if (
    lower.includes('http://') ||
    lower.includes('https://') ||
    lower.includes('/theatre/') ||
    lower.includes('/join-theatre') ||
    lower.includes('code=') ||
    lower.includes('localhost') ||
    lower.includes('.app')
  ) {
    // Check ?code= query param
    const codeMatch = trimmed.match(/[?&]code=([a-zA-Z0-9_-]+)/i);
    if (codeMatch && codeMatch[1]) {
      return { code: codeMatch[1].trim().toUpperCase() };
    }

    // Check /theatre/:id
    const theatreMatch = trimmed.match(/\/theatre\/([a-zA-Z0-9_-]+)/i);
    if (theatreMatch && theatreMatch[1]) {
      return { roomId: theatreMatch[1].trim(), code: theatreMatch[1].trim().toUpperCase() };
    }

    try {
      const urlString = lower.startsWith('http') ? trimmed : `http://${trimmed}`;
      const url = new URL(urlString);

      const paramCode = url.searchParams.get('code');
      if (paramCode) {
        return { code: paramCode.trim().toUpperCase() };
      }

      const match = url.pathname.match(/\/theatre\/([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) {
        return { roomId: match[1], code: match[1].toUpperCase() };
      }
    } catch {
      // Fallback
    }
  }

  // Not a URL: Clean standard code or Firestore ID
  const clean = trimmed.replace(/\s+/g, '');
  if (clean.length <= 12) {
    return { code: clean.toUpperCase() };
  }

  return { roomId: clean, code: clean.toUpperCase() };
}

export default function JoinTheatre() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Unified admission input: accepts room codes, invite links, or direct theatre URLs
  const [admissionInput, setAdmissionInput] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [pendingRoomHash, setPendingRoomHash] = useState<string | null>(null);
  const [pendingLegacyPassword, setPendingLegacyPassword] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-populate if provided in query params (e.g. from invite link ?code=VCX-XXXXXX)
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      setAdmissionInput(urlCode.toUpperCase().trim());
    }
  }, [searchParams]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const raw = admissionInput.trim();
    if (!raw) {
      setErrorMessage('Please enter an auditorium room code or paste your invitation link.');
      return;
    }

    const parsed = parseAuditoriumInput(raw);
    setIsSearching(true);

    try {
      let room: LiveTheatreRoom | null = null;

      // 1. Try lookup by room code (e.g. "VCX-7K9M2Q")
      if (parsed.code) {
        room = await getTheatreByCode(parsed.code);
      }

      // 2. If not found by code, try by direct room ID (e.g. from /theatre/:id)
      if (!room && parsed.roomId) {
        room = await getTheatreById(parsed.roomId);
      }

      // 3. Fallback: try raw input directly as Firestore room ID
      if (!room && raw.length > 10) {
        room = await getTheatreById(raw);
      }

      if (!room) {
        setErrorMessage(
          `No active auditorium found for "${raw}". Please verify the code or ask the host for a valid screening link.`
        );
        return;
      }

      // Check if locked by host
      if (room.isLocked) {
        setErrorMessage('This auditorium is currently locked by the host to prevent mid-screening interruptions.');
        return;
      }

      // Check if password protected
      if (room.isPasswordProtected && (room.passwordHash || room.password)) {
        setPasswordRequired(true);
        setPendingRoomId(room.id);
        setPendingRoomHash(room.passwordHash || null);
        setPendingLegacyPassword(room.password || null);
        return;
      }

      // Navigate to live theatre screening room
      navigate(`/theatre/${room.id}`);
    } catch {
      setErrorMessage('Network error while locating auditorium. Please check your connection and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRoomId) return;

    const isValid = await verifyRoomPassword(
      password,
      pendingRoomId,
      pendingRoomHash,
      pendingLegacyPassword
    );

    if (isValid) {
      navigate(`/theatre/${pendingRoomId}`);
    } else {
      setErrorMessage('Incorrect password for this private screening.');
    }
  };

  return (
    <div className="pt-[72px]">
      <div className="max-w-2xl mx-auto px-6 md:px-10 pt-8 pb-6 sm:pb-8">
        {/* Header */}
        <div className="section-divider mb-0">
          <h1 className="font-sans text-[11px] font-semibold tracking-[0.25em] text-vc-gold uppercase">
            The Grand Foyer
          </h1>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-vc-text-primary mt-3 mb-2">
          Join a Theatre
        </h2>
        <p className="text-vc-text-muted text-sm mb-6">
          Enter an auditorium room code, paste an invite link, or enter a direct screening URL.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-[4px] bg-vc-burgundy/20 border border-vc-burgundy/50 text-vc-text-primary text-xs flex items-center gap-2 animate-slide-down">
            <span>⚠</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="glass-panel rounded-[6px] p-6 sm:p-8 mb-0 border border-vc-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {passwordRequired ? (
            /* Passcode Verification Screen */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <span className="text-3xl mb-2 block">🔒</span>
                <h3 className="font-serif text-xl text-vc-text-primary">Private Auditorium</h3>
                <p className="text-xs text-vc-text-muted mt-1">
                  This screening requires a password issued by the host.
                </p>
              </div>

              <div>
                <label htmlFor="theatre-password" className="block text-xs font-mono uppercase tracking-widest text-vc-text-muted mb-2">
                  Auditorium Password
                </label>
                <input
                  id="theatre-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
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
              {/* Unified admission input */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="admission-input" className="block text-xs font-semibold text-vc-text-muted uppercase tracking-widest">
                    Room Code or Invitation Link
                  </label>
                  <span className="text-[10px] font-mono text-vc-gold/70">
                    Auto-Detects Links & Codes
                  </span>
                </div>
                <input
                  id="admission-input"
                  type="text"
                  value={admissionInput}
                  onChange={(e) => {
                    setAdmissionInput(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="VCX-XXXXXX or paste link (http://...)"
                  className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-5 py-4 text-base sm:text-lg font-mono text-center text-vc-text-primary placeholder-vc-text-muted/40 tracking-[0.05em] focus:border-vc-gold/60 focus:outline-none transition-colors selection:bg-vc-gold selection:text-black"
                  autoComplete="off"
                  autoFocus
                  aria-describedby="code-hint"
                />
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-vc-text-muted font-mono">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Code: VCX-XXXXXX</span>
                  <span className="text-white/20">&bull;</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Invite Link</span>
                  <span className="text-white/20">&bull;</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Direct URL</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-4 bg-vc-gold text-black text-sm font-semibold rounded-[4px] text-center hover:bg-vc-gold/90 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(198,167,106,0.3)] disabled:opacity-50 font-mono tracking-wider uppercase"
              >
                {isSearching ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Locating Auditorium...</span>
                  </>
                ) : (
                  <span>Admit to Live Screening &rarr;</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
