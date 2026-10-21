import { Link, useNavigate } from 'react-router-dom';
import type { Movie } from '../../types';
import { useWatchModal } from '../../context/WatchModalContext';

interface CinematicHeroProps {
  movie?: Movie;
}

export default function CinematicHero({ movie }: CinematicHeroProps) {
  const navigate = useNavigate();
  const { openWatchModal } = useWatchModal();
  const title = movie?.title || 'Interstellar';
  const year = movie?.year || 2014;
  const duration = movie?.duration || '2h 49m';
  const genre = movie?.genre || 'Sci-Fi';
  const description =
    movie?.description ||
    'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.';

  return (
    <section
      className="relative min-h-[92svh] sm:min-h-screen w-full flex flex-col justify-end overflow-hidden film-grain"
      aria-label={`Featured Film: ${title}`}
    >
      {/* ── Background Atmospheric Layers ── */}
      {/* Real Film Backdrop (from TMDB) */}
      {movie?.backdropUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={movie.backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-center opacity-25 dark:opacity-40 scale-105"
          />
          <div className="hero-backdrop-fade-t absolute inset-0 pointer-events-none" />
          <div className="hero-backdrop-fade-r absolute inset-0 pointer-events-none" />
        </div>
      )}

      {/* Deep twilight space & warm amber horizon radial gradients */}
      <div
        className="hero-backdrop-atmosphere absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Atmospheric projector light beam / diagonal sweep (Desktop & Tablet) */}
      <div
        className="hero-projector-beam absolute top-0 right-0 w-[85vw] md:w-[60vw] h-[85vh] z-[1] pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle distant mountain & horizon landscape silhouette */}
      <div className="hero-silhouette absolute inset-x-0 bottom-12 md:bottom-20 z-[2] pointer-events-none opacity-45">
        <svg
          className="w-full h-40 md:h-64 object-cover"
          viewBox="0 0 1440 280"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 190 L120 160 L280 185 L440 130 L620 175 L810 110 L990 155 L1180 100 L1340 145 L1440 120 L1440 280 L0 280 Z"
            fill="#0f0e0c"
          />
          <path
            d="M0 220 Q 360 170 720 215 T 1440 190 L 1440 280 L 0 280 Z"
            fill="#090908"
          />
          {/* Subtle golden horizon flare line */}
          <line
            x1="0"
            y1="190"
            x2="1440"
            y2="190"
            stroke="url(#hero-horizon-grad)"
            strokeWidth="0.75"
            opacity="0.3"
          />
          <defs>
            <linearGradient id="hero-horizon-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="40%" stopColor="#c6a76a" />
              <stop offset="60%" stopColor="#c6a76a" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Cinematic Film Vignette & Bottom Floor Blend */}
      <div
        className="hero-vignette absolute inset-0 z-[3] pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating dust motes (CSS micro-particles, reduced-motion friendly) */}
      <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[25%] left-[65%] w-1.5 h-1.5 rounded-full bg-vc-gold blur-[0.5px] shadow-[0_0_8px_#c6a76a]" />
        <div className="absolute top-[40%] left-[80%] w-1 h-1 rounded-full bg-vc-gold/70 dark:bg-[#f4f0e8] blur-[0.5px]" />
        <div className="absolute top-[30%] left-[45%] w-1 h-1 rounded-full bg-vc-gold" />
        <div className="absolute top-[55%] left-[72%] w-1.5 h-1.5 rounded-full bg-vc-gold/50 dark:bg-[#f4f0e8] opacity-60" />
      </div>

      {/* ── Main Hero Container ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-10 pt-24 sm:pt-28 pb-14 sm:pb-20 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          
          {/* ── LEFT COLUMN: Editorial Typography & Actions (Mobile & Desktop) ── */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-end animate-slide-up">
            
            {/* Festival / Curator Micro-Badge */}
            <div className="flex items-center gap-2.5 mb-3.5 sm:mb-4">
              <span className="hero-premiere-badge inline-flex items-center gap-1.5 text-[10px] sm:text-[10.5px] font-sans font-bold tracking-[0.22em] uppercase px-2.5 py-1 rounded-[3px] backdrop-blur-sm transition-all duration-200">
                <span className="badge-dot w-1.5 h-1.5 rounded-full animate-pulse" aria-hidden="true" />
                Featured Premiere
              </span>
              <span className="text-[11px] sm:text-xs text-vc-text-muted font-medium">
                {year} &middot; {duration} &middot; 4K HDR &middot; Dolby 5.1
              </span>
            </div>

            {/* Editorial Title */}
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-vc-text-primary leading-[1.06] tracking-tight mb-4 sm:mb-5">
              {title}
            </h1>

            {/* Genre & Festival Laurel Tags */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {[genre, 'Grand Cinema', 'Official Selection'].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] sm:text-[11px] text-vc-text-muted bg-vc-bg-card/70 dark:bg-white/[0.03] border border-vc-border/80 px-2.5 py-0.5 rounded-[2px]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Synopsis Description */}
            <p className="text-sm sm:text-base md:text-lg text-vc-text-muted/95 leading-relaxed mb-6 sm:mb-8 max-w-xl line-clamp-3">
              {description}
            </p>

            {/* Primary Action Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  if (movie) openWatchModal(movie);
                  else navigate('/movies');
                }}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-vc-gold text-black text-sm font-semibold rounded-[3px] hover:bg-vc-gold/90 transition-all duration-200 active:scale-95 shadow-[0_4px_20px_rgba(198,167,106,0.3)] cursor-pointer"
                aria-label={`Watch ${title} Now`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
                <span>WATCH NOW</span>
              </button>

              <Link
                to="/create-theatre"
                state={{ preselectedMovieId: movie?.id }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-vc-bg-card/80 text-vc-text-primary text-sm font-medium rounded-[3px] border border-vc-border/90 hover:border-vc-gold/40 hover:bg-vc-bg-elevated/70 dark:hover:bg-white/5 transition-all duration-200 active:scale-95 backdrop-blur-sm"
                aria-label={`Create Theatre for ${title}`}
              >
                <span>🏛 CREATE THEATRE</span>
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Subtle Cinematic Visual Treatment (Desktop & Tablet) ── */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-end items-end animate-fade-in animate-delay-200">
            {/* Holographic Cinema Stage Telemetry Card */}
            <div className="w-full max-w-sm glass-panel p-5 rounded-[4px] border border-vc-border-strong/70 relative overflow-hidden group shadow-xl dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
              
              {/* Subtle top spotlight glare */}
              <div
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(198,167,106,0.2) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />

              {/* Anamorphic Framing Marks (2.39:1 crop aesthetic) */}
              <div className="flex items-center justify-between text-[9px] font-mono text-vc-text-muted/60 mb-3 tracking-widest uppercase">
                <span>[ 2.39 : 1 ANAMORPHIC ]</span>
                <span className="flex items-center gap-1.5 text-vc-gold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  REC ● 60 FPS
                </span>
              </div>

              {/* Miniature Cinematic Viewport */}
              <div className="relative aspect-[2.39/1] rounded-[2px] overflow-hidden border border-white/10 mb-4 bg-black">
                {movie?.backdropUrl || movie?.posterUrl ? (
                  <img
                    src={movie.backdropUrl || movie.posterUrl}
                    alt={title}
                    className="w-full h-full object-cover opacity-85"
                  />
                ) : (
                  <>
                    {/* Visual Horizon Layer */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(ellipse at 50% 60%, #2a1f14 0%, #120e0a 60%, #060504 100%)',
                      }}
                    />
                    {/* Silhouette mountains inside lens */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 100" preserveAspectRatio="none">
                      <path d="M0 65 L40 50 L90 62 L130 45 L170 58 L210 40 L240 55 L240 100 L0 100 Z" fill="#080706" />
                      <circle cx="130" cy="42" r="1.5" fill="#c6a76a" />
                    </svg>
                  </>
                )}
                {/* Lens Flare Streak */}
                <div className="absolute top-[48%] inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#c6a76a]/60 to-transparent shadow-[0_0_8px_#c6a76a]" />
                
                {/* Viewport Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <div className="w-6 h-6 border border-vc-gold/60 rounded-full" />
                </div>
              </div>

              {/* Live Virtual Theatre Synchronizer Indicator */}
              <div className="flex items-center justify-between pt-2 border-t border-vc-border/60">
                <div>
                  <p className="text-[11px] font-medium text-vc-text-primary flex items-center gap-1.5">
                    <span className="text-vc-gold font-serif">V</span>
                    Auditorium VCX-XXXX
                  </p>
                  <p className="text-[10px] text-vc-text-muted">
                   Viewers synchronized in 4K Atmos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
