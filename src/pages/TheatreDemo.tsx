import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import type { ChatMessage, Participant } from '../types';

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', userId: 'u1', userName: 'Neon', message: 'This cinematography is insane 🎬', timestamp: '0:55:02' },
  { id: '2', userId: 'u2', userName: 'Aria', message: 'The score is doing so much here', timestamp: '0:55:18' },
  { id: '3', userId: 'u3', userName: 'Marcus', message: 'That shot in the valley last scene wow', timestamp: '0:56:04' },
  { id: '4', userId: 'u1', userName: 'Neon', message: 'Pause at the window scene, just incredible', timestamp: '0:56:30' },
  { id: '5', userId: 'u4', userName: 'Leila', message: 'Easily top 3 this year', timestamp: '0:57:11' },
  { id: '6', userId: 'u2', userName: 'Aria', message: '💯', timestamp: '0:57:45' },
];

const MOCK_PARTICIPANTS: Participant[] = [
  { id: 'u1', name: 'Neon', isHost: true, isOnline: true },
  { id: 'u2', name: 'Aria', isHost: false, isOnline: true },
  { id: 'u3', name: 'Marcus', isHost: false, isOnline: true },
  { id: 'u4', name: 'Leila', isHost: false, isOnline: false },
];

export default function TheatreDemo() {
  const [isHost, setIsHost] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(80);

  return (
    <div className="fixed inset-0 bg-[#050504] flex flex-col overflow-hidden" aria-label="VCinema Theatre">
      {/* ── TOP BAR ── */}
      <header className="flex items-center justify-between px-4 md:px-6 h-12 bg-black/80 border-b border-white/5 backdrop-blur-sm flex-shrink-0 z-10">
        {/* Logo */}
        <Link to="/" className="flex items-baseline gap-0.5" aria-label="Exit to VCinema home">
          <span className="font-serif text-lg font-bold text-vc-gold">V</span>
          <span className="font-sans text-xs font-light text-vc-text-muted tracking-[0.08em]">Cinema</span>
        </Link>

        {/* Room info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-widest text-vc-text-muted uppercase">Room</span>
            <span className="text-xs font-mono font-bold text-vc-gold tracking-wider">VCX-4821</span>
          </div>
          <div className="h-3 w-[1px] bg-white/10" aria-hidden="true" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            <span className="text-[10px] text-vc-text-muted">4 watching</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Host toggle for demo */}
          <button
            onClick={() => setIsHost((v) => !v)}
            className="text-[10px] px-2.5 py-1 rounded-[2px] border border-vc-border text-vc-text-muted hover:text-vc-gold hover:border-vc-gold/40 transition-all"
            title="Toggle host view (demo only)"
          >
            {isHost ? '👑 Host Mode' : 'Viewer Mode'}
          </button>
          <Link
            to="/"
            className="text-[10px] px-3 py-1.5 rounded-[2px] border border-vc-burgundy/60 text-vc-burgundy/80 hover:bg-vc-burgundy/10 transition-all"
          >
            Leave
          </Link>
        </div>
      </header>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Screen + controls */}
        <div className="flex-1 flex flex-col">
          {/* Cinema screen */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 relative">
            <div
              className="w-full max-w-5xl aspect-video rounded-[2px] relative overflow-hidden"
              style={{
                boxShadow: '0 0 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
              }}
              aria-label="Cinema screen — demo placeholder"
            >
              {/* Cinematic gradient "film" */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(ellipse 80% 60% at 70% 40%, #1c2b3a 0%, transparent 70%),
                    radial-gradient(ellipse 60% 80% at 20% 60%, #1a0a2e 0%, transparent 60%),
                    linear-gradient(160deg, #0d1520 0%, #080807 100%)
                  `,
                }}
                aria-hidden="true"
              />

              {/* Scanline effect */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.025]"
                aria-hidden="true"
                style={{
                  backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)',
                }}
              />

              {/* Playing indicator light */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', isPlaying ? 'bg-red-500 animate-pulse' : 'bg-white/20')} aria-hidden="true" />
                <span className="text-[10px] text-white/40 font-mono">
                  {isPlaying ? 'LIVE' : 'PAUSED'}
                </span>
              </div>

              {/* Demo watermark */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                aria-hidden="true"
              >
                <span
                  className="text-white/[0.04] font-serif text-6xl md:text-8xl font-bold tracking-widest"
                  style={{ transform: 'rotate(-15deg)' }}
                >
                  DEMO
                </span>
              </div>

              {/* Film title overlay */}
              <div className="absolute bottom-6 left-6">
                <p className="text-[10px] text-white/30 font-mono mb-1">0:58:14 / 2:18:00</p>
                <p className="text-sm font-serif text-white/50">The Grand Horizon</p>
              </div>

              {/* Viewer notice */}
              {!isHost && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-[2px] border border-white/10">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-vc-gold" aria-hidden="true">
                    <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
                    <path d="M19 21a7 7 0 0 0-14 0" />
                  </svg>
                  <span className="text-[10px] text-vc-text-muted">Playback controlled by Host</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls bar */}
          <div className="flex-shrink-0 px-4 md:px-8 pb-4">
            <div
              className="max-w-5xl mx-auto glass-panel rounded-[4px] px-4 md:px-6 py-4"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              {/* Progress bar */}
              <div className="mb-3">
                <div
                  className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                  role="progressbar"
                  aria-valuenow={42}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Playback progress: 42%"
                >
                  <div
                    className="h-full bg-vc-gold/80 rounded-full relative group-hover:bg-vc-gold transition-colors"
                    style={{ width: '42%' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Left controls */}
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={() => isHost && setIsPlaying((v) => !v)}
                    disabled={!isHost}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center rounded-full transition-all',
                      isHost
                        ? 'text-white hover:bg-white/10 hover:text-vc-gold'
                        : 'text-white/30 cursor-not-allowed',
                    )}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    title={!isHost ? 'Only the host can control playback' : undefined}
                  >
                    {isPlaying ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    )}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <button
                      className="text-white/60 hover:text-white transition-colors"
                      aria-label="Toggle mute"
                      onClick={() => setVolume((v) => (v > 0 ? 0 : 80))}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        {volume > 0 ? (
                          <>
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                          </>
                        ) : (
                          <>
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <line x1="23" y1="9" x2="17" y2="15" />
                            <line x1="17" y1="9" x2="23" y2="15" />
                          </>
                        )}
                      </svg>
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-20 accent-vc-gold hidden md:block"
                      aria-label={`Volume: ${volume}%`}
                    />
                  </div>

                  {/* Time */}
                  <span className="text-[11px] font-mono text-white/50">0:58:14 / 2:18:00</span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                  {/* Chat toggle */}
                  <button
                    onClick={() => setChatOpen((v) => !v)}
                    className={cn(
                      'flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-[2px] border transition-all',
                      chatOpen
                        ? 'border-vc-gold/40 text-vc-gold bg-vc-gold/5'
                        : 'border-white/10 text-white/50 hover:border-white/20',
                    )}
                    aria-label={chatOpen ? 'Hide chat' : 'Show chat'}
                    aria-expanded={chatOpen}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Chat
                  </button>

                  {/* Fullscreen */}
                  <button className="text-white/40 hover:text-white transition-colors" aria-label="Fullscreen">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Host controls */}
              {isHost && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] text-vc-gold font-semibold uppercase tracking-widest flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                    </svg>
                    Host Controls
                  </span>
                  {[
                    { label: 'Sync Viewers', icon: '⟳' },
                    { label: 'Change Film', icon: '🎬' },
                    { label: 'Lock Room', icon: '🔒' },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="text-[11px] px-3 py-1 rounded-[2px] border border-vc-border text-vc-text-muted hover:border-vc-gold/40 hover:text-vc-gold transition-all"
                      onClick={() => alert(`${action.label} — coming in a future release.`)}
                    >
                      {action.icon} {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Participants strip */}
          <div className="flex-shrink-0 px-4 md:px-8 pb-4">
            <div className="max-w-5xl mx-auto flex items-center gap-4 overflow-x-auto">
              {MOCK_PARTICIPANTS.map((p) => (
                <div key={p.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                        p.isHost ? 'bg-vc-gold/15 border border-vc-gold/40 text-vc-gold' : 'bg-vc-bg-card border border-vc-border text-vc-text-muted',
                      )}
                    >
                      {p.name[0]}
                    </div>
                    <div
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#050504]',
                        p.isOnline ? 'bg-green-500' : 'bg-vc-text-muted/40',
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-vc-text-muted leading-none">{p.name}</p>
                    {p.isHost && (
                      <span className="text-[9px] text-vc-gold font-semibold tracking-widest uppercase">Host</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CHAT DRAWER ── */}
        {chatOpen && (
          <aside
            className="w-72 lg:w-80 flex-shrink-0 border-l border-white/5 flex flex-col bg-black/50 backdrop-blur-sm animate-slide-down"
            aria-label="Theatre chat"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h2 className="text-xs font-semibold text-vc-text-muted uppercase tracking-widest">Theatre Chat</h2>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white/30 hover:text-white/60 transition-colors"
                aria-label="Close chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {MOCK_MESSAGES.map((msg) => {
                const participant = MOCK_PARTICIPANTS.find((p) => p.id === msg.userId);
                return (
                  <div key={msg.id} className="flex gap-2.5">
                    <div
                      className={cn(
                        'w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-semibold mt-0.5',
                        participant?.isHost
                          ? 'bg-vc-gold/10 border border-vc-gold/30 text-vc-gold'
                          : 'bg-vc-bg-card border border-vc-border text-vc-text-muted',
                      )}
                      aria-hidden="true"
                    >
                      {msg.userName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span className={cn('text-[11px] font-semibold', participant?.isHost ? 'text-vc-gold' : 'text-vc-text-primary')}>
                          {msg.userName}
                        </span>
                        <span className="text-[10px] text-white/20 font-mono">{msg.timestamp}</span>
                      </div>
                      <p className="text-xs text-vc-text-muted leading-relaxed break-words">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Disabled input */}
            <div className="px-4 pb-4">
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-[3px] border border-white/5 bg-white/3 cursor-not-allowed"
                role="presentation"
                aria-label="Chat input disabled in demo mode"
              >
                <span className="text-[11px] text-white/25 flex-1">Join to chat...</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/15" aria-hidden="true">
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22 11 13 2 9l20-7z" />
                </svg>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
