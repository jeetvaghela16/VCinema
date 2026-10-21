import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Movie, Series } from '../../types';
import {
  STREAM_SERVERS,
  AUDIO_LANGUAGES,
  getEmbedStreamUrl,
  fetchMovieTrailerKey,
  fetchSeriesTrailerKey,
  fetchSeriesDetails,
  fetchSeasonEpisodes,
  type TmdbSeriesDetails,
  type TmdbEpisode,
} from '../../services/tmdbService';
import { cn } from '../../utils/cn';
import { secureLogger } from '../../utils/secureLogger';

interface WatchModalProps {
  item: (Movie | Series) | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WatchModal({ item, isOpen, onClose }: WatchModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stream' | 'trailer'>('stream');
  const [selectedServer, setSelectedServer] = useState<string>('vidfast');
  const [selectedAudioLang, setSelectedAudioLang] = useState<string>('hindi');
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);

  // OTT TV Series Details & Episodes
  const [seriesDetails, setSeriesDetails] = useState<TmdbSeriesDetails | null>(null);
  const [episodesList, setEpisodesList] = useState<TmdbEpisode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  const isTv = Boolean(
    item &&
      ('seasons' in item ||
        (item as any).isTv ||
        item.id.startsWith('tmdb-tv-') ||
        item.genre?.toLowerCase().includes('series') ||
        seriesDetails !== null)
  );
  const tmdbId = item?.tmdbId;

  // Reset tab and load trailer / series details on item change
  useEffect(() => {
    if (!item) return;

    setActiveTab('stream');
    setSelectedSeason(1);
    setSelectedEpisode(1);
    setTrailerKey(item.trailerKey || null);
    setSeriesDetails(null);
    setEpisodesList([]);

    // 1. Fetch Trailer
    if (!item.trailerKey && tmdbId) {
      setIsLoadingTrailer(true);
      const isTvItem = 'seasons' in item;
      const fetchTrailer = isTvItem ? fetchSeriesTrailerKey(tmdbId) : fetchMovieTrailerKey(tmdbId);
      fetchTrailer
        .then((key) => {
          if (key) setTrailerKey(key);
        })
        .finally(() => setIsLoadingTrailer(false));
    }

    // 2. Fetch Full Series Details (Seasons)
    if (tmdbId && ('seasons' in item || (item as any).isTv)) {
      fetchSeriesDetails(tmdbId).then((details) => {
        if (details) {
          setSeriesDetails(details);
        }
      });
    }
  }, [item?.id, tmdbId]);

  // Fetch episodes whenever season changes
  useEffect(() => {
    if (!tmdbId || !isTv) return;

    setIsLoadingEpisodes(true);
    fetchSeasonEpisodes(tmdbId, selectedSeason)
      .then((eps) => {
        setEpisodesList(eps);
      })
      .catch((err) => secureLogger.warn('Could not load season episodes:', err))
      .finally(() => setIsLoadingEpisodes(false));
  }, [tmdbId, isTv, selectedSeason]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  // Calculate stream URL with audio language
  const currentStreamUrl = tmdbId
    ? getEmbedStreamUrl(tmdbId, isTv ? 'tv' : 'movie', selectedSeason, selectedEpisode, selectedServer, selectedAudioLang)
    : item.videoUrl || '';

  const validSeasons = seriesDetails?.seasons || [];
  const totalSeasons = validSeasons.length > 0 ? validSeasons.length : isTv && 'seasons' in item ? Math.max(1, item.seasons) : 1;
  const currentSeasonInfo = validSeasons.find((s) => s.season_number === selectedSeason);
  const totalEpisodes = currentSeasonInfo
    ? currentSeasonInfo.episode_count
    : episodesList.length > 0
    ? episodesList.length
    : isTv && 'episodes' in item
    ? Math.max(1, item.episodes)
    : 12;

  // Currently playing episode details
  const activeEpisodeData = episodesList.find((e) => e.episode_number === selectedEpisode);

  // Handle Audio Language Switch
  const handleSelectAudioLang = (langId: string) => {
    setSelectedAudioLang(langId);
    const langConfig = AUDIO_LANGUAGES.find((l) => l.id === langId);
    if (langConfig) {
      setSelectedServer(langConfig.recommendedServerId);
    }
  };

  // Quick next/prev episode controls
  const handlePrevEpisode = () => {
    if (selectedEpisode > 1) {
      setSelectedEpisode((prev) => prev - 1);
    } else if (selectedSeason > 1) {
      setSelectedSeason((prev) => prev - 1);
      setSelectedEpisode(1);
    }
  };

  const handleNextEpisode = () => {
    if (selectedEpisode < totalEpisodes) {
      setSelectedEpisode((prev) => prev + 1);
    } else if (selectedSeason < totalSeasons) {
      setSelectedSeason((prev) => prev + 1);
      setSelectedEpisode(1);
    }
  };

  // Launch Watch Party in Theatre Room
  const handleStartWatchParty = () => {
    onClose();
    navigate('/create-theatre', {
      state: {
        preselectedMovieId: item.id,
        preselectedItem: item,
        preselectedAudioLang: selectedAudioLang,
        preselectedServer: selectedServer,
        preselectedSeason: selectedSeason,
        preselectedEpisode: selectedEpisode,
      },
    });
  };

  const activeServerData = STREAM_SERVERS.find((s) => s.id === selectedServer) || STREAM_SERVERS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/95 backdrop-blur-md animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className="glass-panel w-full max-w-6xl rounded-[8px] border border-vc-gold/30 shadow-[0_25px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* ── Top Bar with Title, OTT Badge & Close ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/80 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[10px] font-mono tracking-widest text-vc-gold uppercase px-2 py-0.5 rounded-[2px] bg-vc-gold/10 border border-vc-gold/30 flex-shrink-0">
              {isTv ? 'Web Series' : 'Cinema Feature'}
            </span>
            <h2 className="font-serif text-base sm:text-lg font-bold text-vc-text-primary truncate">
              {item.title}
            </h2>
            {isTv && (
              <span className="text-xs font-mono text-white/50 hidden sm:inline-block">
                &middot; S{selectedSeason}:E{selectedEpisode}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {isTv && (
              <button
                type="button"
                onClick={() => {
                  const epSection = document.getElementById('watch-modal-episodes-section');
                  epSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] bg-vc-gold/15 hover:bg-vc-gold/25 border border-vc-gold/40 text-vc-gold text-xs font-mono transition-all"
                title="Jump to Season & Episode list"
              >
                <span>📺 Episodes ({totalEpisodes})</span>
              </button>
            )}
            <button
              onClick={handleStartWatchParty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-vc-gold text-black text-xs font-semibold font-mono uppercase tracking-wider hover:bg-vc-gold-bright transition-all shadow-[0_0_15px_rgba(198,167,106,0.3)] active:scale-95"
              title="Watch synchronized with friends in a virtual theatre room"
            >
              <span>👑 Watch with Friends</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Close player"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Video Player Screen (Proportionally Constrained so Controls & Episodes are always visible) ── */}
        <div className="relative w-full bg-black flex-shrink-0 overflow-hidden shadow-2xl flex items-center justify-center border-b border-white/10">
          <div className="w-full aspect-video max-h-[46vh] sm:max-h-[50vh] flex items-center justify-center bg-[#050504]">
            {activeTab === 'stream' ? (
              currentStreamUrl ? (
                <iframe
                  key={`${currentStreamUrl}-${selectedServer}-${selectedAudioLang}-${selectedSeason}-${selectedEpisode}`}
                  src={currentStreamUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  title={`${item.title} Player`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-vc-text-muted p-6 text-center">
                  <p className="text-sm">Video stream not available for this title.</p>
                  {trailerKey && (
                    <button
                      onClick={() => setActiveTab('trailer')}
                      className="mt-3 px-4 py-1.5 bg-vc-gold text-black text-xs font-mono font-semibold rounded-[3px]"
                    >
                      Watch Official Trailer Instead
                    </button>
                  )}
                </div>
              )
            ) : trailerKey ? (
              <iframe
                key={`trailer-${trailerKey}`}
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&modestbranding=1&rel=0`}
                className="w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                title={`${item.title} Trailer`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-vc-text-muted p-6 text-center">
                <p className="text-sm">
                  {isLoadingTrailer ? 'Locating official trailer...' : 'No trailer found for this title.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Scrollable Controls, Server Deck & OTT Episode Selector ── */}
        <div className="overflow-y-auto flex-1 divide-y divide-white/5 bg-[#08080a]">
          {/* ── BAR 1: Fast Server Switcher Strip ── */}
          {activeTab === 'stream' && tmdbId && (
            <div className="px-4 sm:px-6 py-2.5 bg-black/60 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
                <span className="text-[10px] font-mono text-vc-gold uppercase tracking-wider font-semibold mr-1 flex items-center gap-1 flex-shrink-0">
                  <span>⚡ Servers:</span>
                </span>
                {STREAM_SERVERS.map((server) => {
                  const isHindiServer = server.category === 'hindi';
                  const isSelected = selectedServer === server.id;
                  return (
                    <button
                      key={server.id}
                      onClick={() => setSelectedServer(server.id)}
                      className={cn(
                        'px-2.5 py-1 rounded-[3px] text-[10px] font-mono transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0',
                        isSelected
                          ? 'border border-vc-gold text-black bg-vc-gold font-bold shadow-[0_0_12px_rgba(198,167,106,0.4)]'
                          : isHindiServer && selectedAudioLang === 'hindi'
                          ? 'border border-vc-gold/40 text-vc-gold/90 bg-vc-gold/10 hover:border-vc-gold'
                          : 'border border-white/10 text-white/70 hover:text-white hover:border-white/25 bg-white/5'
                      )}
                      title={`${server.name} — ${server.audioSupport}`}
                    >
                      <span>{server.name.replace(/Server \d+ /, '')}</span>
                      <span className={cn('text-[9px] px-1 py-0.2 rounded', isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60')}>
                        {server.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Informative Server Status */}
              <div className="text-[10px] text-white/50 font-mono hidden md:block">
                Streaming via <span className="text-vc-gold font-bold">{activeServerData.name}</span> &middot; {activeServerData.audioSupport}
              </div>
            </div>
          )}

          {/* ── BAR 2: Audio Dub Selector & Mode Switch ── */}
          <div className="px-4 sm:px-6 py-2.5 bg-black/40 flex flex-wrap items-center justify-between gap-2.5">
            {activeTab === 'stream' && tmdbId ? (
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
                <span className="text-[10px] font-mono text-vc-gold uppercase tracking-wider font-semibold mr-1 flex items-center gap-1 flex-shrink-0">
                  <span>🎧 Audio Dub:</span>
                </span>
                {AUDIO_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleSelectAudioLang(lang.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-[3px] text-[10px] font-mono transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0',
                      selectedAudioLang === lang.id
                        ? 'bg-vc-gold text-black font-bold shadow-[0_0_12px_rgba(198,167,106,0.35)]'
                        : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/25'
                    )}
                    title={lang.description}
                  >
                    <span>{lang.glyph}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs font-mono text-vc-gold flex items-center gap-1.5">
                <span>🎬 Official Trailer Projection</span>
              </div>
            )}

            {/* Mode Switcher: Full Stream vs Official Trailer */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setActiveTab('stream')}
                className={cn(
                  'px-3 py-1 rounded-[3px] text-[10px] font-mono uppercase tracking-wider transition-all',
                  activeTab === 'stream'
                    ? 'bg-vc-gold/20 text-vc-gold border border-vc-gold/50 font-semibold'
                    : 'bg-white/5 text-vc-text-muted hover:text-white border border-transparent'
                )}
              >
                ▶ Full Stream
              </button>
              <button
                onClick={() => setActiveTab('trailer')}
                className={cn(
                  'px-3 py-1 rounded-[3px] text-[10px] font-mono uppercase tracking-wider transition-all',
                  activeTab === 'trailer'
                    ? 'bg-vc-gold/20 text-vc-gold border border-vc-gold/50 font-semibold'
                    : 'bg-white/5 text-vc-text-muted hover:text-white border border-transparent'
                )}
              >
                🎬 Trailer
              </button>
            </div>
          </div>

          {/* Hindi Dub Tip Banner */}
          {selectedAudioLang === 'hindi' && activeTab === 'stream' && (
            <div className="px-4 sm:px-6 py-2 bg-vc-gold/10 border-b border-vc-gold/20 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-vc-gold">
              <div className="flex items-center gap-2">
                <span>🎧</span>
                <span>
                  <strong>Hindi Dub Active:</strong> Recommended on <strong>Server 4 (MultiEmbed)</strong> & <strong>Server 2 (Nxsha)</strong>. If English plays by default, click the ⚙ Gear / Audio icon in the video player or click Server 4.
                </span>
              </div>
              {selectedServer !== 'multiembed' && (
                <button
                  onClick={() => setSelectedServer('multiembed')}
                  className="px-2 py-0.5 rounded bg-vc-gold text-black text-[10px] font-bold uppercase hover:bg-vc-gold-bright flex-shrink-0 transition-colors"
                >
                  Switch to Server 4 &rarr;
                </button>
              )}
            </div>
          )}

          {/* ── BAR 3: Quick Episode Nav (For Web Series) ── */}
          {isTv && activeTab === 'stream' && (
            <div className="px-4 sm:px-6 py-2.5 bg-vc-gold/[0.03] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-vc-gold/15 text-vc-gold border border-vc-gold/30">
                  Current Episode
                </span>
                <span className="text-xs sm:text-sm font-semibold text-vc-text-primary truncate">
                  Season {selectedSeason} &middot; Episode {selectedEpisode}
                  {activeEpisodeData?.name ? `: ${activeEpisodeData.name}` : ''}
                </span>
              </div>

              {/* Prev / Next Quick Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handlePrevEpisode}
                  disabled={selectedSeason === 1 && selectedEpisode === 1}
                  className="px-2.5 py-1 rounded-[2px] bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono text-white/80 transition-colors flex items-center gap-1"
                >
                  <span>⏮</span>
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  onClick={handleNextEpisode}
                  disabled={selectedSeason === totalSeasons && selectedEpisode === totalEpisodes}
                  className="px-2.5 py-1 rounded-[2px] bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono text-white/80 transition-colors flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span>⏭</span>
                </button>
              </div>
            </div>
          )}

          {/* ── OTT SEASONS & EPISODES BROWSER (Real OTT Grid like AlmostOTT / Netflix) ── */}
          {isTv && activeTab === 'stream' && (
            <div id="watch-modal-episodes-section" className="px-4 sm:px-6 py-4 space-y-4">
              {/* Header with Season Selector Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-xs font-semibold text-vc-text-primary tracking-widest uppercase font-mono flex items-center gap-2">
                    <span className="text-vc-gold">📺</span>
                    <span>All Seasons & Episodes</span>
                  </h3>
                  <p className="text-[11px] text-vc-text-muted mt-0.5">
                    Click any episode to stream instantly in your chosen audio dub
                  </p>
                </div>

                {/* Season Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
                  {validSeasons.length > 0
                    ? validSeasons.map((s) => (
                        <button
                          key={s.season_number}
                          onClick={() => {
                            setSelectedSeason(s.season_number);
                            setSelectedEpisode(1);
                          }}
                          className={cn(
                            'px-3 py-1 rounded-[3px] text-xs font-mono transition-all whitespace-nowrap flex items-center gap-1.5',
                            selectedSeason === s.season_number
                              ? 'bg-vc-gold text-black font-bold shadow-[0_0_12px_rgba(198,167,106,0.35)]'
                              : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20'
                          )}
                        >
                          <span>Season {s.season_number}</span>
                          <span className={cn('text-[10px]', selectedSeason === s.season_number ? 'text-black/70' : 'text-white/40')}>
                            ({s.episode_count} eps)
                          </span>
                        </button>
                      ))
                    : Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setSelectedSeason(s);
                            setSelectedEpisode(1);
                          }}
                          className={cn(
                            'px-3 py-1 rounded-[3px] text-xs font-mono transition-all whitespace-nowrap',
                            selectedSeason === s
                              ? 'bg-vc-gold text-black font-bold'
                              : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'
                          )}
                        >
                          Season {s}
                        </button>
                      ))}
                </div>
              </div>

              {/* Episodes List Grid */}
              {isLoadingEpisodes ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-vc-gold border-t-transparent animate-spin" />
                  <span className="text-xs font-mono text-vc-text-muted">Loading episodes for Season {selectedSeason}...</span>
                </div>
              ) : episodesList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1">
                  {episodesList.map((ep) => {
                    const isCurrent = selectedEpisode === ep.episode_number;
                    const stillUrl = ep.still_path || item.backdropUrl || item.posterUrl;
                    return (
                      <div
                        key={ep.id || ep.episode_number}
                        onClick={() => setSelectedEpisode(ep.episode_number)}
                        className={cn(
                          'group cursor-pointer rounded-[4px] border overflow-hidden transition-all duration-200 flex flex-col bg-vc-bg-base/60 hover:bg-vc-bg-base',
                          isCurrent
                            ? 'border-vc-gold bg-vc-gold/10 ring-1 ring-vc-gold shadow-[0_0_20px_rgba(198,167,106,0.25)] -translate-y-0.5'
                            : 'border-white/10 hover:border-white/30 hover:-translate-y-0.5'
                        )}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video w-full bg-black/80 overflow-hidden">
                          {stillUrl ? (
                            <img
                              src={stillUrl}
                              alt={ep.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-vc-gold/40">
                              EP {ep.episode_number}
                            </div>
                          )}

                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] bg-black/80 text-white backdrop-blur-sm border border-white/10">
                              EP {ep.episode_number}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] bg-vc-gold text-black uppercase tracking-wider animate-pulse">
                                ▶ Playing
                              </span>
                            )}
                          </div>

                          {/* Runtime Badge */}
                          {ep.runtime && (
                            <div className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-black/80 text-white/80 backdrop-blur-sm">
                              {ep.runtime}m
                            </div>
                          )}

                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-vc-gold/90 text-black flex items-center justify-center text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform">
                              ▶
                            </div>
                          </div>
                        </div>

                        {/* Text Details */}
                        <div className="p-3 flex flex-col justify-between flex-1">
                          <div>
                            <h4 className={cn('text-xs font-bold leading-snug line-clamp-1 transition-colors', isCurrent ? 'text-vc-gold' : 'text-white group-hover:text-vc-gold')}>
                              {ep.episode_number}. {ep.name || `Episode ${ep.episode_number}`}
                            </h4>
                            <p className="text-[11px] text-vc-text-muted line-clamp-2 mt-1 leading-relaxed">
                              {ep.overview || 'Streaming with synchronized audio in your virtual auditorium.'}
                            </p>
                          </div>
                          {ep.air_date && (
                            <span className="text-[9px] font-mono text-white/40 mt-2">
                              Aired {ep.air_date}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback Episode Pills */
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                    <button
                      key={ep}
                      onClick={() => setSelectedEpisode(ep)}
                      className={cn(
                        'p-2.5 rounded-[3px] border text-center transition-all flex flex-col items-center justify-center',
                        selectedEpisode === ep
                          ? 'border-vc-gold bg-vc-gold text-black font-bold'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <span className="text-[10px] font-mono opacity-60">EPISODE</span>
                      <span className="text-sm font-bold font-mono">{ep}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Movie / Series Metadata & Cast Overview ── */}
          <div className="p-4 sm:p-6 space-y-3 bg-[#0a0a0c]">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-vc-gold font-bold">★ {item.rating}</span>
              <span className="text-white/30">&middot;</span>
              <span className="text-vc-text-muted">{item.year}</span>
              <span className="text-white/30">&middot;</span>
              <span className="text-vc-text-muted">{item.genre}</span>
              <span className="text-white/30">&middot;</span>
              <span className="text-vc-text-muted">{'duration' in item ? item.duration : `${totalSeasons} Seasons &middot; ${totalEpisodes} Episodes`}</span>
              {item.originCountry && (
                <>
                  <span className="text-white/30">&middot;</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70 uppercase">
                    {item.originCountry}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-vc-text-muted leading-relaxed max-w-3xl">
              {item.description}
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleStartWatchParty}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-vc-gold text-black rounded-[3px] text-xs font-semibold font-mono uppercase tracking-wider hover:bg-vc-gold-bright transition-all shadow-[0_4px_16px_rgba(198,167,106,0.25)]"
              >
                <span>🏛 Create Watch Party with Friends</span>
              </button>
              <span className="text-[11px] text-vc-text-muted/60 font-mono">
                Synchronized 4K playback &middot; Live theatre chat &middot; Host controls
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
