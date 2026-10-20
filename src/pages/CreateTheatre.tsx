import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { theatreTypes } from '../data/theatres';
import { movies } from '../data/movies';
import {
  CURATED_GLOBAL_MOVIES,
  AUDIO_LANGUAGES,
  STREAM_SERVERS,
  fetchTrendingMovies,
  fetchTrendingSeries,
  searchMovies,
  searchSeries,
  fetchSeriesDetails,
  type TmdbSeriesDetails,
} from '../services/tmdbService';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';
import { createTheatreRoom, type CreateTheatreMediaData } from '../services/theatreService';
import type { TheatreFormat } from '../types/theatre';
import type { Movie, Series } from '../types';

function extractYoutubeId(url: string): string | undefined {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : undefined;
}

export default function CreateTheatre() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const locationState = location.state as {
    preselectedMovieId?: string;
    preselectedItem?: Movie | Series;
    preselectedAudioLang?: string;
    preselectedServer?: string;
    preselectedSeason?: number;
    preselectedEpisode?: number;
  } | null;

  const [selectedType, setSelectedType] = useState<TheatreFormat>('friends');
  const [theatreName, setTheatreName] = useState('Midnight Screen 01');
  const [maxViewers, setMaxViewers] = useState(10);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Category and Search State
  const [activeCategory, setActiveCategory] = useState<
    'trending-movies' | 'trending-series' | 'classics' | 'exclusives' | 'custom'
  >('trending-movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Movie | Series)[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Catalogs
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>(CURATED_GLOBAL_MOVIES);
  const [trendingSeries, setTrendingSeries] = useState<Series[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false);

  // Selected Presentation State
  const [selectedMedia, setSelectedMedia] = useState<Movie | Series>(() => {
    if (locationState?.preselectedItem) return locationState.preselectedItem;
    if (locationState?.preselectedMovieId) {
      const match =
        CURATED_GLOBAL_MOVIES.find((m) => m.id === locationState.preselectedMovieId) ||
        movies.find((m) => m.id === locationState.preselectedMovieId);
      if (match) return match;
    }
    return CURATED_GLOBAL_MOVIES[0];
  });

  // Audio & Server Presets
  const [selectedAudioLang, setSelectedAudioLang] = useState<string>(
    locationState?.preselectedAudioLang || 'hindi'
  );
  const [selectedServer, setSelectedServer] = useState<string>(
    locationState?.preselectedServer || 'vidfast'
  );
  const [selectedSeason, setSelectedSeason] = useState<number>(
    locationState?.preselectedSeason || 1
  );
  const [selectedEpisode, setSelectedEpisode] = useState<number>(
    locationState?.preselectedEpisode || 1
  );

  // Live TMDB TV Series Details (Real Seasons & Episode Counts)
  const [seriesDetails, setSeriesDetails] = useState<TmdbSeriesDetails | null>(null);
  const [isLoadingSeriesDetails, setIsLoadingSeriesDetails] = useState(false);

  // Custom Stream Link
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  // Fetch true series details (all seasons & episodes count) from TMDB when a TV series is selected
  useEffect(() => {
    if (!selectedMedia) {
      setSeriesDetails(null);
      return;
    }
    const isTv = 'seasons' in selectedMedia || activeCategory === 'trending-series';
    if (isTv && selectedMedia.tmdbId) {
      setIsLoadingSeriesDetails(true);
      fetchSeriesDetails(selectedMedia.tmdbId)
        .then((details) => {
          if (details) {
            setSeriesDetails(details);
            if (selectedSeason > details.number_of_seasons) {
              setSelectedSeason(1);
            }
          }
        })
        .catch((err) => console.warn('Could not fetch series details:', err))
        .finally(() => setIsLoadingSeriesDetails(false));
    } else {
      setSeriesDetails(null);
    }
  }, [selectedMedia?.id, selectedMedia?.tmdbId, activeCategory]);

  const selectedTypeData = theatreTypes.find((t) => t.id === selectedType) ?? theatreTypes[0];
  const maxLimit = selectedTypeData.maxViewers;
  const minLimit = 2;

  // Load trending movies and series on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCatalogs(true);

    Promise.all([fetchTrendingMovies(1), fetchTrendingSeries(1)])
      .then(([movs, sers]) => {
        if (!isMounted) return;
        if (movs?.length) setTrendingMovies(movs);
        if (sers?.length) setTrendingSeries(sers);
      })
      .catch((err) => console.warn('Failed to load trending catalogs:', err))
      .finally(() => {
        if (isMounted) setIsLoadingCatalogs(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced search across both global movies and web series
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const [movs, sers] = await Promise.all([searchMovies(q), searchSeries(q)]);
        setSearchResults([...movs, ...sers]);
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Audio language selection
  const handleAudioLangChange = (langId: string) => {
    setSelectedAudioLang(langId);
    const conf = AUDIO_LANGUAGES.find((l) => l.id === langId);
    if (conf) {
      setSelectedServer(conf.recommendedServerId);
    }
  };

  // Handle room creation
  const handleCreate = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/create-theatre' } } });
      return;
    }

    if (!theatreName.trim()) {
      setErrorMessage('Please give your virtual auditorium a name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const isTv = selectedMedia ? 'seasons' in selectedMedia : false;

      let mediaData: CreateTheatreMediaData;

      if (activeCategory === 'custom' && customUrl.trim()) {
        const ytId = extractYoutubeId(customUrl.trim());
        mediaData = {
          id: `custom-${Date.now()}`,
          title: customTitle.trim() || 'Custom Presentation',
          videoUrl: ytId ? undefined : customUrl.trim(),
          trailerKey: ytId,
          mediaType: ytId ? 'trailer' : 'video',
          audioLanguage: selectedAudioLang,
          streamServerId: selectedServer,
        };
      } else {
        mediaData = {
          id: selectedMedia.id,
          title: selectedMedia.title,
          year: selectedMedia.year,
          genre: selectedMedia.genre,
          rating: selectedMedia.rating,
          duration: 'duration' in selectedMedia ? selectedMedia.duration : '2h 15m',
          description: selectedMedia.description || '',
          posterUrl: selectedMedia.posterUrl || '',
          backdropUrl: selectedMedia.backdropUrl || '',
          trailerKey: selectedMedia.trailerKey || '',
          videoUrl: selectedMedia.videoUrl || '',
          tmdbId: selectedMedia.tmdbId,
          isTv,
          season: isTv ? selectedSeason : 1,
          episode: isTv ? selectedEpisode : 1,
          audioLanguage: selectedAudioLang,
          streamServerId: selectedServer,
          mediaType: selectedMedia.videoUrl
            ? 'video'
            : selectedMedia.trailerKey
            ? 'trailer'
            : 'embed',
        };
      }

      const room = await createTheatreRoom(
        {
          name: theatreName,
          format: selectedType,
          maxViewers,
          movieId: selectedMedia.id,
          isPasswordProtected: usePassword,
          password: usePassword ? password : '',
          mediaData,
        },
        user
      );

      navigate(`/theatre/${room.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize theatre room.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keep slider and displayed capacity strictly synchronized when theatre type changes
  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId as TheatreFormat);
    const targetType = theatreTypes.find((t) => t.id === typeId);
    if (targetType) {
      setMaxViewers((current) => Math.min(Math.max(current, minLimit), targetType.maxViewers));
    }
  };

  // Immediate synchronization when slider is adjusted
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setMaxViewers(Math.min(Math.max(val, minLimit), maxLimit));
  };

  // Nudge buttons for precision keyboard/touch control
  const adjustCapacity = (delta: number) => {
    setMaxViewers((prev) => Math.min(Math.max(prev + delta, minLimit), maxLimit));
  };

  // Track progress fill percentage for custom range styling
  const sliderPercentage =
    maxLimit > minLimit ? ((maxViewers - minLimit) / (maxLimit - minLimit)) * 100 : 100;

  // Active items to display in grid
  const displayedItems: (Movie | Series)[] = searchQuery.trim()
    ? searchResults
    : activeCategory === 'trending-movies'
    ? trendingMovies
    : activeCategory === 'trending-series'
    ? trendingSeries
    : activeCategory === 'classics'
    ? CURATED_GLOBAL_MOVIES
    : activeCategory === 'exclusives'
    ? movies
    : [];

  const isSelectedTv = Boolean(
    selectedMedia && ('seasons' in selectedMedia || seriesDetails !== null || activeCategory === 'trending-series')
  );
  const validSeasons = seriesDetails?.seasons || [];
  const totalSeasons =
    validSeasons.length > 0
      ? validSeasons.length
      : isSelectedTv && selectedMedia && 'seasons' in selectedMedia
      ? Math.max(1, selectedMedia.seasons)
      : 1;

  const currentSeasonInfo = validSeasons.find((s) => s.season_number === selectedSeason);
  const totalEpisodes = currentSeasonInfo
    ? currentSeasonInfo.episode_count
    : isSelectedTv && selectedMedia && 'episodes' in selectedMedia
    ? Math.max(1, selectedMedia.episodes)
    : 12;

  return (
    <div className="min-h-screen pt-[72px] pb-24 bg-vc-bg-base">
      {/* ── Console Header ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-10 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-[0.25em] text-vc-gold uppercase px-2 py-0.5 border border-vc-gold/30 rounded-[2px] bg-vc-gold/5">
            Auditorium Architecture
          </span>
          <span className="text-xs text-vc-text-muted">&middot; Step 1 of 1</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-vc-text-primary mt-2 mb-2">
          Configure Virtual Theatre
        </h1>
        <p className="text-vc-text-muted text-sm max-w-xl">
          Establish a synchronized virtual screening room. Pick any worldwide movie or web series with full dubbed audio, and invite your friends.
        </p>
      </div>

      {/* ── Main Configuration Canvas ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <div className="glass-panel rounded-[6px] border border-vc-border/80 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 sm:p-8 md:p-10 space-y-10">

          {/* ── SECTION 01: Theatre Type (Screening Architecture) ── */}
          <fieldset className="space-y-4">
            <div className="flex items-center justify-between border-b border-vc-border/60 pb-3">
              <div>
                <legend className="text-xs font-semibold text-vc-text-primary tracking-widest uppercase">
                  01 &middot; Choose Theatre Format
                </legend>
                <p className="text-[11px] text-vc-text-muted mt-0.5">
                  Select the spatial atmosphere and audience scope
                </p>
              </div>
              <span className="text-[10px] font-mono text-vc-gold tracking-widest uppercase">
                {theatreTypes.length} Presets Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1" role="radiogroup" aria-label="Auditorium Format">
              {theatreTypes.map((type) => {
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleTypeSelect(type.id)}
                    className={cn(
                      'text-left p-4 rounded-[4px] border transition-all duration-200 relative group flex flex-col justify-between h-full',
                      isSelected
                        ? 'border-vc-gold bg-vc-gold/5 shadow-[0_0_20px_rgba(198,167,106,0.15)] ring-1 ring-vc-gold/40'
                        : 'border-vc-border bg-vc-bg-base/40 hover:border-vc-border-subtle hover:bg-vc-bg-base/70',
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-serif text-sm font-semibold text-vc-text-primary group-hover:text-vc-gold-bright transition-colors flex items-center gap-1.5">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-mono px-2 py-0.5 rounded-[2px] transition-colors',
                            isSelected
                              ? 'bg-vc-gold text-black font-semibold'
                              : 'bg-white/5 text-vc-text-muted border border-white/5',
                          )}
                        >
                          Up to {type.maxViewers} seats
                        </span>
                      </div>
                      <p className="text-xs text-vc-text-muted leading-relaxed mb-3">
                        {type.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-vc-border/40 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-vc-text-muted/80">{type.icon} Room</span>
                      <span className={cn('uppercase tracking-wider text-[10px]', isSelected ? 'text-vc-gold' : 'text-vc-text-muted/60')}>
                        {type.maxViewers} Seats Max
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* ── SECTION 02: Auditorium Identity ── */}
          <div className="space-y-4">
            <div className="border-b border-vc-border/60 pb-3">
              <label htmlFor="theatre-name" className="text-xs font-semibold text-vc-text-primary tracking-widest uppercase block">
                02 &middot; Auditorium Name
              </label>
              <p className="text-[11px] text-vc-text-muted mt-0.5">
                Displayed on admissions tickets and marquee headers
              </p>
            </div>

            <div className="relative">
              <input
                id="theatre-name"
                type="text"
                value={theatreName}
                maxLength={60}
                onChange={(e) => setTheatreName(e.target.value)}
                placeholder="e.g. Midnight Salon, Cinema Paradiso, Christopher Nolan Night"
                className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3.5 text-sm text-vc-text-primary placeholder-vc-text-muted/40 focus:border-vc-gold/60 focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-vc-text-muted/50">
                {theatreName.length}/60
              </span>
            </div>
          </div>

          {/* ── SECTION 03: Seating Capacity Slider ── */}
          <div className="space-y-4">
            <div className="border-b border-vc-border/60 pb-3 flex items-center justify-between">
              <div>
                <label htmlFor="capacity-slider" className="text-xs font-semibold text-vc-text-primary tracking-widest uppercase block">
                  03 &middot; Seating Capacity
                </label>
                <p className="text-[11px] text-vc-text-muted mt-0.5">
                  Synchronized live viewers permitted simultaneously
                </p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] font-mono text-vc-text-muted uppercase">Max Viewers:</span>
                <span className="text-base font-mono font-bold text-vc-gold">
                  {maxViewers}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustCapacity(-1)}
                  disabled={maxViewers <= minLimit}
                  className="w-8 h-8 rounded-[3px] border border-vc-border bg-vc-bg-base hover:border-vc-gold/40 text-vc-text-muted hover:text-vc-gold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-mono text-base transition-colors"
                  aria-label="Decrease seats"
                >
                  -
                </button>

                <div className="relative flex-1 py-2">
                  <input
                    id="capacity-slider"
                    type="range"
                    min={minLimit}
                    max={maxLimit}
                    step={1}
                    value={maxViewers}
                    onChange={handleSliderChange}
                    className="w-full h-1.5 bg-vc-bg-base rounded-full appearance-none cursor-pointer accent-vc-gold focus:outline-none focus:ring-1 focus:ring-vc-gold/50"
                    style={{
                      background: `linear-gradient(to right, #C6A76A 0%, #C6A76A ${sliderPercentage}%, rgba(255,255,255,0.08) ${sliderPercentage}%, rgba(255,255,255,0.08) 100%)`,
                    }}
                    aria-label={`Auditorium Capacity: ${maxViewers} viewers`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => adjustCapacity(1)}
                  disabled={maxViewers >= maxLimit}
                  className="w-8 h-8 rounded-[3px] border border-vc-border bg-vc-bg-base hover:border-vc-gold/40 text-vc-text-muted hover:text-vc-gold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-mono text-base transition-colors"
                  aria-label="Increase seats"
                >
                  +
                </button>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-vc-text-muted/60 px-1">
                <span>Min: {minLimit} Seats</span>
                <span className="text-vc-gold/80">Limit: {maxLimit} Viewers</span>
              </div>
            </div>
          </div>

          {/* ── SECTION 04: Feature Presentation Selector (WORLDWIDE CATALOG & DUBS) ── */}
          <div className="space-y-4">
            <div className="border-b border-vc-border/60 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="text-xs font-semibold text-vc-text-primary tracking-widest uppercase block">
                  04 &middot; Feature Presentation & Dubbed Audio
                </label>
                <p className="text-[11px] text-vc-text-muted mt-0.5">
                  Pick any movie or web series in the world with Hindi, Multi-Audio, or English dubs
                </p>
              </div>

              {/* Audio Dub Preference Selector */}
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                <span className="text-[10px] font-mono text-vc-gold uppercase tracking-wider mr-1">
                  Audio:
                </span>
                {AUDIO_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleAudioLangChange(lang.id)}
                    className={cn(
                      'px-2 py-0.5 rounded-[2px] text-[10px] font-mono transition-all flex items-center gap-1 whitespace-nowrap',
                      selectedAudioLang === lang.id
                        ? 'bg-vc-gold text-black font-bold shadow-[0_0_8px_rgba(198,167,106,0.3)]'
                        : 'bg-white/5 text-white/70 hover:text-white border border-white/10'
                    )}
                    title={lang.description}
                  >
                    <span>{lang.glyph}</span>
                    <span>{lang.label.split('·')[0].trim()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Input with Instant TMDB Search */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vc-gold text-sm pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any movie or web series worldwide (e.g. Stranger Things, Avengers, Inception, Mirzapur, Dark, Attack on Titan)..."
                className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] pl-10 pr-10 py-3 text-sm text-vc-text-primary placeholder-vc-text-muted/50 focus:border-vc-gold focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-vc-text-muted hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Category Tabs (When not searching) */}
            {!searchQuery.trim() && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => setActiveCategory('trending-movies')}
                  className={cn(
                    'px-3 py-1.5 rounded-[3px] text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5',
                    activeCategory === 'trending-movies'
                      ? 'bg-vc-gold text-black font-bold shadow-[0_0_12px_rgba(198,167,106,0.25)]'
                      : 'bg-white/5 text-vc-text-muted hover:text-white border border-white/5'
                  )}
                >
                  <span>🔥 Trending Movies</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('trending-series')}
                  className={cn(
                    'px-3 py-1.5 rounded-[3px] text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5',
                    activeCategory === 'trending-series'
                      ? 'bg-vc-gold text-black font-bold shadow-[0_0_12px_rgba(198,167,106,0.25)]'
                      : 'bg-white/5 text-vc-text-muted hover:text-white border border-white/5'
                  )}
                >
                  <span>📺 Web Series</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('classics')}
                  className={cn(
                    'px-3 py-1.5 rounded-[3px] text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5',
                    activeCategory === 'classics'
                      ? 'bg-vc-gold text-black font-bold shadow-[0_0_12px_rgba(198,167,106,0.25)]'
                      : 'bg-white/5 text-vc-text-muted hover:text-white border border-white/5'
                  )}
                >
                  <span>🏆 Classics & Hits</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('exclusives')}
                  className={cn(
                    'px-3 py-1.5 rounded-[3px] text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5',
                    activeCategory === 'exclusives'
                      ? 'bg-vc-gold text-black font-bold shadow-[0_0_12px_rgba(198,167,106,0.25)]'
                      : 'bg-white/5 text-vc-text-muted hover:text-white border border-white/5'
                  )}
                >
                  <span>🎬 Exclusives</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('custom')}
                  className={cn(
                    'px-3 py-1.5 rounded-[3px] text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5',
                    activeCategory === 'custom'
                      ? 'bg-vc-gold text-black font-bold shadow-[0_0_12px_rgba(198,167,106,0.25)]'
                      : 'bg-white/5 text-vc-text-muted hover:text-white border border-white/5'
                  )}
                >
                  <span>🔗 Custom URL</span>
                </button>
              </div>
            )}

            {/* Custom URL Input View */}
            {activeCategory === 'custom' && !searchQuery.trim() ? (
              <div className="p-4 rounded-[4px] border border-vc-gold/30 bg-black/40 space-y-3">
                <p className="text-xs text-vc-text-muted">
                  Paste any <strong>YouTube video / livestream URL</strong> or <strong>direct MP4 video link</strong> to stream synchronized with friends.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-vc-text-muted uppercase block mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. My Screening Presentation"
                      className="w-full bg-vc-bg-base border border-vc-border rounded-[3px] px-3 py-2 text-xs text-white focus:outline-none focus:border-vc-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-vc-text-muted uppercase block mb-1">
                      Stream Link / URL
                    </label>
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or .mp4"
                      className="w-full bg-vc-bg-base border border-vc-border rounded-[3px] px-3 py-2 text-xs text-white focus:outline-none focus:border-vc-gold"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Media Poster Grid */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-vc-text-muted">
                  <span>
                    {searchQuery.trim()
                      ? isSearching
                        ? 'Searching worldwide catalog...'
                        : `Found ${displayedItems.length} titles matching "${searchQuery}"`
                      : isLoadingCatalogs
                      ? 'Loading worldwide titles...'
                      : `Available Titles (${displayedItems.length})`}
                  </span>
                  <span className="text-[10px] text-vc-gold uppercase tracking-wider">
                    Click poster to select
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[380px] overflow-y-auto p-1 border border-vc-border/40 rounded-[4px] bg-black/40">
                  {displayedItems.map((item) => {
                    const isSelected = selectedMedia?.id === item.id;
                    const isTv = 'seasons' in item;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedMedia(item);
                          setSelectedSeason(1);
                          setSelectedEpisode(1);
                        }}
                        className={cn(
                          'text-left p-2 rounded-[3px] border transition-all duration-150 flex flex-col group relative overflow-hidden',
                          isSelected
                            ? 'border-vc-gold bg-vc-gold/15 shadow-[0_0_15px_rgba(198,167,106,0.35)] ring-1 ring-vc-gold'
                            : 'border-white/5 bg-white/[0.02] hover:border-vc-gold/40 hover:bg-white/[0.06]'
                        )}
                      >
                        {/* Poster Thumbnail */}
                        <div className="aspect-[2/3] w-full rounded-[2px] overflow-hidden bg-black/80 relative mb-2">
                          {item.posterUrl ? (
                            <img
                              src={item.posterUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-serif text-vc-gold text-lg font-bold">
                              V
                            </div>
                          )}

                          {/* Media Type & Rating Badges */}
                          <div className="absolute top-1 left-1 flex flex-col gap-1">
                            <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-[1px] bg-black/80 text-vc-gold border border-vc-gold/40">
                              {isTv ? 'SERIES' : 'MOVIE'}
                            </span>
                          </div>

                          <div className="absolute bottom-1 right-1">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[1px] bg-black/80 text-white font-bold">
                              ★ {item.rating}
                            </span>
                          </div>

                          {/* Selected Checkmark Overlay */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-vc-gold/20 flex items-center justify-center">
                              <span className="w-7 h-7 rounded-full bg-vc-gold text-black flex items-center justify-center font-bold text-sm shadow-lg">
                                ✓
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title & Info */}
                        <p className="text-xs font-serif font-semibold text-vc-text-primary truncate w-full group-hover:text-vc-gold transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-vc-text-muted truncate w-full">
                          {item.year} &middot; {item.genre}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Feature Marquee Preview Card */}
            {selectedMedia && (
              <div className="relative rounded-[4px] border border-vc-gold/50 bg-vc-bg-base/90 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* Backdrop ambient blur in background */}
                {selectedMedia.backdropUrl && (
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedMedia.backdropUrl})` }}
                  />
                )}

                {/* Poster */}
                {selectedMedia.posterUrl ? (
                  <img
                    src={selectedMedia.posterUrl}
                    alt={selectedMedia.title}
                    className="w-20 sm:w-24 h-28 sm:h-36 rounded-[2px] object-cover border border-vc-gold/40 shadow-xl flex-shrink-0 relative z-10"
                  />
                ) : (
                  <div className="w-20 sm:w-24 h-28 sm:h-36 rounded-[2px] bg-black/80 border border-vc-gold/40 flex-shrink-0 flex items-center justify-center font-serif text-vc-gold text-2xl font-bold relative z-10">
                    V
                  </div>
                )}

                {/* Information */}
                <div className="flex-1 min-w-0 relative z-10 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-[2px] bg-vc-gold text-black font-bold">
                      {isSelectedTv ? 'Web Series' : 'Cinema Feature'}
                    </span>
                    <span className="text-[10px] font-mono text-vc-gold border border-vc-gold/30 px-2 py-0.5 rounded-[2px] bg-vc-gold/10">
                      ★ {selectedMedia.rating} &middot; {selectedMedia.year}
                    </span>
                    <span className="text-[10px] font-mono text-vc-text-muted">
                      {selectedMedia.genre}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-vc-text-primary mb-1 truncate">
                    {selectedMedia.title}
                  </h3>

                  <p className="text-xs text-vc-text-muted line-clamp-2 max-w-xl mb-3">
                    {selectedMedia.description}
                  </p>

                  {/* If Web Series: Season & Episode Picker */}
                  {isSelectedTv && (
                    <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap pt-1 border-t border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-vc-gold uppercase tracking-wider flex items-center gap-1">
                          <span>Season:</span>
                          {isLoadingSeriesDetails && (
                            <span className="w-2.5 h-2.5 border border-vc-gold border-t-transparent rounded-full animate-spin inline-block" />
                          )}
                        </span>
                        <select
                          value={selectedSeason}
                          onChange={(e) => {
                            setSelectedSeason(Number(e.target.value));
                            setSelectedEpisode(1);
                          }}
                          className="bg-black/90 border border-white/20 focus:border-vc-gold rounded-[2px] px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
                        >
                          {validSeasons.length > 0
                            ? validSeasons.map((s) => (
                                <option key={s.season_number} value={s.season_number}>
                                  Season {s.season_number} ({s.episode_count} Episodes)
                                </option>
                              ))
                            : Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                                <option key={s} value={s}>
                                  Season {s}
                                </option>
                              ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-vc-gold uppercase tracking-wider">
                          Episode:
                        </span>
                        <select
                          value={selectedEpisode}
                          onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                          className="bg-black/90 border border-white/20 focus:border-vc-gold rounded-[2px] px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
                        >
                          {Array.from({ length: Math.min(totalEpisodes, 100) }, (_, i) => i + 1).map((e) => (
                            <option key={e} value={e}>
                              Episode {e}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Audio Dub Track Status */}
                  <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2 text-[10px] font-mono">
                    <span className="text-vc-gold">
                      ✓ Projection Audio: {AUDIO_LANGUAGES.find((a) => a.id === selectedAudioLang)?.label}
                    </span>
                    <span className="text-white/40">&middot;</span>
                    <span className="text-white/60">
                      Server: {STREAM_SERVERS.find((s) => s.id === selectedServer)?.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── SECTION 05: Admission Security Protocol ── */}
          <div className="space-y-4">
            <div className="border-b border-vc-border/60 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-vc-text-primary tracking-widest uppercase block">
                  05 &middot; Admission Security
                </span>
                <p className="text-[11px] text-vc-text-muted mt-0.5">
                  Require a private passcode for viewers entering this virtual room
                </p>
              </div>

              {/* Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={usePassword}
                onClick={() => setUsePassword((v) => !v)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-vc-gold',
                  usePassword ? 'bg-vc-gold' : 'bg-vc-bg-base border border-vc-border',
                )}
                aria-label="Toggle password requirement"
              >
                <span
                  className={cn(
                    'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-md',
                    usePassword ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            {usePassword && (
              <div className="pt-2 animate-slide-down">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter 4-to-12 character passkey"
                  aria-label="Room admission password"
                  className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3 text-sm text-vc-text-primary placeholder-vc-text-muted/40 focus:border-vc-gold/60 focus:outline-none transition-colors"
                />
              </div>
            )}
          </div>

          {/* ── Error Banner ── */}
          {errorMessage && (
            <div className="p-3.5 rounded-[4px] bg-vc-burgundy/20 border border-vc-burgundy/50 text-vc-text-primary text-xs flex items-center gap-2 animate-slide-down">
              <span>⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ── Submit & Initialize Auditorium ── */}
          <div className="pt-4 space-y-3">
            <button
              id="initialize-theatre-btn"
              type="button"
              disabled={isSubmitting}
              onClick={handleCreate}
              className="w-full py-4 bg-vc-gold text-black font-semibold text-sm tracking-wide rounded-[4px] hover:bg-vc-gold/90 transition-all duration-200 active:scale-[0.99] shadow-[0_4px_24px_rgba(198,167,106,0.35)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>INITIALIZING SCREENING ROOM...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                  <span>INITIALIZE VIRTUAL AUDITORIUM WITH FRIENDS</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-vc-text-muted">
              {user ? (
                <span>Screening room will be linked to host <strong>{user.displayName || 'Cinema Host'}</strong></span>
              ) : (
                <span>
                  Sign in required to host.{' '}
                  <Link to="/login" state={{ from: { pathname: '/create-theatre' } }} className="text-vc-gold hover:underline">
                    Sign In
                  </Link>
                </span>
              )}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
