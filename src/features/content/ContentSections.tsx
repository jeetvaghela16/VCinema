import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { cn } from '../../utils/cn';
import MovieCard from '../../components/cards/MovieCard';
import type { Movie } from '../../types';

interface SectionHeaderProps {
  hallNumber: string;
  title: string;
  subtitle?: string;
  viewAllLink?: string;
}

export function CinemaSectionDivider({ hallNumber, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="relative mb-8 pt-4">
      {/* Soft ceiling recessed spotlight glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-12 pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(198,167,106,0.3) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-vc-border/70 pb-3">
        <div className="flex items-center gap-3">
          {/* Hall / Wing Indicator */}
          <span className="text-[9px] font-mono tracking-[0.25em] text-vc-gold px-2 py-0.5 rounded-[2px] bg-vc-gold/[0.08] border border-vc-gold/25 uppercase">
            {hallNumber}
          </span>
          <h2 className="font-serif text-xl sm:text-2xl text-vc-text-primary font-semibold tracking-wide">
            {title}
          </h2>
        </div>

        {subtitle && (
          <p className="text-xs text-vc-text-muted/80 font-sans tracking-wide">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function NowShowing({ movies }: { movies: Movie[] }) {
  const [ref, visible] = useIntersectionObserver();

  return (
    <section
      ref={ref}
      className={cn(
        'max-w-7xl mx-auto px-5 sm:px-8 md:px-10 py-12 transition-all duration-700',
        visible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-6',
      )}
      aria-label="Now Showing in Theatres"
    >
      <CinemaSectionDivider
        hallNumber="AUDITORIUM 01"
        title="Now Showing"
        subtitle="Current theatrical engagements & exclusive premieres"
      />

      {/* Responsive Horizontal Scroll on Mobile, 6-col Grid on Desktop */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1 md:overflow-visible md:grid md:grid-cols-3 lg:grid-cols-6 md:gap-4.5 scrollbar-thin">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className="min-w-[155px] sm:min-w-[170px] md:min-w-0 transition-all duration-300"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ContinueWatching({ movies }: { movies: Movie[] }) {
  const [ref, visible] = useIntersectionObserver();

  return (
    <section
      ref={ref}
      className={cn(
        'max-w-7xl mx-auto px-5 sm:px-8 md:px-10 py-12 transition-all duration-700',
        visible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-6',
      )}
      aria-label="Resume Screening"
    >
      <CinemaSectionDivider
        hallNumber="MEZZANINE LOUNGE"
        title="Continue Watching"
        subtitle="Re-enter your paused screenings where you left off"
      />

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 pt-1">
        {movies.map((movie, index) => (
          <div key={movie.id} style={{ animationDelay: `${index * 80}ms` }}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function PopularMovies({ movies }: { movies: Movie[] }) {
  const [ref, visible] = useIntersectionObserver();

  return (
    <section
      ref={ref}
      className={cn(
        'max-w-7xl mx-auto px-5 sm:px-8 md:px-10 py-12 transition-all duration-700',
        visible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-6',
      )}
      aria-label="Popular Feature Films"
    >
      <CinemaSectionDivider
        hallNumber="GRAND SALON"
        title="Popular This Week"
        subtitle="Highly rated by audiences across all virtual rooms"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-4.5 pt-1">
        {movies.map((movie, index) => (
          <div key={movie.id} style={{ animationDelay: `${index * 60}ms` }}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}
