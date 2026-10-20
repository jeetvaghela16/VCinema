import { useState, useEffect } from 'react';
import CinematicHero from '../features/hero/CinematicHero';
import {
  NowShowing,
  ContinueWatching,
  PopularMovies,
} from '../features/content/ContentSections';
import WebSeriesSection from '../features/content/WebSeriesSection';
import TheatreSection from '../features/theatre/TheatreSection';
import MiraCompanion from '../features/companion/MiraCompanion';
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchTrendingSeries,
  CURATED_GLOBAL_MOVIES,
  CURATED_GLOBAL_SERIES,
} from '../services/tmdbService';
import type { Movie, Series } from '../types';

export default function Home() {
  const [heroMovie, setHeroMovie] = useState<Movie>(CURATED_GLOBAL_MOVIES[0]);
  const [nowShowing, setNowShowing] = useState<Movie[]>(CURATED_GLOBAL_MOVIES.slice(0, 6));
  const [continueWatching, setContinueWatching] = useState<Movie[]>(CURATED_GLOBAL_MOVIES.slice(4, 8));
  const [popular, setPopular] = useState<Movie[]>(CURATED_GLOBAL_MOVIES.slice(2, 8));
  const [series, setSeries] = useState<Series[]>(CURATED_GLOBAL_SERIES.slice(0, 6));

  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const [trending, pop, tv] = await Promise.all([
          fetchTrendingMovies(),
          fetchPopularMovies(),
          fetchTrendingSeries(),
        ]);
        if (!isMounted) return;

        if (trending && trending.length > 0) {
          setHeroMovie(trending[0]);
          setNowShowing(trending.slice(1, 7));
          setContinueWatching(
            trending.slice(7, 11).length > 0 ? trending.slice(7, 11) : trending.slice(1, 5)
          );
        }
        if (pop && pop.length > 0) {
          setPopular(pop.slice(0, 6));
        }
        if (tv && tv.length > 0) {
          setSeries(tv.slice(0, 6));
        }
      } catch (err) {
        console.warn('Could not fetch live home catalog:', err);
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full relative overflow-hidden bg-vc-bg-base">
      {/* ── Feature Hero Presentation ── */}
      <CinematicHero movie={heroMovie} />

      {/* ── Cinematic Lobby Foyer Threshold ── */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 md:px-10 py-6 my-2" aria-hidden="true">
        <div className="flex items-center justify-between gap-4 border-y border-vc-border/50 py-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-vc-gold shadow-[0_0_6px_#c6a76a]" />
            <span className="text-[10px] font-mono tracking-[0.25em] text-vc-text-muted uppercase">
              Auditoriums Online
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-[10px] font-mono text-vc-text-muted/60 uppercase tracking-widest">
            <span>Synchronized Playback</span>
            <span>&middot;</span>
            <span>Lossless Atmos Audio</span>
            <span>&middot;</span>
            <span>Private & Public Wings</span>
          </div>

          <span className="text-[10px] font-mono text-vc-gold/80 tracking-wider">
            VCINEMA &middot; EST. 2026
          </span>
        </div>
      </div>

      {/* ── Auditorium Screenings & Sections ── */}
      <div className="space-y-6 sm:space-y-10">
        <NowShowing movies={nowShowing} />
        <ContinueWatching movies={continueWatching} />
        <PopularMovies movies={popular} />
        <WebSeriesSection series={series} />
        <TheatreSection />
        <MiraCompanion />
      </div>
    </div>
  );
}
