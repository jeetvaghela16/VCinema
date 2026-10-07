import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheatre } from '../hooks/useTheatre';
import { movies } from '../data/movies';
import { PosterArtwork } from '../components/cards/PosterArtwork';
import { formatTimecode } from '../services/theatreService';
import { cn } from '../utils/cn';

export default function TheatreRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    room,
    participants,
    messages,
    isLoading,
    error,
    isHost,
    play,
    pause,
    seek,
    changeMovie,
    sendMessage,
  } = useTheatre(roomId);

  const [chatOpen, setChatOpen] = useState(true);
  const [chatText, setChatText] = useState('');
  const [volume, setVolume] = useState(80);
  const [showFilmModal, setShowFilmModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [localTime, setLocalTime] = useState(0);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  // Sync local timer with room playback
  useEffect(() => {
    if (!room?.playback) return;

    setLocalTime(room.playback.currentTime);

    if (room.playback.isPlaying) {
      const interval = setInterval(() => {
        setLocalTime((prev) => {
          if (prev >= room.playback.duration) {
            return room.playback.duration;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [room?.playback?.currentTime, room?.playback?.isPlaying, room?.playback?.duration]);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Handle Chat Submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    const textToSend = chatText;
    setChatText('');
    await sendMessage(textToSend);
  };

  // Handle Copy Invite Link
  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/join-theatre?code=${room?.code || ''}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Handle Fullscreen
  const handleToggleFullscreen = () => {
    if (!screenRef.current) return;
    if (!document.fullscreenElement) {
      screenRef.current.requestFullscreen().catch((err) => {
        console.warn('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Error exiting fullscreen:', err);
      });
    }
  };

  // Handle Seek click
  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHost || !room?.playback?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = Math.round(percent * room.playback.duration);
    seek(targetSeconds);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050504] text-vc-gold space-y-3">
        <div className="w-12 h-12 rounded-full border border-vc-gold/40 bg-vc-bg-card flex items-center justify-center font-serif text-2xl font-bold animate-pulse shadow-[0_0_20px_rgba(198,167,106,0.2)]">
          V
        </div>
        <span className="text-[10px] font-mono tracking-[0.25em] text-vc-text-muted uppercase">
          Tuning Virtual Projection System...
        </span>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050504] px-6 text-center">
        <div className="w-14 h-14 rounded-full border border-vc-burgundy/60 bg-vc-burgundy/10 flex items-center justify-center font-serif text-2xl font-bold text-vc-gold mb-4">
          !
        </div>
        <h1 className="font-serif text-2xl text-vc-text-primary mb-2">Auditorium Unavailable</h1>
        <p className="text-vc-text-muted text-sm max-w-md mb-6">
          {error || 'This screening room could not be found or has concluded its session.'}
        </p>
        <Link
          to="/join-theatre"
          className="px-6 py-2.5 bg-vc-gold text-black font-semibold text-xs tracking-wider uppercase rounded-[4px] hover:bg-vc-gold/90 transition-all"
        >
          Return to Box Office
        </Link>
      </div>
    );
  }

  const currentMovie = movies.find((m) => m.id === room.playback.currentMovieId) ?? movies[0];
  const duration = room.playback.duration || 8280;
  const progressPercent = Math.min(100, Math.max(0, (localTime / duration) * 100));

  return (
    <div className="fixed inset-0 bg-[#050504] flex flex-col overflow-hidden select-none" aria-label="VCinema Auditorium">
      {/* ── COPIED TOAST ── */}
      {copiedToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-vc-gold text-black text-xs font-mono font-semibold px-4 py-2 rounded-[4px] shadow-[0_4px_20px_rgba(198,167,106,0.5)] animate-slide-down flex items-center gap-2">
          <span>✓</span>
          <span>Invite Link Copied to Clipboard ({room.code})</span>
        </div>
      )}

      {/* ── TOP NAV BAR ── */}
      <header className="flex items-center justify-between px-4 md:px-6 h-12 bg-black/90 border-b border-white/5 backdrop-blur-sm flex-shrink-0 z-20">
        {/* Logo & Auditorium Name */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-baseline gap-0.5 group" aria-label="Exit to VCinema home">
            <span className="font-serif text-lg font-bold text-vc-gold group-hover:scale-105 transition-transform">V</span>
            <span className="font-sans text-xs font-light text-vc-text-muted tracking-[0.08em]">Cinema</span>
          </Link>
          <div className="h-3 w-[1px] bg-white/10 hidden sm:block" aria-hidden="true" />
          <span className="text-xs font-serif text-vc-text-primary truncate max-w-[140px] sm:max-w-[200px] hidden sm:block">
            {room.name}
          </span>
        </div>

        {/* Room code & Online Count */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            title="Click to copy invite link"
          >
            <span className="text-[10px] font-mono tracking-widest text-vc-text-muted uppercase">Code</span>
            <span className="text-xs font-mono font-bold text-vc-gold tracking-wider group-hover:text-vc-gold-bright transition-colors">
              {room.code}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-vc-text-muted">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </button>

          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-mono text-vc-text-muted">
              {participants.length} watching
            </span>
          </div>
        </div>

        {/* Right actions: Invite & Leave */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyInvite}
            className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-[2px] border border-vc-gold/40 text-vc-gold hover:bg-vc-gold/10 transition-all"
          >
            + Invite
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-[10px] px-3 py-1 rounded-[2px] border border-vc-burgundy/60 text-vc-burgundy/90 hover:bg-vc-burgundy/15 transition-all font-mono uppercase tracking-wider"
          >
            Leave
          </button>
        </div>
      </header>

      {/* ── MAIN AUDITORIUM CANVAS ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Screen + Controls */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Cinema Screen Container */}
          <div className="flex-1 flex items-center justify-center p-3 sm:p-5 md:p-8 relative">
            <div
              ref={screenRef}
              className="w-full max-w-5xl aspect-video rounded-[3px] relative overflow-hidden bg-black flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)]"
              aria-label="Cinema screen"
            >
              {/* Dynamic Film Poster Atmosphere */}
              <div className="absolute inset-0 opacity-80 pointer-events-none">
                <PosterArtwork id={currentMovie.id} />
              </div>

              {/* Cinematic Vignette Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(5,5,4,0.85) 100%)',
                }}
              />

              {/* Scanline Subtle Effect */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)',
                }}
              />

              {/* Status Indicator (Top Left) */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-[3px] border border-white/10 z-10">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    room.playback.isPlaying ? 'bg-red-500 animate-pulse' : 'bg-white/30'
                  )}
                  aria-hidden="true"
                />
                <span className="text-[10px] font-mono tracking-widest text-white/80 uppercase">
                  {room.playback.isPlaying ? 'PROJECTION LIVE' : 'PAUSED'}
                </span>
              </div>

              {/* Host vs Viewer Badge (Top Right) */}
              <div className="absolute top-4 right-4 z-10">
                {isHost ? (
                  <div className="flex items-center gap-1.5 bg-vc-gold/15 backdrop-blur-md px-3 py-1.5 rounded-[3px] border border-vc-gold/40">
                    <span className="text-xs">👑</span>
                    <span className="text-[10px] font-mono tracking-widest text-vc-gold uppercase font-semibold">
                      You are Host
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-[3px] border border-white/10">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-vc-gold">
                      <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
                      <path d="M19 21a7 7 0 0 0-14 0" />
                    </svg>
                    <span className="text-[10px] text-vc-text-muted">
                      Controlled by <strong className="text-vc-text-primary">{room.hostName}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Film Details Overlay */}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between z-10 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md p-3 rounded-[3px] border border-white/10">
                  <p className="text-[10px] font-mono text-vc-gold tracking-widest uppercase mb-0.5">
                    {currentMovie.genre} &middot; {currentMovie.year} &middot; {currentMovie.duration}
                  </p>
                  <p className="font-serif text-lg md:text-xl font-bold text-vc-text-primary leading-tight">
                    {currentMovie.title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── PLAYBACK CONTROLS STRIP ── */}
          <div className="flex-shrink-0 px-3 md:px-8 pb-3">
            <div
              className="max-w-5xl mx-auto glass-panel rounded-[4px] px-4 md:px-6 py-3 border border-white/5"
            >
              {/* Progress Slider (Interactive for Host) */}
              <div
                onClick={handleSeekClick}
                className={cn(
                  'w-full h-2 rounded-full overflow-hidden bg-white/10 mb-3 relative group transition-all',
                  isHost ? 'cursor-pointer hover:h-2.5' : 'cursor-default'
                )}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                title={isHost ? 'Click to seek projection' : 'Controlled by Host'}
              >
                <div
                  className="h-full bg-vc-gold rounded-full relative transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Play/Pause Button */}
                  <button
                    onClick={() => (room.playback.isPlaying ? pause() : play())}
                    disabled={!isHost}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center rounded-full transition-all',
                      isHost
                        ? 'text-white hover:bg-white/10 hover:text-vc-gold active:scale-95'
                        : 'text-white/25 cursor-not-allowed'
                    )}
                    aria-label={room.playback.isPlaying ? 'Pause' : 'Play'}
                    title={!isHost ? `Only host (${room.hostName}) can toggle playback` : undefined}
                  >
                    {room.playback.isPlaying ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    )}
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2">
                    <button
                      className="text-white/60 hover:text-white transition-colors"
                      aria-label="Toggle audio"
                      onClick={() => setVolume((v) => (v > 0 ? 0 : 80))}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                      className="w-16 sm:w-20 accent-vc-gold hidden sm:block"
                      aria-label={`Volume: ${volume}%`}
                    />
                  </div>

                  {/* Time Counter */}
                  <span className="text-[11px] font-mono text-white/50 tracking-wider">
                    {formatTimecode(localTime)} / {formatTimecode(duration)}
                  </span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Chat Toggle */}
                  <button
                    onClick={() => setChatOpen((v) => !v)}
                    className={cn(
                      'flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-[2px] border transition-all',
                      chatOpen
                        ? 'border-vc-gold/40 text-vc-gold bg-vc-gold/5'
                        : 'border-white/10 text-white/50 hover:border-white/20'
                    )}
                    aria-label={chatOpen ? 'Hide chat' : 'Show chat'}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Chat ({messages.length})</span>
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    onClick={handleToggleFullscreen}
                    className="text-white/40 hover:text-white transition-colors p-1"
                    aria-label="Toggle Fullscreen"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Host Specific Management Strip */}
              {isHost && (
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-vc-gold tracking-widest uppercase font-semibold">
                      Host Controls:
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilmModal(true)}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-[2px] border border-vc-gold/40 text-vc-gold hover:bg-vc-gold/10 transition-all flex items-center gap-1"
                    >
                      <span>🎬 Change Film</span>
                    </button>
                    <button
                      onClick={() => seek(0)}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-[2px] border border-white/10 text-vc-text-muted hover:border-vc-gold/40 hover:text-vc-gold transition-all"
                    >
                      ⏮ Restart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── PARTICIPANTS STRIP ── */}
          <div className="flex-shrink-0 px-4 md:px-8 pb-3">
            <div className="max-w-5xl mx-auto flex items-center gap-3 overflow-x-auto py-1">
              {participants.map((p) => (
                <div key={p.uid} className="flex items-center gap-2 flex-shrink-0 bg-black/40 px-2.5 py-1.5 rounded-[4px] border border-white/5">
                  <div className="relative">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                        p.isHost
                          ? 'bg-vc-gold/15 border border-vc-gold/40 text-vc-gold'
                          : 'bg-vc-bg-card border border-vc-border text-vc-text-muted'
                      )}
                    >
                      {p.displayName ? p.displayName[0].toUpperCase() : 'V'}
                    </div>
                    <div
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black',
                        p.isOnline ? 'bg-green-500' : 'bg-white/20'
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-vc-text-primary leading-none">
                      {p.displayName}
                    </p>
                    {p.isHost && (
                      <span className="text-[8px] font-mono text-vc-gold uppercase tracking-wider font-semibold">
                        Host
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── REAL-TIME CHAT DRAWER ── */}
        {chatOpen && (
          <aside
            className="w-72 sm:w-80 flex-shrink-0 border-l border-white/5 flex flex-col bg-black/60 backdrop-blur-md animate-slide-down z-10"
            aria-label="Theatre Chat"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-mono font-semibold text-vc-text-primary uppercase tracking-wider">
                  Auditorium Chat
                </h2>
                <span className="text-[10px] text-vc-gold font-mono">({messages.length})</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-vc-text-muted/50 p-4">
                  <span className="text-2xl mb-1">💬</span>
                  <p className="text-xs font-mono">No messages yet.</p>
                  <p className="text-[10px] mt-1">Start the conversation with other viewers!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMsgHost = msg.userId === room.hostId;
                  const isSystem = msg.userId === 'system';
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2.5',
                        isSystem && 'bg-white/[0.03] p-2 rounded-[3px] border border-white/5'
                      )}
                    >
                      {!isSystem && (
                        <div
                          className={cn(
                            'w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-semibold mt-0.5',
                            isMsgHost
                              ? 'bg-vc-gold/15 border border-vc-gold/40 text-vc-gold'
                              : 'bg-vc-bg-card border border-vc-border text-vc-text-muted'
                          )}
                        >
                          {msg.userName ? msg.userName[0].toUpperCase() : 'V'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 mb-0.5">
                          <span
                            className={cn(
                              'text-[11px] font-semibold truncate',
                              isMsgHost ? 'text-vc-gold' : isSystem ? 'text-vc-gold-dim' : 'text-vc-text-primary'
                            )}
                          >
                            {msg.userName}
                          </span>
                          <span className="text-[9px] text-white/30 font-mono flex-shrink-0">
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-vc-text-muted leading-relaxed break-words">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Message Input Form */}
            <div className="p-3 border-t border-white/5">
              {user ? (
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder="Message auditorium..."
                    maxLength={200}
                    className="flex-1 bg-white/5 border border-white/10 rounded-[3px] px-3 py-2 text-xs text-vc-text-primary placeholder-white/30 focus:border-vc-gold/50 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!chatText.trim()}
                    className="px-3 py-2 bg-vc-gold text-black rounded-[3px] text-xs font-semibold hover:bg-vc-gold/90 disabled:opacity-40 transition-all"
                  >
                    Send
                  </button>
                </form>
              ) : (
                <div className="text-center p-2 rounded-[3px] bg-white/5 border border-white/10">
                  <p className="text-[11px] text-vc-text-muted mb-1">Sign in to join the conversation</p>
                  <Link to="/login" className="text-xs font-mono text-vc-gold hover:underline">
                    Sign In &rarr;
                  </Link>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ── CHANGE FILM MODAL (HOST ONLY) ── */}
      {showFilmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-[6px] p-6 border border-vc-gold/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-serif text-lg text-vc-text-primary">Change Feature Film</h3>
              <button
                onClick={() => setShowFilmModal(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {movies.map((m) => {
                const isCurrent = m.id === currentMovie.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      changeMovie(m.id);
                      setShowFilmModal(false);
                    }}
                    className={cn(
                      'w-full text-left p-3 rounded-[4px] border transition-all flex items-center gap-3 group',
                      isCurrent
                        ? 'border-vc-gold bg-vc-gold/10'
                        : 'border-white/5 hover:border-vc-gold/30 hover:bg-white/5'
                    )}
                  >
                    <div className="w-10 h-14 bg-black/60 rounded-[2px] flex items-center justify-center font-serif text-vc-gold text-sm font-bold flex-shrink-0">
                      V
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-vc-text-primary truncate">{m.title}</p>
                      <p className="text-[11px] text-vc-text-muted">
                        {m.genre} &middot; {m.year} &middot; {m.duration}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-vc-gold uppercase px-2 py-0.5 rounded bg-vc-gold/20">
                        Playing
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
