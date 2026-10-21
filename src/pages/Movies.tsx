import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/cards/MovieCard';
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  searchMovies,
  isTmdbConfigured,
  getTmdbApiKey,
  setTmdbApiKey,
  CURATED_GLOBAL_MOVIES,
} from '../services/tmdbService';
import type { Movie } from '../types';
import { secureLogger } from '../utils/secureLogger';
import { useWatchModal } from '../context/WatchModalContext';
import { cn } from '../utils/cn';

const GENRES = ['All', 'Trending Worldwide', 'Top Rated', 'Sci-Fi', 'Action', 'Drama', 'Animation', 'Thriller'];

/**
 * Highlights matching typed characters inside a movie title with glowing gold accents
 */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-vc-gold font-bold underline decoration-vc-gold/50 underline-offset-2">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function Movies() {
  const navigate = useNavigate();
  const { openWatchModal } = useWatchModal();

  const [activeGenre, setActiveGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMovies, setDisplayMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getTmdbApiKey());
  const [hasConfiguredKey, setHasConfiguredKey] = useState(isTmdbConfigured());
  const [showApiKeyPlain, setShowApiKeyPlain] = useState(false);

  // ── Live Search Suggestions State ──
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchSeqRef = useRef(0);

  // Load movies on genre change or initial render
  useEffect(() => {
    loadMovies(activeGenre, searchQuery);
  }, [activeGenre]);

  const loadMovies = async (genre: string, query: string) => {
    setIsLoading(true);

    try {
      if (query.trim()) {
        const results = await searchMovies(query);
        setDisplayMovies(results);
        setIsLoading(false);
        return;
      }

      let fetched: Movie[] = [];
      if (genre === 'All' || genre === 'Trending Worldwide') {
        fetched = await fetchTrendingMovies();
      } else if (genre === 'Top Rated') {
        fetched = await fetchTopRatedMovies();
      } else {
        const popular = await fetchPopularMovies();
        fetched = popular.filter((m) =>
          m.genre.toLowerCase().includes(genre.toLowerCase())
        );
        if (fetched.length === 0) {
          fetched = CURATED_GLOBAL_MOVIES.filter((m) =>
            m.genre.toLowerCase().includes(genre.toLowerCase())
          );
        }
      }

      // Pure Worldwide Cinema Catalog — Demo placeholder movies completely removed!
      const unique = Array.from(new Map(fetched.map((m) => [m.id, m])).values());
      setDisplayMovies(unique.length > 0 ? unique : CURATED_GLOBAL_MOVIES);
    } catch (err) {
      secureLogger.error('Error loading movies:', err);
      setDisplayMovies(CURATED_GLOBAL_MOVIES);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Real-time Search Suggestions as the User Types (0ms instant preview + 40ms live fetch) ──
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearchingSuggestions(false);
      return;
    }

    // 1. Instant 0ms Local Cache / In-memory Catalog Match for zero perceptible delay
    const instantMatches = CURATED_GLOBAL_MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(q.toLowerCase()) ||
        m.genre.toLowerCase().includes(q.toLowerCase())
    );
    if (instantMatches.length > 0) {
      setSuggestions(instantMatches.slice(0, 7));
      setShowSuggestions(true);
    }

    setIsSearchingSuggestions(true);
    setHighlightedIndex(-1);

    const currentSeq = ++searchSeqRef.current;

    // 2. Ultra-low latency debounce (decreased from 220ms to 40ms) for instantaneous live search
    const timer = setTimeout(async () => {
      try {
        const results = await searchMovies(q);
        if (searchSeqRef.current !== currentSeq) return;

        // Exclude synthetic placeholder IDs if any
        const filtered = results.filter((m) => !m.id.match(/^m\d+$/));
        if (filtered.length > 0) {
          setSuggestions(filtered.slice(0, 7));
          setShowSuggestions(true);
        } else if (instantMatches.length > 0) {
          setSuggestions(instantMatches.slice(0, 7));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        if (searchSeqRef.current !== currentSeq) return;
        secureLogger.warn('Suggestion search failed:', err);
        if (instantMatches.length > 0) {
          setSuggestions(instantMatches.slice(0, 7));
          setShowSuggestions(true);
        }
      } finally {
        if (searchSeqRef.current === currentSeq) {
          setIsSearchingSuggestions(false);
        }
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle suggestion selection
  const handleSelectSuggestion = (movie: Movie) => {
    setSearchQuery(movie.title);
    setShowSuggestions(false);
    setDisplayMovies([movie]);
  };

  // Full Search Form Submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    loadMovies(activeGenre, searchQuery);
  };

  // Keyboard navigation inside search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearchSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Clear search input and restore full catalog
  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    loadMovies(activeGenre, '');
  };

  const handleSaveApiKey = () => {
    setTmdbApiKey(apiKeyInput.trim());
    setHasConfiguredKey(isTmdbConfigured());
    setShowKeyModal(false);
    loadMovies(activeGenre, searchQuery);
  };

  return (
    <div className="min-h-screen pt-[72px]">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <div className="section-divider mb-0">
              <h1 className="font-sans text-[11px] font-semibold tracking-[0.25em] text-vc-gold uppercase">
                Worldwide Cinema Catalog
              </h1>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-vc-text-primary mt-3">
              Feature Films & World Premieres
            </h2>
          </div>

          {/* TMDB Connection Indicator & Modal Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowKeyModal(true)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-[4px] border text-xs font-mono transition-all',
                hasConfiguredKey
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-vc-gold/40 bg-vc-gold/10 text-vc-gold hover:bg-vc-gold/20'
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', hasConfiguredKey ? 'bg-emerald-400 animate-pulse' : 'bg-vc-gold')} />
              <span>{hasConfiguredKey ? 'TMDB Worldwide Live: Connected' : 'Connect TMDB Free Key'}</span>
            </button>
          </div>
        </div>

        {/* ── Global Live Search Bar with Intelligent Real-time Auto-Suggestions ── */}
        <div ref={searchContainerRef} className="relative max-w-2xl mt-6 mb-6">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              {/* Search Icon */}
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vc-gold pointer-events-none">
                {isSearchingSuggestions ? (
                  <div className="w-4 h-4 rounded-full border-2 border-vc-gold border-t-transparent animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                )}
              </div>

              {/* Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!showSuggestions && e.target.value.trim().length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 0 && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search any movie in the world (e.g. Interstellar, Parasite, RRR, Dune)..."
                className="w-full bg-vc-bg-card/90 border border-vc-border/80 focus:border-vc-gold/70 rounded-[4px] py-3 pl-11 pr-28 text-sm text-vc-text-primary placeholder:text-vc-text-muted focus:outline-none transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] focus:shadow-[0_0_15px_rgba(198,167,106,0.15)] font-sans"
                autoComplete="off"
                spellCheck="false"
              />

              {/* Right Controls: Clear (✕) & Search Button */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 text-xs transition-colors"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-vc-gold text-black text-xs font-semibold rounded-[3px] hover:bg-vc-gold-bright transition-colors font-mono uppercase tracking-wider active:scale-95 shadow-[0_0_10px_rgba(198,167,106,0.25)]"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* ── LIVE SEARCH SUGGESTIONS FLOATING DROPDOWN ── */}
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0a0a09]/98 backdrop-blur-2xl border border-vc-gold/30 rounded-[5px] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_20px_rgba(198,167,106,0.12)] overflow-hidden animate-slide-down">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.03] border-b border-white/10 text-[10px] font-mono tracking-widest uppercase">
                <span className="text-vc-gold flex items-center gap-1.5">
                  <span>🎬</span>
                  <span>
                    Suggestions for &ldquo;{searchQuery}&rdquo;
                  </span>
                </span>
                <span className="text-vc-text-muted">
                  {isSearchingSuggestions ? 'Searching Satellite...' : `${suggestions.length} matches`}
                </span>
              </div>

              {/* Suggestions List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5 py-1">
                {suggestions.length > 0 ? (
                  suggestions.map((movie, index) => {
                    const isHighlighted = index === highlightedIndex;
                    return (
                      <div
                        key={movie.id}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={cn(
                          'px-3.5 py-2.5 flex items-center gap-3 transition-colors cursor-pointer group',
                          isHighlighted ? 'bg-vc-gold/15' : 'hover:bg-white/[0.04]'
                        )}
                        onClick={() => handleSelectSuggestion(movie)}
                      >
                        {/* Film Poster Thumbnail */}
                        <div className="w-10 h-14 rounded-[2px] overflow-hidden bg-black/80 flex-shrink-0 border border-white/10 group-hover:border-vc-gold/40 transition-colors relative">
                          {movie.posterUrl ? (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-vc-gold text-xs font-serif font-bold">
                              V
                            </div>
                          )}
                        </div>

                        {/* Title, Year, Genre & Rating */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-sm font-semibold text-vc-text-primary group-hover:text-vc-gold-bright transition-colors truncate">
                            <HighlightMatch text={movie.title} query={searchQuery} />
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-vc-text-muted mt-0.5">
                            <span className="text-white/80">{movie.year}</span>
                            <span>&middot;</span>
                            <span className="truncate max-w-[140px]">{movie.genre}</span>
                            {movie.duration && (
                              <>
                                <span>&middot;</span>
                                <span>{movie.duration}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-white/5 border border-white/10 text-vc-gold text-xs font-mono font-semibold flex-shrink-0">
                          <span>★</span>
                          <span>{movie.rating}</span>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSuggestions(false);
                              openWatchModal(movie);
                            }}
                            className="px-2.5 py-1 rounded-[3px] bg-vc-gold/20 hover:bg-vc-gold text-vc-gold hover:text-black border border-vc-gold/40 text-[10px] font-mono font-bold uppercase transition-all shadow-[0_0_8px_rgba(198,167,106,0.15)] flex items-center gap-1"
                            title="Instant Watch Presentation"
                          >
                            <span>▶ Watch</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSuggestions(false);
                              navigate('/create-theatre', {
                                state: { preselectedItem: movie, preselectedMovieId: movie.id },
                              });
                            }}
                            className="px-2.5 py-1 rounded-[3px] bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 text-[10px] font-mono uppercase transition-colors"
                            title="Host Virtual Screening Room"
                          >
                            <span>🎭 Room</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : !isSearchingSuggestions ? (
                  <div className="px-4 py-6 text-center text-xs text-vc-text-muted space-y-1">
                    <p className="font-serif text-sm text-white/70">
                      No movies found matching &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="text-[11px] font-mono text-white/40">
                      Try searching by director, actor, or check global keywords (e.g. Inception, Avatar, Titanic).
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Dropdown Keyboard Shortcuts Helper */}
              <div className="px-3.5 py-1.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-vc-text-muted/60">
                <span>↑↓ to navigate &middot; ↵ Enter to select &middot; Esc to close</span>
                <span className="text-vc-gold/80">VCinema Global Live Search</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Active Search Status Banner ── */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 mb-4 rounded-[4px] bg-vc-gold/10 border border-vc-gold/30 text-xs font-mono">
            <div className="flex items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full bg-vc-gold animate-pulse" />
              <span>
                Showing results matching <strong className="text-vc-gold">&ldquo;{searchQuery}&rdquo;</strong> ({displayMovies.length} films found)
              </span>
            </div>
            <button
              onClick={handleClearSearch}
              className="px-2.5 py-1 rounded-[2px] bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[10px] font-mono uppercase transition-colors flex items-center gap-1"
            >
              <span>✕ Clear Search</span>
            </button>
          </div>
        )}

        {/* Genre & Category Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Filter by genre">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => {
                setActiveGenre(genre);
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer',
                activeGenre === genre && !searchQuery
                  ? 'bg-vc-gold text-black font-semibold shadow-[0_0_15px_rgba(198,167,106,0.3)]'
                  : 'border border-vc-border text-vc-text-muted hover:border-vc-gold/40 hover:text-vc-gold bg-transparent'
              )}
              aria-pressed={activeGenre === genre && !searchQuery}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-vc-gold border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-vc-gold tracking-widest uppercase">
              Connecting Global Satellite Vault...
            </p>
          </div>
        ) : displayMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 animate-fade-in">
            {displayMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-vc-text-muted">No movies found matching &ldquo;{searchQuery}&rdquo;. Try another title or explore genres above.</p>
          </div>
        )}
      </div>

      {/* ── MODAL: TMDB API KEY SETUP ── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-[6px] p-6 border border-vc-gold/30 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg text-vc-gold">🎬</span>
                <h3 className="font-serif text-lg text-vc-text-primary">Worldwide Movie Database Setup</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-white/40 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-vc-text-muted leading-relaxed mb-4">
              VCinema integrates directly with <strong className="text-vc-gold">The Movie Database (TMDB)</strong> to provide every movie and series in the world with official posters, trailers, ratings, and cast.
            </p>

            <div className="p-3 rounded-[4px] bg-white/5 border border-white/10 mb-4 text-xs space-y-1.5">
              <p className="font-semibold text-vc-gold text-[11px] uppercase tracking-wider font-mono">
                How to get your free key (Takes 1 minute):
              </p>
              <ol className="list-decimal list-inside text-white/80 space-y-1 text-[11px]">
                <li>Sign up for free at <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="text-vc-gold underline">themoviedb.org</a></li>
                <li>Go to <strong>Settings &rarr; API &rarr; Create Developer Key</strong></li>
                <li>Paste your API key (v3 auth) below:</li>
              </ol>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono tracking-wider text-vc-text-muted uppercase">
                  TMDB API Key (v3)
                </label>
                <button
                  type="button"
                  onClick={() => setShowApiKeyPlain(!showApiKeyPlain)}
                  className="text-[10px] font-mono text-vc-gold/80 hover:text-vc-gold uppercase tracking-wider transition-colors"
                >
                  {showApiKeyPlain ? 'Hide Key' : 'Reveal Key'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showApiKeyPlain ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="e.g. 1a2b3c4d5e6f7a8b9c0d1e2f3..."
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full bg-black/60 border border-white/15 focus:border-vc-gold rounded-[3px] px-3 py-2 text-xs font-mono text-white placeholder-white/30 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-vc-text-muted block">
                Protected and masked in browser storage.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-1.5 text-xs font-mono uppercase text-vc-text-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-5 py-2 bg-vc-gold text-black rounded-[3px] text-xs font-semibold font-mono uppercase tracking-wider hover:bg-vc-gold-bright transition-colors"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
