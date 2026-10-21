import { useState, useEffect } from 'react';
import MovieCard from '../components/cards/MovieCard';
import { movies as localMovies } from '../data/movies';
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

const GENRES = ['All', 'Trending Worldwide', 'Top Rated', 'Sci-Fi', 'Action', 'Drama', 'Animation', 'Thriller'];

export default function Movies() {
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMovies, setDisplayMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getTmdbApiKey());
  const [hasConfiguredKey, setHasConfiguredKey] = useState(isTmdbConfigured());
  const [showApiKeyPlain, setShowApiKeyPlain] = useState(false);

  // Load initial movies
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

      // Merge local exclusive movies + global films
      const allMerged = genre === 'All'
        ? [...fetched, ...localMovies]
        : fetched;

      // Deduplicate by ID
      const unique = Array.from(new Map(allMerged.map((m) => [m.id, m])).values());
      setDisplayMovies(unique);
    } catch (err) {
      secureLogger.error('Error loading movies:', err);
      setDisplayMovies([...CURATED_GLOBAL_MOVIES, ...localMovies]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMovies(activeGenre, searchQuery);
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] border text-xs font-mono transition-all ${
                hasConfiguredKey
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-vc-gold/40 bg-vc-gold/10 text-vc-gold hover:bg-vc-gold/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${hasConfiguredKey ? 'bg-emerald-400 animate-pulse' : 'bg-vc-gold'}`} />
              <span>{hasConfiguredKey ? 'TMDB Worldwide Live: Connected' : 'Connect TMDB Free Key'}</span>
            </button>
          </div>
        </div>

        {/* Global Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 mb-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any movie in the world (e.g. Interstellar, Parasite, RRR, Dune)..."
              className="w-full bg-vc-bg-card/90 border border-vc-border/80 focus:border-vc-gold/60 rounded-[4px] py-3 pl-11 pr-24 text-sm text-vc-text-primary placeholder:text-vc-text-muted focus:outline-none transition-all shadow-inner"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vc-gold pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-vc-gold text-black text-xs font-semibold rounded-[3px] hover:bg-vc-gold-bright transition-colors font-mono uppercase tracking-wider"
            >
              Search
            </button>
          </div>
        </form>

        {/* Genre & Category Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-2" role="group" aria-label="Filter by genre">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => {
                setActiveGenre(genre);
                setSearchQuery('');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeGenre === genre && !searchQuery
                  ? 'bg-vc-gold text-black shadow-[0_0_15px_rgba(198,167,106,0.3)]'
                  : 'border border-vc-border text-vc-text-muted hover:border-vc-gold/40 hover:text-vc-gold bg-transparent'
              }`}
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
            <p className="text-vc-text-muted">No movies found matching "{searchQuery}". Try another title or explore genres.</p>
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
