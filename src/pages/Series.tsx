import { useState, useEffect } from 'react';
import SeriesCard from '../components/cards/SeriesCard';
import {
  fetchTrendingSeries,
  searchSeries,
  isTmdbConfigured,
  CURATED_GLOBAL_SERIES,
} from '../services/tmdbService';
import type { Series as SeriesType } from '../types';
import { secureLogger } from '../utils/secureLogger';

const GENRES = ['All', 'Trending Worldwide', 'Sci-Fi & Fantasy', 'Crime', 'Drama', 'Animation', 'Action & Adventure'];

export default function Series() {
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [displaySeries, setDisplaySeries] = useState<SeriesType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isConnected = isTmdbConfigured();

  useEffect(() => {
    loadSeries(activeGenre, searchQuery);
  }, [activeGenre]);

  const loadSeries = async (genre: string, query: string) => {
    setIsLoading(true);

    try {
      if (query.trim()) {
        const results = await searchSeries(query);
        setDisplaySeries(results);
        setIsLoading(false);
        return;
      }

      let fetched: SeriesType[] = [];
      if (genre === 'All' || genre === 'Trending Worldwide') {
        fetched = await fetchTrendingSeries();
      } else {
        const trending = await fetchTrendingSeries();
        fetched = trending.filter((s) =>
          s.genre.toLowerCase().includes(genre.toLowerCase())
        );
        if (fetched.length === 0) {
          fetched = CURATED_GLOBAL_SERIES.filter((s) =>
            s.genre.toLowerCase().includes(genre.toLowerCase())
          );
        }
      }

      const unique = Array.from(new Map(fetched.map((s) => [s.id, s])).values());
      setDisplaySeries(unique);
    } catch (err) {
      secureLogger.error('Error loading series:', err);
      setDisplaySeries(CURATED_GLOBAL_SERIES);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSeries(activeGenre, searchQuery);
  };

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <div className="section-divider mb-0">
              <h1 className="font-sans text-[11px] font-semibold tracking-[0.25em] text-vc-gold uppercase">
                Worldwide Television & Streaming
              </h1>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-vc-text-primary mt-3">
              Web Series & Episodic Masterpieces
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-vc-gold'}`} />
            <span className="text-xs font-mono text-vc-text-muted">
              {isConnected ? 'TMDB Global Series Active' : 'Curated Global Web Series'}
            </span>
          </div>
        </div>

        {/* Global Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 mb-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any series in the world (e.g. Stranger Things, Arcane, Squid Game, Game of Thrones)..."
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

      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-vc-gold border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-vc-gold tracking-widest uppercase">
              Tuning Global Broadcast Vault...
            </p>
          </div>
        ) : displaySeries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 animate-fade-in">
            {displaySeries.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-vc-text-muted">No series found matching "{searchQuery}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
