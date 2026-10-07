import { useState } from 'react';
import { Link } from 'react-router-dom';
import { recentTheatres } from '../data/theatres';

export default function JoinTheatre() {
  const [code, setCode] = useState('');
  const [linkInput, setLinkInput] = useState('');

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
    setCode(val);
  };

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="max-w-2xl mx-auto px-6 md:px-10 pt-12 pb-20">
        {/* Header */}
        <div className="section-divider mb-0">
          <h1 className="font-sans text-[11px] font-semibold tracking-[0.25em] text-vc-gold uppercase">
            Theatre
          </h1>
        </div>
        <h2 className="font-serif text-4xl md:text-5xl text-vc-text-primary mt-4 mb-2">
          Join a Theatre
        </h2>
        <p className="text-vc-text-muted text-sm mb-10">
          Enter a room code or paste an invite link to join a live screening.
        </p>

        <div className="glass-panel rounded-[6px] p-8 mb-8">
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
              placeholder="VCX-0000"
              className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-5 py-4 text-2xl font-mono text-center text-vc-text-primary placeholder-vc-text-muted/30 tracking-[0.3em] focus:border-vc-gold/50 focus:outline-none transition-colors"
              autoComplete="off"
              aria-describedby="code-hint"
            />
            <p id="code-hint" className="text-[11px] text-vc-text-muted mt-2 text-center">
              Format: VCX-0000 (case insensitive)
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
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="https://vcinema.app/join/..."
              className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3 text-sm text-vc-text-primary placeholder-vc-text-muted focus:border-vc-gold/50 focus:outline-none transition-colors"
            />
          </div>

          <Link
            to="/theatre/demo"
            className="block w-full py-3.5 bg-vc-gold text-black text-sm font-semibold rounded-[4px] text-center hover:bg-vc-gold/90 transition-all duration-200 active:scale-[0.99]"
            aria-label="Join theatre (demo)"
          >
            Join Theatre
          </Link>
        </div>

        {/* Recent theatres */}
        <div>
          <h3 className="text-xs font-semibold text-vc-text-muted uppercase tracking-widest mb-4">
            Recent Theatres
          </h3>
          <div className="flex flex-col gap-3">
            {recentTheatres.map((theatre) => (
              <Link
                to="/theatre/demo"
                key={theatre.id}
                className="glass-panel rounded-[4px] p-4 flex items-center justify-between hover:border-vc-border-strong transition-all group"
                aria-label={`Rejoin ${theatre.name}`}
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
