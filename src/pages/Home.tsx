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
  continueWatchingMovies,
  nowShowingMovies,
  popularMovies,
} from '../data/movies';
import { seriesList } from '../data/series';

export default function Home() {
  return (
    <div className="w-full relative overflow-hidden bg-vc-bg-base">
      {/* ── Feature Hero Presentation ── */}
      <CinematicHero />

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
        <NowShowing movies={nowShowingMovies} />
        <ContinueWatching movies={continueWatchingMovies} />
        <PopularMovies movies={popularMovies} />
        <WebSeriesSection series={seriesList.slice(0, 6)} />
        <TheatreSection />
        <MiraCompanion />
      </div>
    </div>
  );
}
