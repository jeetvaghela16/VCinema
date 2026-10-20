import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheatre } from '../hooks/useTheatre';
import { movies } from '../data/movies';
import {
  CURATED_GLOBAL_MOVIES,
  AUDIO_LANGUAGES,
  STREAM_SERVERS,
  getEmbedStreamUrl,
  searchMovies,
  searchSeries,
  fetchMovieTrailerKey,
  fetchSeriesTrailerKey,
  fetchSeriesDetails,
  fetchSeasonEpisodes,
  type TmdbSeriesDetails,
  type TmdbEpisode,
} from '../services/tmdbService';
import type { Movie, Series } from '../types';
import { PosterArtwork } from '../components/cards/PosterArtwork';
import { formatTimecode, calculateAuthoritativePosition } from '../services/theatreService';
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
    isHostOnline,
    isKicked,
    isMuted,
    isRoomEnded,
    endedReason,
    play,
    pause,
    seek,
    changeMovie,
    changeEpisode,
    changeServer,
    changeAudioLanguage,
    kickUser,
    muteUser,
    lockAuditorium,
    endRoom,
    clearChat,
    sendMessage,
  } = useTheatre(roomId);

  const [chatOpen, setChatOpen] = useState(true);
  const [chatText, setChatText] = useState('');
  const [volume, setVolume] = useState(80);
  const [showFilmModal, setShowFilmModal] = useState(false);
  const [showEndScreeningConfirm, setShowEndScreeningConfirm] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [localTime, setLocalTime] = useState(0);

  // Film selector modal state
  const [filmModalTab, setFilmModalTab] = useState<'search' | 'curated' | 'custom' | 'originals'>('search');
  const [filmSearchQuery, setFilmSearchQuery] = useState('');
  const [filmSearchResults, setFilmSearchResults] = useState<(Movie | Series)[]>([]);
  const [isSearchingFilms, setIsSearchingFilms] = useState(false);
  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [customStreamTitle, setCustomStreamTitle] = useState('');

  // Audio Dubbing & Projection Mode State
  const [theatreServer, setTheatreServer] = useState<string>('vidfast');
  const [theatreAudioLang, setTheatreAudioLang] = useState<string>('hindi');
  const [projectionMode, setProjectionMode] = useState<'stream' | 'trailer' | 'artwork' | 'video'>('stream');

  // OTT Episode Guide Drawer State
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [theatreSeriesDetails, setTheatreSeriesDetails] = useState<TmdbSeriesDetails | null>(null);
  const [theatreEpisodes, setTheatreEpisodes] = useState<TmdbEpisode[]>([]);
  const [drawerSeason, setDrawerSeason] = useState<number>(1);
  const [isLoadingDrawerEpisodes, setIsLoadingDrawerEpisodes] = useState(false);

  useEffect(() => {
    if (room?.playback?.streamServerId) setTheatreServer(room.playback.streamServerId);
    if (room?.playback?.audioLanguage) setTheatreAudioLang(room.playback.audioLanguage);
    if (room?.playback?.mediaType) {
      setProjectionMode(
        room.playback.mediaType === 'trailer'
          ? 'trailer'
          : room.playback.mediaType === 'artwork'
          ? 'artwork'
          : room.playback.mediaType === 'video'
          ? 'video'
          : 'stream'
      );
    }
  }, [room?.playback?.streamServerId, room?.playback?.audioLanguage, room?.playback?.mediaType]);

  // Load TV Series details & episodes when playing a series
  useEffect(() => {
    const tmdbId = room?.playback?.tmdbId;
    const isTv = room?.playback?.isTv;
    if (!tmdbId || !isTv) {
      setTheatreSeriesDetails(null);
      setTheatreEpisodes([]);
      return;
    }

    const currentS = room?.playback?.season || 1;
    setDrawerSeason(currentS);

    fetchSeriesDetails(tmdbId).then((details) => {
      if (details) {
        setTheatreSeriesDetails(details);
      }
    });

    setIsLoadingDrawerEpisodes(true);
    fetchSeasonEpisodes(tmdbId, currentS)
      .then((eps) => {
        setTheatreEpisodes(eps);
      })
      .finally(() => setIsLoadingDrawerEpisodes(false));
  }, [room?.playback?.tmdbId, room?.playback?.isTv, room?.playback?.season]);

  const handleDrawerSeasonChange = (seasonNum: number) => {
    setDrawerSeason(seasonNum);
    const tmdbId = room?.playback?.tmdbId;
    if (!tmdbId) return;

    setIsLoadingDrawerEpisodes(true);
    fetchSeasonEpisodes(tmdbId, seasonNum)
      .then((eps) => setTheatreEpisodes(eps))
      .finally(() => setIsLoadingDrawerEpisodes(false));
  };

  const handleHostPrevEpisode = async () => {
    if (!isHost || !room?.playback) return;
    const curS = room.playback.season || 1;
    const curE = room.playback.episode || 1;
    if (curE > 1) {
      await changeEpisode(curS, curE - 1);
      await sendMessage(`Host switched projection to Season ${curS}, Episode ${curE - 1}`);
    } else if (curS > 1) {
      await changeEpisode(curS - 1, 1);
      await sendMessage(`Host switched projection to Season ${curS - 1}, Episode 1`);
    }
  };

  const handleHostNextEpisode = async () => {
    if (!isHost || !room?.playback) return;
    const curS = room.playback.season || 1;
    const curE = room.playback.episode || 1;
    const totalCurrentSeasonEps = theatreEpisodes.length > 0 ? theatreEpisodes.length : 12;
    if (curE < totalCurrentSeasonEps) {
      await changeEpisode(curS, curE + 1);
      await sendMessage(`Host switched projection to Season ${curS}, Episode ${curE + 1}`);
    } else if (theatreSeriesDetails && curS < theatreSeriesDetails.number_of_seasons) {
      await changeEpisode(curS + 1, 1);
      await sendMessage(`Host advanced projection to Season ${curS + 1}, Episode 1`);
    }
  };

  const handleSelectEpisode = async (seasonNum: number, episodeNum: number, epName?: string) => {
    if (!isHost) return;
    await changeEpisode(seasonNum, episodeNum);
    setShowEpisodeModal(false);
    await sendMessage(`Host selected S${seasonNum}:E${episodeNum}${epName ? ` "${epName}"` : ''}`);
  };

  const handleSelectServer = async (serverId: string) => {
    if (!isHost) return;
    setTheatreServer(serverId);
    await changeServer(serverId);
    const sName = STREAM_SERVERS.find((s) => s.id === serverId)?.name.replace(/Server \d+ /, '') || serverId;
    await sendMessage(`Host switched projection server to ${sName}`);
  };

  const handleSelectDub = async (langId: string) => {
    if (!isHost) return;
    setTheatreAudioLang(langId);
    const langConfig = AUDIO_LANGUAGES.find((l) => l.id === langId);
    if (langConfig) {
      setTheatreServer(langConfig.recommendedServerId);
      await changeServer(langConfig.recommendedServerId);
    }
    await changeAudioLanguage(langId);
    const lLabel = AUDIO_LANGUAGES.find((l) => l.id === langId)?.label || langId;
    await sendMessage(`Host switched audio track to ${lLabel}`);
  };

  const handleSetProjectionMode = async (mode: 'stream' | 'trailer' | 'artwork') => {
    if (!isHost) return;
    setProjectionMode(mode);
    const mediaType = mode === 'stream' ? 'embed' : mode;
    await changeMovie(currentMovie, { mediaType });
  };

  const handleConfirmEndScreening = async () => {
    setShowEndScreeningConfirm(false);
    await endRoom('The host has concluded the screening session.');
    navigate('/');
  };

  // Automatic redirect timer when screening ends or user is kicked
  useEffect(() => {
    if (isRoomEnded || isKicked) {
      setRedirectCountdown(4);
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRoomEnded, isKicked, navigate]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const localTimeRef = useRef(0);
  localTimeRef.current = localTime;

  // Authoritative Playback Synchronization Engine
  useEffect(() => {
    if (!room?.playback) return;

    const playback = room.playback;

    // 1. Calculate authoritative target time based on wall-clock elapsed time
    const authoritativeTime = calculateAuthoritativePosition(playback);

    if (!playback.isPlaying) {
      // If paused, strictly lock local time to the stored pause position
      setLocalTime(playback.currentTime);
      return;
    }

    // If playing:
    // If drift > 1.5 seconds (e.g. late joiner or host seek), immediately snap to authoritative position
    const currentDrift = Math.abs(localTimeRef.current - authoritativeTime);
    if (currentDrift > 1.5 || localTimeRef.current === 0) {
      setLocalTime(authoritativeTime);
    }

    // Advance local timer every 1000ms while running, with periodic drift checks
    const interval = setInterval(() => {
      setLocalTime((prev) => {
        const target = calculateAuthoritativePosition(playback);
        const drift = Math.abs(prev - target);

        // Gentle correction: if drift > 1.5 seconds, resync to authoritative wall-clock time
        if (drift > 1.5) {
          return target;
        }

        if (prev >= playback.duration) {
          return playback.duration;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room?.playback]);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Synchronize HTML5 video element if active
  useEffect(() => {
    if (!videoElementRef.current) return;
    if (room?.playback?.isPlaying) {
      videoElementRef.current.play().catch(() => {});
    } else {
      videoElementRef.current.pause();
    }
    const diff = Math.abs(videoElementRef.current.currentTime - localTime);
    if (diff > 1.5) {
      videoElementRef.current.currentTime = localTime;
    }
  }, [room?.playback?.isPlaying, localTime]);

  // Handle Chat Submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    const textToSend = chatText.trim().slice(0, 300);
    setChatText('');
    await sendMessage(textToSend, localTime);
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

  // Handle Seek click (Host only)
  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHost || !room?.playback?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = Math.round(percent * room.playback.duration);
    seek(targetSeconds);
  };

  // Handle Host Toggle Play / Pause (Passes exact elapsed position)
  const handleTogglePlayPause = () => {
    if (!isHost || !room?.playback) return;
    if (room.playback.isPlaying) {
      pause(localTime);
    } else {
      play(localTime);
    }
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

  // Construct current movie with full worldwide metadata and fallback
  const knownMovie =
    movies.find((m) => m.id === room.playback.currentMovieId) ||
    CURATED_GLOBAL_MOVIES.find((m) => m.id === room.playback.currentMovieId);

  const activeTmdbId = room.playback.tmdbId || (knownMovie as any)?.tmdbId;
  const isTv = room.playback.isTv || false;
  const currentSeason = room.playback.season || 1;
  const currentEpisode = room.playback.episode || 1;

  const currentMovie: Movie = {
    id: room.playback.currentMovieId || 'm1',
    title: room.playback.currentMovieTitle || knownMovie?.title || 'Feature Presentation',
    year: knownMovie?.year || 2026,
    genre: knownMovie?.genre || (isTv ? 'Web Series' : 'Cinema'),
    rating: knownMovie?.rating || '8.8',
    duration: knownMovie?.duration || (isTv ? `S${currentSeason} : E${currentEpisode}` : '2h 15m'),
    description: knownMovie?.description || 'Synchronized screening in the VCinema virtual auditorium.',
    gradientFrom: knownMovie?.gradientFrom || '#1c2b3a',
    gradientTo: knownMovie?.gradientTo || '#0a1520',
    posterUrl: room.playback.currentMoviePoster || knownMovie?.posterUrl,
    backdropUrl: room.playback.currentMovieBackdrop || knownMovie?.backdropUrl,
    trailerKey: room.playback.currentMovieTrailerKey || knownMovie?.trailerKey,
    videoUrl: room.playback.currentMovieVideoUrl || knownMovie?.videoUrl,
    tmdbId: activeTmdbId,
  };
  const duration = room.playback.duration || 8280;
  const progressPercent = Math.min(100, Math.max(0, (localTime / duration) * 100));

  const embedStreamUrl = activeTmdbId
    ? getEmbedStreamUrl(
        activeTmdbId,
        isTv ? 'tv' : 'movie',
        currentSeason,
        currentEpisode,
        theatreServer,
        theatreAudioLang
      )
    : currentMovie.videoUrl || '';

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
              {participants.filter((p) => p.isOnline).length} watching
            </span>
          </div>
        </div>

        {/* Right actions: Lock, Invite & Leave/End */}
        <div className="flex items-center gap-2">
          {/* Host Authority: Lock Room Toggle */}
          {isHost && (
            <button
              type="button"
              onClick={() => lockAuditorium(!room.isLocked)}
              className={cn(
                'hidden sm:inline-flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-[2px] border transition-all',
                room.isLocked
                  ? 'border-amber-500/60 bg-amber-950/40 text-amber-300'
                  : 'border-white/10 hover:border-white/30 text-white/70'
              )}
              title={room.isLocked ? 'Auditorium is locked. Click to unlock.' : 'Click to lock auditorium against new joins.'}
            >
              <span>{room.isLocked ? '🔒 Locked' : '🔓 Open'}</span>
            </button>
          )}

          <button
            onClick={handleCopyInvite}
            className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-[2px] border border-vc-gold/40 text-vc-gold hover:bg-vc-gold/10 transition-all"
          >
            + Invite
          </button>

          {isHost ? (
            <button
              onClick={() => setShowEndScreeningConfirm(true)}
              className="text-[10px] px-3 py-1 rounded-[2px] border border-red-500/70 bg-red-950/40 text-red-300 hover:bg-red-900/60 transition-all font-mono uppercase tracking-wider font-semibold shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              title="Host Authority: End screening session for all viewers"
            >
              ⏹ End Screening
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="text-[10px] px-3 py-1 rounded-[2px] border border-vc-burgundy/60 text-vc-burgundy/90 hover:bg-vc-burgundy/15 transition-all font-mono uppercase tracking-wider"
            >
              Leave
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN AUDITORIUM CANVAS ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Screen + Controls */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Cinema Screen Container */}
          <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 relative min-h-[240px]">
            <div
              ref={screenRef}
              style={{
                width: 'min(100%, calc((100vh - 300px) * 16 / 9))',
                maxWidth: '64rem',
              }}
              className="aspect-video rounded-[3px] relative overflow-hidden bg-black flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)]"
              aria-label="Cinema screen"
            >
              {/* Dynamic Film Video / Trailer / Stream / Poster Screen */}
              {projectionMode === 'trailer' && (currentMovie.trailerKey || room.playback.currentMovieTrailerKey) ? (
                <div className="absolute inset-0 z-0">
                  <iframe
                    key={`${currentMovie.trailerKey || room.playback.currentMovieTrailerKey}-${room.playback.isPlaying}`}
                    src={`https://www.youtube-nocookie.com/embed/${currentMovie.trailerKey || room.playback.currentMovieTrailerKey}?autoplay=${room.playback.isPlaying ? 1 : 0}&start=${Math.floor(localTime)}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1`}
                    className="w-full h-full border-0 pointer-events-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={currentMovie.title}
                  />
                </div>
              ) : room.playback.mediaType === 'video' && (currentMovie.videoUrl || room.playback.currentMovieVideoUrl) ? (
                <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
                  <video
                    ref={videoElementRef}
                    src={currentMovie.videoUrl || room.playback.currentMovieVideoUrl}
                    className="w-full h-full object-contain"
                    playsInline
                  />
                </div>
              ) : projectionMode === 'stream' && embedStreamUrl ? (
                <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
                  <iframe
                    key={`${embedStreamUrl}-${theatreServer}-${theatreAudioLang}-${currentSeason}-${currentEpisode}`}
                    src={embedStreamUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    title={currentMovie.title}
                  />
                </div>
              ) : currentMovie.posterUrl ? (
                <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={currentMovie.backdropUrl || currentMovie.posterUrl}
                    alt={currentMovie.title}
                    className="w-full h-full object-cover opacity-50 scale-105"
                  />
                  <div className="absolute inset-0 bg-radial-vignette" />
                  <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-md">
                    <img
                      src={currentMovie.posterUrl}
                      alt={currentMovie.title}
                      className="w-24 sm:w-32 h-36 sm:h-48 object-cover rounded-[3px] shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-vc-gold/40 mb-3"
                    />
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-vc-text-primary mb-1">
                      {currentMovie.title}
                    </h3>
                    <p className="text-[11px] text-vc-gold font-mono tracking-widest uppercase">
                      {isTv ? `Web Series S${currentSeason}:E${currentEpisode}` : currentMovie.genre} &middot; {currentMovie.year} &middot; {currentMovie.duration}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 opacity-80 pointer-events-none">
                  <PosterArtwork id={currentMovie.id} />
                </div>
              )}

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

              {/* Host vs Viewer Badge / Disconnected Notice (Top Right) */}
              <div className="absolute top-4 right-4 z-10">
                {isHost ? (
                  <div className="flex items-center gap-1.5 bg-vc-gold/15 backdrop-blur-md px-3 py-1.5 rounded-[3px] border border-vc-gold/40">
                    <span className="text-xs">👑</span>
                    <span className="text-[10px] font-mono tracking-widest text-vc-gold uppercase font-semibold">
                      You are Host
                    </span>
                  </div>
                ) : !isHostOnline ? (
                  <div className="flex items-center gap-1.5 bg-vc-burgundy/30 backdrop-blur-md px-3 py-1.5 rounded-[3px] border border-vc-burgundy/60">
                    <span className="text-[10px] text-vc-text-primary font-mono">
                      ⚠ Host Disconnected &middot; Projection on Hold
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

          {/* ── AUDITORIUM PROJECTION CONSOLE & CONTROLS ── */}
          <div className="flex-shrink-0 px-3 md:px-8 pb-3">
            <div className="max-w-5xl mx-auto glass-panel rounded-[4px] px-4 md:px-6 py-3 border border-white/5 space-y-2.5">
              {/* Native HTML5 Video Progress Slider (ONLY when playing actual direct HTML5 video) */}
              {projectionMode === 'video' && (
                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                  <button
                    onClick={handleTogglePlayPause}
                    disabled={!isHost}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-vc-gold text-black hover:bg-vc-gold-bright transition-colors text-xs font-bold flex-shrink-0"
                    title={isHost ? (room.playback.isPlaying ? 'Pause' : 'Play') : 'Playback host controlled'}
                  >
                    {room.playback.isPlaying ? '❚❚' : '▶'}
                  </button>
                  <div
                    onClick={handleSeekClick}
                    className={cn(
                      'flex-1 h-2 rounded-full overflow-hidden bg-white/10 relative group transition-all',
                      isHost ? 'cursor-pointer hover:h-2.5' : 'cursor-default'
                    )}
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    title={isHost ? 'Click to seek projection' : `Playback controlled by host (${room.hostName})`}
                  >
                    <div
                      className="h-full bg-vc-gold rounded-full relative transition-all duration-200"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white/50 tracking-wider flex-shrink-0">
                    {formatTimecode(localTime)} / {formatTimecode(duration)}
                  </span>
                </div>
              )}

              {/* ── ROW 1: Broadcast Status, TV Episode Switcher & Top Actions ── */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left: Broadcast Status */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-vc-gold font-bold">
                    Auditorium Projection
                  </span>
                  <span className="text-white/20 hidden sm:inline">&middot;</span>
                  <span className="text-[11px] font-mono text-white/80 hidden sm:inline">
                    {STREAM_SERVERS.find((s) => s.id === theatreServer)?.name.replace(/Server \d+ /, '') || 'Fast Mirror'}
                  </span>
                  <span className="text-white/20">&middot;</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-vc-gold/15 text-vc-gold border border-vc-gold/30">
                    {AUDIO_LANGUAGES.find((a) => a.id === theatreAudioLang)?.badge || 'Multi-Audio'}
                  </span>
                </div>

                {/* Center: TV Series Episode Switcher (if TV series) */}
                {isTv && (
                  <div className="flex items-center gap-2 bg-black/70 px-3 py-1 rounded-[3px] border border-white/10 shadow-inner">
                    {isHost && (
                      <button
                        onClick={handleHostPrevEpisode}
                        className="px-1.5 py-0.5 text-xs text-white/70 hover:text-vc-gold hover:bg-white/10 rounded transition-colors font-mono"
                        title="Host: Previous Episode"
                      >
                        ⏮
                      </button>
                    )}
                    <span className="text-xs font-mono font-bold text-vc-gold tracking-wide">
                      S{currentSeason} : E{currentEpisode}
                    </span>
                    {isHost && (
                      <button
                        onClick={handleHostNextEpisode}
                        className="px-1.5 py-0.5 text-xs text-white/70 hover:text-vc-gold hover:bg-white/10 rounded transition-colors font-mono"
                        title="Host: Next Episode"
                      >
                        ⏭
                      </button>
                    )}
                    <button
                      onClick={() => setShowEpisodeModal(true)}
                      className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-vc-gold text-black font-bold hover:bg-vc-gold-bright transition-all shadow-[0_0_10px_rgba(198,167,106,0.3)] active:scale-95"
                    >
                      📺 All Episodes
                    </button>
                  </div>
                )}

                {/* Right: Chat Toggle, Volume & Fullscreen */}
                <div className="flex items-center gap-3">
                  {/* Volume Slider (Local Audio) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      className="text-white/60 hover:text-white transition-colors"
                      aria-label="Toggle audio"
                      onClick={() => setVolume((v) => (v > 0 ? 0 : 80))}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {volume > 0 ? (
                          <>
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                          </>
                        ) : (
                          <>
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <line x1="23" y1="9" x2="17" y2="15" />
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
                      className="w-14 sm:w-16 accent-vc-gold hidden md:block"
                      aria-label={`Volume: ${volume}%`}
                    />
                  </div>

                  {/* Chat Toggle */}
                  <button
                    onClick={() => setChatOpen((v) => !v)}
                    className={cn(
                      'flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-[2px] border transition-all',
                      chatOpen
                        ? 'border-vc-gold/40 text-vc-gold bg-vc-gold/5'
                        : 'border-white/10 text-white/50 hover:border-white/20'
                    )}
                  >
                    <span>💬 Chat ({messages.length})</span>
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    onClick={handleToggleFullscreen}
                    className="text-white/40 hover:text-white transition-colors p-1"
                    aria-label="Toggle Fullscreen"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* ── ROW 2: Prominent Fast Servers Switcher ── */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Fast Server Switcher Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
                  <span className="text-[10px] font-mono text-vc-gold uppercase tracking-wider font-semibold mr-1 flex items-center gap-1 flex-shrink-0">
                    <span>⚡ Server:</span>
                  </span>
                  {STREAM_SERVERS.map((server) => {
                    const isSelected = theatreServer === server.id;
                    return (
                      <button
                        key={server.id}
                        type="button"
                        disabled={!isHost}
                        onClick={() => handleSelectServer(server.id)}
                        className={cn(
                          'px-2.5 py-1 rounded-[3px] text-[10px] font-mono transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0',
                          isSelected
                            ? 'bg-vc-gold text-black font-bold shadow-[0_0_12px_rgba(198,167,106,0.35)]'
                            : isHost
                            ? 'bg-white/5 text-white/70 hover:text-white border border-white/10 hover:border-white/25 cursor-pointer'
                            : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed opacity-40'
                        )}
                        title={
                          isHost
                            ? `${server.name} — ${server.audioSupport}`
                            : `${server.name} (Controlled by Host 👑)`
                        }
                      >
                        <span>{server.name.replace(/Server \d+ /, '')}</span>
                        <span className={cn('text-[9px] px-1 py-0.2 rounded', isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60')}>
                          {server.badge}
                        </span>
                      </button>
                    );
                  })}
                  {!isHost && (
                    <span className="text-[9px] font-mono text-vc-gold/80 bg-vc-gold/10 px-2 py-0.5 rounded border border-vc-gold/20 flex-shrink-0">
                      👑 Host Controlled
                    </span>
                  )}
                </div>

                {/* Projection Mode Switcher */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    disabled={!isHost}
                    onClick={() => handleSetProjectionMode('stream')}
                    className={cn(
                      'px-2.5 py-1 rounded-[2px] text-[10px] font-mono uppercase tracking-wider transition-all',
                      projectionMode === 'stream'
                        ? 'bg-vc-gold/20 text-vc-gold border border-vc-gold/50 font-semibold'
                        : isHost
                        ? 'bg-white/5 text-white/50 hover:text-white border border-transparent'
                        : 'bg-white/5 text-white/30 border border-transparent cursor-not-allowed'
                    )}
                  >
                    ▶ Stream
                  </button>
                  {currentMovie.trailerKey && (
                    <button
                      type="button"
                      disabled={!isHost}
                      onClick={() => handleSetProjectionMode('trailer')}
                      className={cn(
                        'px-2.5 py-1 rounded-[2px] text-[10px] font-mono uppercase tracking-wider transition-all',
                        projectionMode === 'trailer'
                          ? 'bg-vc-gold/20 text-vc-gold border border-vc-gold/50 font-semibold'
                          : isHost
                          ? 'bg-white/5 text-white/50 hover:text-white border border-transparent'
                          : 'bg-white/5 text-white/30 border border-transparent cursor-not-allowed'
                      )}
                    >
                      🎬 Trailer
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!isHost}
                    onClick={() => handleSetProjectionMode('artwork')}
                    className={cn(
                      'px-2.5 py-1 rounded-[2px] text-[10px] font-mono uppercase tracking-wider transition-all',
                      projectionMode === 'artwork'
                        ? 'bg-vc-gold/20 text-vc-gold border border-vc-gold/50 font-semibold'
                        : isHost
                        ? 'bg-white/5 text-white/50 hover:text-white border border-transparent'
                        : 'bg-white/5 text-white/30 border border-transparent cursor-not-allowed'
                    )}
                  >
                    🖼 Art
                  </button>
                </div>
              </div>

              {/* ── ROW 3: Audio Dub Switcher & Host Master Controls ── */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Audio Dub Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
                  <span className="text-[10px] font-mono text-vc-gold uppercase tracking-wider flex items-center gap-1 font-semibold flex-shrink-0">
                    <span>🎧 Dub:</span>
                  </span>
                  {AUDIO_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      disabled={!isHost}
                      onClick={() => handleSelectDub(lang.id)}
                      className={cn(
                        'px-2.5 py-1 rounded-[2px] text-[10px] font-mono transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0',
                        theatreAudioLang === lang.id
                          ? 'bg-vc-gold text-black font-bold shadow-[0_0_8px_rgba(198,167,106,0.3)]'
                          : isHost
                          ? 'bg-white/5 text-white/70 hover:text-white border border-white/10'
                          : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed opacity-40'
                      )}
                      title={isHost ? lang.description : `${lang.label} (Controlled by Host 👑)`}
                    >
                      <span>{lang.glyph}</span>
                      <span>{lang.label.split('·')[0].trim()}</span>
                    </button>
                  ))}
                  {!isHost && (
                    <span className="text-[9px] font-mono text-vc-gold/80 bg-vc-gold/10 px-2 py-0.5 rounded border border-vc-gold/20 flex-shrink-0">
                      👑 Host Controlled
                    </span>
                  )}
                </div>

                {/* Host Control Actions */}
                {isHost && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilmModal(true)}
                      className="text-[10px] font-mono px-3 py-1 rounded-[2px] border border-vc-gold/50 text-vc-gold hover:bg-vc-gold/15 transition-all flex items-center gap-1 font-semibold"
                    >
                      <span>🎬 Change Film / Series</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── PARTICIPANTS STRIP ── */}
          <div className="flex-shrink-0 px-4 md:px-8 pb-6">
            <div className="max-w-5xl mx-auto flex items-center gap-3 overflow-x-auto py-1">
              {participants.map((p) => {
                const isItemHost = p.isHost || p.uid === room.hostId;
                const isMe = p.uid === user?.uid;
                return (
                  <div
                    key={p.uid}
                    className={cn(
                      'flex items-center gap-2 flex-shrink-0 bg-black/40 px-2.5 py-1.5 rounded-[4px] border transition-opacity',
                      p.isOnline ? 'border-white/10 opacity-100' : 'border-white/5 opacity-50'
                    )}
                  >
                    <div className="relative">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                          isItemHost
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
                        title={p.isOnline ? 'Online' : 'Offline'}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-medium text-vc-text-primary leading-none">
                          {p.displayName} {isMe && '(You)'}
                        </p>
                        {isItemHost && (
                          <span className="text-[8px] font-mono text-vc-gold uppercase tracking-wider font-semibold">
                            👑 Host
                          </span>
                        )}
                        {p.isMuted && (
                          <span className="text-[8px] font-mono text-amber-400 bg-amber-950/50 px-1 rounded border border-amber-500/30">
                            🔇 Muted
                          </span>
                        )}
                      </div>

                      {/* Host Authority Controls over this viewer */}
                      {isHost && !isItemHost && !isMe && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={() => muteUser(p.uid, !p.isMuted, p.displayName)}
                            className={cn(
                              'text-[8px] font-mono px-1.5 py-0.5 rounded border transition-colors',
                              p.isMuted
                                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900'
                                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                            )}
                            title={p.isMuted ? 'Unmute participant' : 'Mute participant from chat'}
                          >
                            {p.isMuted ? '🔊 Unmute' : '🔇 Mute'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Kick ${p.displayName} out of this screening?`)) {
                                kickUser(p.uid, p.displayName);
                              }
                            }}
                            className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-red-950/50 border border-red-500/40 text-red-300 hover:bg-red-900/80 transition-colors"
                            title="Kick participant from auditorium"
                          >
                            🚫 Kick
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
              <div className="flex items-center gap-2">
                {isHost && messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Clear all chat messages in this auditorium?')) {
                        clearChat();
                      }
                    }}
                    className="text-[9px] font-mono text-white/50 hover:text-vc-gold transition-colors px-1 py-0.5 rounded hover:bg-white/5"
                    title="Host Authority: Clear all chat history"
                  >
                    🧹 Clear
                  </button>
                )}
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label="Close Chat"
                >
                  ✕
                </button>
              </div>
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
                  const isCurrentUser = msg.userId === user?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2.5',
                        isCurrentUser && 'bg-white/[0.02] p-1.5 rounded-[3px]'
                      )}
                    >
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 mb-0.5">
                          <span
                            className={cn(
                              'text-[11px] font-semibold truncate',
                              isMsgHost ? 'text-vc-gold' : 'text-vc-text-primary'
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
                    disabled={isMuted}
                    placeholder={
                      isMuted
                        ? '🔇 You were muted by the Host'
                        : 'Message auditorium...'
                    }
                    maxLength={300}
                    className={cn(
                      'flex-1 bg-white/5 border border-white/10 rounded-[3px] px-3 py-2 text-xs text-vc-text-primary placeholder-white/30 focus:border-vc-gold/50 focus:outline-none transition-colors',
                      isMuted && 'opacity-50 cursor-not-allowed bg-red-950/20 border-red-500/30'
                    )}
                  />
                  <button
                    type="submit"
                    disabled={!chatText.trim() || isMuted}
                    className="px-3 py-2 bg-vc-gold text-black rounded-[3px] text-xs font-semibold hover:bg-vc-gold/90 disabled:opacity-40 transition-all font-mono"
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
      {showFilmModal && isHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-2xl rounded-[6px] p-6 border border-vc-gold/30 shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg text-vc-gold">🎬</span>
                <h3 className="font-serif text-lg text-vc-text-primary">Change Feature Presentation</h3>
              </div>
              <button
                onClick={() => setShowFilmModal(false)}
                className="text-white/40 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4 flex-shrink-0 overflow-x-auto">
              <button
                onClick={() => setFilmModalTab('search')}
                className={cn(
                  'px-3 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap',
                  filmModalTab === 'search'
                    ? 'bg-vc-gold text-black font-semibold'
                    : 'text-vc-text-muted hover:text-white bg-white/5'
                )}
              >
                🔍 Worldwide Search (TMDB)
              </button>
              <button
                onClick={() => setFilmModalTab('curated')}
                className={cn(
                  'px-3 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap',
                  filmModalTab === 'curated'
                    ? 'bg-vc-gold text-black font-semibold'
                    : 'text-vc-text-muted hover:text-white bg-white/5'
                )}
              >
                ★ Global Masterpieces
              </button>
              <button
                onClick={() => setFilmModalTab('custom')}
                className={cn(
                  'px-3 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap',
                  filmModalTab === 'custom'
                    ? 'bg-vc-gold text-black font-semibold'
                    : 'text-vc-text-muted hover:text-white bg-white/5'
                )}
              >
                🔗 Custom Video / Stream URL
              </button>
              <button
                onClick={() => setFilmModalTab('originals')}
                className={cn(
                  'px-3 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap',
                  filmModalTab === 'originals'
                    ? 'bg-vc-gold text-black font-semibold'
                    : 'text-vc-text-muted hover:text-white bg-white/5'
                )}
              >
                VCinema Exclusives
              </button>
            </div>

            {/* Tab 1: Worldwide TMDB Search */}
            {filmModalTab === 'search' && (
              <div className="flex-1 flex flex-col min-h-0">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!filmSearchQuery.trim()) return;
                    setIsSearchingFilms(true);
                    try {
                      const [movs, sers] = await Promise.all([
                        searchMovies(filmSearchQuery),
                        searchSeries(filmSearchQuery),
                      ]);
                      setFilmSearchResults([...movs, ...sers]);
                    } finally {
                      setIsSearchingFilms(false);
                    }
                  }}
                  className="flex gap-2 mb-4 flex-shrink-0"
                >
                  <input
                    type="text"
                    value={filmSearchQuery}
                    onChange={(e) => setFilmSearchQuery(e.target.value)}
                    placeholder="Search any movie or web series worldwide (e.g. Stranger Things, Avengers, Inception, Mirzapur)..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-[3px] px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-vc-gold focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingFilms || !filmSearchQuery.trim()}
                    className="px-4 py-2.5 bg-vc-gold text-black text-xs font-semibold rounded-[3px] hover:bg-vc-gold-bright transition-colors font-mono uppercase tracking-wider disabled:opacity-40"
                  >
                    {isSearchingFilms ? 'Searching...' : 'Search'}
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filmSearchResults.length > 0 ? (
                    filmSearchResults.map((m) => {
                      const isTv = 'seasons' in m;
                      return (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-[4px] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-vc-gold/40 flex items-center justify-between gap-3 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {m.posterUrl ? (
                              <img
                                src={m.posterUrl}
                                alt={m.title}
                                className="w-10 h-14 object-cover rounded-[2px] flex-shrink-0 border border-white/10"
                              />
                            ) : (
                              <div className="w-10 h-14 bg-black/60 rounded-[2px] flex items-center justify-center font-serif text-vc-gold text-xs font-bold flex-shrink-0">
                                V
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[8px] font-mono uppercase px-1 rounded-[1px] bg-white/10 text-vc-gold">
                                  {isTv ? 'SERIES' : 'MOVIE'}
                                </span>
                                <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                              </div>
                              <p className="text-[10px] text-vc-text-muted">
                                {m.year} &middot; {m.genre} &middot; ★ {m.rating}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={async () => {
                                let trailer = m.trailerKey;
                                if (!trailer && m.tmdbId) {
                                  trailer = isTv
                                    ? (await fetchSeriesTrailerKey(m.tmdbId)) || undefined
                                    : (await fetchMovieTrailerKey(m.tmdbId)) || undefined;
                                }
                                await changeMovie(m, {
                                  trailerKey: trailer,
                                  mediaType: m.tmdbId ? 'embed' : trailer ? 'trailer' : 'artwork',
                                  tmdbId: m.tmdbId,
                                  isTv,
                                  season: 1,
                                  episode: 1,
                                  audioLanguage: theatreAudioLang,
                                  streamServerId: theatreServer,
                                });
                                setProjectionMode('stream');
                                setShowFilmModal(false);
                              }}
                              className="px-2.5 py-1.5 bg-vc-gold text-black text-[11px] font-semibold rounded-[2px] hover:bg-vc-gold-bright transition-colors font-mono uppercase"
                              title="Project full stream with dubbed audio"
                            >
                              ▶ Stream
                            </button>
                            <button
                              onClick={async () => {
                                let trailer = m.trailerKey;
                                if (!trailer && m.tmdbId) {
                                  trailer = isTv
                                    ? (await fetchSeriesTrailerKey(m.tmdbId)) || undefined
                                    : (await fetchMovieTrailerKey(m.tmdbId)) || undefined;
                                }
                                await changeMovie(m, {
                                  trailerKey: trailer,
                                  mediaType: 'trailer',
                                  tmdbId: m.tmdbId,
                                  isTv,
                                });
                                setProjectionMode('trailer');
                                setShowFilmModal(false);
                              }}
                              className="px-2.5 py-1.5 bg-white/10 text-white text-[11px] font-semibold rounded-[2px] hover:bg-white/20 transition-colors font-mono uppercase border border-white/10"
                              title="Project official trailer"
                            >
                              🎬 Trailer
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-vc-text-muted text-xs">
                      {isSearchingFilms
                        ? 'Searching worldwide catalog...'
                        : 'Search for any global film above to project it in the auditorium.'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Curated Masterpieces */}
            {filmModalTab === 'curated' && (
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {CURATED_GLOBAL_MOVIES.map((m) => {
                  const isCurrent = m.id === currentMovie.id;
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'p-2.5 rounded-[4px] border transition-all flex items-center justify-between gap-3',
                        isCurrent
                          ? 'border-vc-gold bg-vc-gold/10'
                          : 'border-white/5 hover:border-vc-gold/30 hover:bg-white/5'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {m.posterUrl && (
                          <img
                            src={m.posterUrl}
                            alt={m.title}
                            className="w-10 h-14 object-cover rounded-[2px] flex-shrink-0 border border-white/10"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                          <p className="text-[10px] text-vc-text-muted">
                            {m.year} &middot; {m.genre} &middot; ★ {m.rating} &middot; {m.originCountry}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await changeMovie(m, {
                            trailerKey: m.trailerKey,
                            mediaType: m.trailerKey ? 'trailer' : 'artwork',
                          });
                          setShowFilmModal(false);
                        }}
                        className="px-3 py-1.5 bg-vc-gold text-black text-[11px] font-semibold rounded-[2px] hover:bg-vc-gold-bright transition-colors font-mono uppercase flex-shrink-0"
                      >
                        {isCurrent ? 'Current' : 'Select'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 3: Custom Video Stream */}
            {filmModalTab === 'custom' && (
              <div className="flex-1 flex flex-col justify-center space-y-4 py-4">
                <p className="text-xs text-vc-text-muted">
                  Stream any <strong>YouTube video / livestream</strong> or <strong>direct MP4 video link</strong> in real-time sync with all auditorium participants.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono tracking-wider text-vc-text-muted uppercase block mb-1">
                      Video Title
                    </label>
                    <input
                      type="text"
                      value={customStreamTitle}
                      onChange={(e) => setCustomStreamTitle(e.target.value)}
                      placeholder="e.g. Big Buck Bunny / Community Screening"
                      className="w-full bg-white/5 border border-white/10 rounded-[3px] px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-vc-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono tracking-wider text-vc-text-muted uppercase block mb-1">
                      Video or YouTube URL
                    </label>
                    <input
                      type="text"
                      value={customStreamUrl}
                      onChange={(e) => setCustomStreamUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://...mp4"
                      className="w-full bg-white/5 border border-white/10 rounded-[3px] px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-vc-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={async () => {
                      if (!customStreamUrl.trim()) return;
                      const url = customStreamUrl.trim();
                      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);

                      if (ytMatch) {
                        const trailerKey = ytMatch[1];
                        await changeMovie(
                          {
                            id: `custom-yt-${trailerKey}`,
                            title: customStreamTitle.trim() || 'Custom YouTube Screening',
                            year: 2026,
                            genre: 'YouTube Stream',
                            rating: '9.0',
                            duration: 'Live',
                            description: url,
                            gradientFrom: '#1c2b3a',
                            gradientTo: '#0a1520',
                            trailerKey,
                          },
                          { trailerKey, mediaType: 'trailer' }
                        );
                      } else {
                        await changeMovie(
                          {
                            id: `custom-vid-${Date.now()}`,
                            title: customStreamTitle.trim() || 'Custom Video Screening',
                            year: 2026,
                            genre: 'Direct Stream',
                            rating: '9.0',
                            duration: 'Direct Video',
                            description: url,
                            gradientFrom: '#1c2b3a',
                            gradientTo: '#0a1520',
                            videoUrl: url,
                          },
                          { videoUrl: url, mediaType: 'video' }
                        );
                      }
                      setShowFilmModal(false);
                    }}
                    disabled={!customStreamUrl.trim()}
                    className="px-5 py-2 bg-vc-gold text-black text-xs font-semibold rounded-[3px] hover:bg-vc-gold-bright transition-colors font-mono uppercase tracking-wider disabled:opacity-40"
                  >
                    Stream in Auditorium
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: VCinema Exclusives */}
            {filmModalTab === 'originals' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {movies.map((m) => {
                  const isCurrent = m.id === currentMovie.id;
                  return (
                    <button
                      key={m.id}
                      onClick={async () => {
                        await changeMovie(m, { mediaType: 'artwork' });
                        setShowFilmModal(false);
                      }}
                      className={cn(
                        'w-full text-left p-2.5 rounded-[4px] border transition-all flex items-center justify-between gap-3 group',
                        isCurrent
                          ? 'border-vc-gold bg-vc-gold/10'
                          : 'border-white/5 hover:border-vc-gold/30 hover:bg-white/5'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-14 bg-black/60 rounded-[2px] flex items-center justify-center font-serif text-vc-gold text-xs font-bold flex-shrink-0">
                          V
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                          <p className="text-[10px] text-vc-text-muted">
                            {m.genre} &middot; {m.year} &middot; {m.duration}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-vc-gold uppercase px-2 py-1 rounded bg-white/5 group-hover:bg-vc-gold group-hover:text-black transition-colors">
                        {isCurrent ? 'Playing' : 'Select'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AUDITORIUM OTT EPISODE GUIDE DRAWER MODAL ── */}
      {showEpisodeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Auditorium Episode Guide"
        >
          <div className="glass-panel w-full max-w-5xl rounded-[8px] border border-vc-gold/40 shadow-[0_25px_90px_rgba(0,0,0,0.95)] max-h-[92vh] flex flex-col overflow-hidden bg-[#08080a]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-black/80 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-vc-gold uppercase tracking-wider px-2 py-0.5 rounded bg-vc-gold/10 border border-vc-gold/30">
                    Auditorium Episode Guide
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-vc-text-primary">
                    {currentMovie.title}
                  </h3>
                </div>
                <p className="text-[11px] text-vc-text-muted mt-0.5">
                  {isHost
                    ? '👑 As Host, selecting an episode switches projection for all friends in the auditorium'
                    : 'Currently synchronized with host projection'}
                </p>
              </div>

              <button
                onClick={() => setShowEpisodeModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Close episode guide"
              >
                ✕
              </button>
            </div>

            {/* Season Tabs */}
            <div className="px-5 py-3 border-b border-white/5 bg-black/40 flex items-center gap-2 overflow-x-auto flex-shrink-0">
              {theatreSeriesDetails?.seasons && theatreSeriesDetails.seasons.length > 0
                ? theatreSeriesDetails.seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => handleDrawerSeasonChange(s.season_number)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-[3px] text-xs font-mono transition-all whitespace-nowrap flex items-center gap-1.5',
                        drawerSeason === s.season_number
                          ? 'bg-vc-gold text-black font-bold shadow-[0_0_12px_rgba(198,167,106,0.35)]'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20'
                      )}
                    >
                      <span>Season {s.season_number}</span>
                      <span className={cn('text-[10px]', drawerSeason === s.season_number ? 'text-black/70' : 'text-white/40')}>
                        ({s.episode_count} eps)
                      </span>
                    </button>
                  ))
                : (
                    <span className="text-xs font-mono text-vc-gold">Season 1</span>
                  )}
            </div>

            {/* Episode Cards Grid */}
            <div className="p-5 overflow-y-auto flex-1">
              {isLoadingDrawerEpisodes ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-vc-gold border-t-transparent animate-spin" />
                  <span className="text-xs font-mono text-vc-text-muted">Loading Season {drawerSeason} episodes...</span>
                </div>
              ) : theatreEpisodes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {theatreEpisodes.map((ep) => {
                    const isCurrentEp = currentSeason === drawerSeason && currentEpisode === ep.episode_number;
                    const stillUrl = ep.still_path || currentMovie.backdropUrl || currentMovie.posterUrl;
                    return (
                      <div
                        key={ep.id || ep.episode_number}
                        onClick={() => isHost && handleSelectEpisode(drawerSeason, ep.episode_number, ep.name)}
                        className={cn(
                          'rounded-[4px] border overflow-hidden transition-all duration-200 flex flex-col bg-vc-bg-base/60',
                          isHost ? 'cursor-pointer hover:bg-vc-bg-base hover:-translate-y-0.5' : 'cursor-default',
                          isCurrentEp
                            ? 'border-vc-gold bg-vc-gold/10 ring-1 ring-vc-gold shadow-[0_0_15px_rgba(198,167,106,0.25)]'
                            : 'border-white/10 hover:border-white/30'
                        )}
                      >
                        <div className="relative aspect-video w-full bg-black/80 overflow-hidden">
                          {stillUrl && (
                            <img src={stillUrl} alt={ep.name} className="w-full h-full object-cover" loading="lazy" />
                          )}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/80 text-white backdrop-blur-sm border border-white/10">
                              EP {ep.episode_number}
                            </span>
                            {isCurrentEp && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-vc-gold text-black uppercase animate-pulse">
                                ▶ Screening
                              </span>
                            )}
                          </div>
                          {ep.runtime && (
                            <span className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-white/80">
                              {ep.runtime}m
                            </span>
                          )}
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className={cn('text-xs font-bold line-clamp-1', isCurrentEp ? 'text-vc-gold' : 'text-white')}>
                              {ep.episode_number}. {ep.name}
                            </h4>
                            <p className="text-[11px] text-vc-text-muted line-clamp-2 mt-1 leading-relaxed">
                              {ep.overview || 'Synchronized episode streaming.'}
                            </p>
                          </div>
                          {isHost ? (
                            <button className={cn(
                              'mt-2.5 w-full py-1 rounded-[2px] text-[10px] font-mono uppercase font-semibold transition-colors',
                              isCurrentEp
                                ? 'bg-vc-gold text-black'
                                : 'bg-white/5 hover:bg-vc-gold hover:text-black text-white/80'
                            )}>
                              {isCurrentEp ? 'Currently Screening' : 'Screen Episode'}
                            </button>
                          ) : (
                            <div className="mt-2.5 w-full py-1 text-center text-[10px] font-mono text-vc-gold/70 bg-white/5 rounded-[2px]">
                              {isCurrentEp ? '▶ Currently Screening' : '👑 Host Controlled'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-xs text-vc-text-muted py-12">No episode details available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── HOST CONFIRM END SCREENING MODAL ── */}
      {showEndScreeningConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 rounded-[8px] max-w-sm w-full text-center border border-red-500/40 shadow-[0_20px_70px_rgba(0,0,0,0.9)] bg-[#0d0a0a]">
            <span className="text-3xl mb-2 block">👑</span>
            <h3 className="font-serif text-lg font-bold text-white mb-2">End Screening for All?</h3>
            <p className="text-xs text-vc-text-muted mb-6 leading-relaxed">
              As Host, ending this screening will automatically close the auditorium and return all joined friends to the lobby.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowEndScreeningConfirm(false)}
                className="w-1/2 py-2.5 rounded-[3px] border border-white/10 text-xs font-mono text-white/70 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEndScreening}
                className="w-1/2 py-2.5 rounded-[3px] bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold uppercase transition-colors"
              >
                End Screening
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREENING CONCLUDED (ALL LEAVE AUTOMATICALLY) ── */}
      {isRoomEnded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-fade-in">
          <div className="glass-panel p-8 rounded-[8px] max-w-md w-full text-center border border-vc-gold/40 shadow-[0_25px_90px_rgba(0,0,0,0.95)] bg-[#0a0a0c]">
            <span className="text-4xl mb-3 block">🎬</span>
            <h3 className="font-serif text-2xl font-bold text-vc-gold mb-2">Screening Concluded</h3>
            <p className="text-xs text-white/80 mb-2 leading-relaxed">
              {endedReason}
            </p>
            <p className="text-[11px] font-mono text-vc-text-muted mb-6">
              Returning to VCinema lobby in {redirectCountdown ?? 3}s...
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-vc-gold text-black text-xs font-mono font-bold uppercase rounded-[3px] hover:bg-vc-gold-bright transition-colors font-mono tracking-wider"
            >
              Return to Lobby Now &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ── KICKED OUT SCREEN ── */}
      {isKicked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-fade-in">
          <div className="glass-panel p-8 rounded-[8px] max-w-md w-full text-center border border-red-500/50 shadow-[0_25px_90px_rgba(255,0,0,0.3)] bg-[#0f0707]">
            <span className="text-4xl mb-3 block">🚫</span>
            <h3 className="font-serif text-2xl font-bold text-red-400 mb-2">Removed from Screening</h3>
            <p className="text-xs text-white/80 mb-2 leading-relaxed">
              You were removed from this auditorium by the Host.
            </p>
            <p className="text-[11px] font-mono text-vc-text-muted mb-6">
              Redirecting in {redirectCountdown ?? 3}s...
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold uppercase rounded-[3px] transition-colors font-mono tracking-wider"
            >
              Return to Home &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
