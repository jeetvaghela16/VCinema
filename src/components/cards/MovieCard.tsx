import { cn } from '../../utils/cn';
import type { Movie } from '../../types';
import { PosterArtwork } from './PosterArtwork';

interface MovieCardProps {
  movie: Movie;
  className?: string;
  priority?: boolean;
}

export default function MovieCard({ movie, className }: MovieCardProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[4px] cursor-pointer select-none',
        'bg-vc-bg-card border border-vc-border/80',
        'shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
        'transition-all duration-500 ease-out',
        'hover:border-vc-gold/40 hover:shadow-[0_16px_36px_rgba(0,0,0,0.8),0_0_24px_rgba(198,167,106,0.12)]',
        'hover:-translate-y-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-gold focus-visible:ring-offset-2 focus-visible:ring-offset-vc-bg-base',
        className,
      )}
      style={{ aspectRatio: '2/3' }}
      aria-label={`${movie.title}, released in ${movie.year}, genre: ${movie.genre}, rated ${movie.rating}`}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.currentTarget.click();
        }
      }}
    >
      {/* Poster Artwork Container with Parallax Zoom on Hover */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none">
          <PosterArtwork id={movie.id} title={movie.title} genre={movie.genre} />
        </div>

        {/* Cinematic Film Grain & Vignette Overlay */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />

        {/* Cinematic multi-stop Vignette */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-85"
          style={{
            background:
              'radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(8,8,7,0.4) 75%, rgba(8,8,7,0.92) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Hover Light Sweep Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 motion-reduce:hidden"
          style={{
            background:
              'linear-gradient(105deg, transparent 20%, rgba(244,240,232,0.06) 45%, rgba(198,167,106,0.12) 50%, rgba(244,240,232,0.04) 55%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Film strip left sprockets decoration */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[5px] opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 10px, rgba(244,240,232,0.5) 10px, rgba(244,240,232,0.5) 12px)',
        }}
      />

      {/* Rating badge */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-vc-gold bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-[3px] border border-vc-gold/25 shadow-sm">
          <span className="text-[10px] text-vc-gold">★</span> {movie.rating}
        </span>
      </div>

      {/* 4K or Format tag on top left */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span className="text-[9px] font-mono tracking-widest text-vc-text-muted/90 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-[2px] border border-white/10 uppercase">
          4K
        </span>
      </div>

      {/* Bottom poster typography & metadata */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-3.5 pt-12 bg-gradient-to-t from-black/95 via-black/75 to-transparent">
        {/* Progress bar */}
        {movie.progress !== undefined && (
          <div
            className="mb-2.5 h-[3px] w-full bg-white/15 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={movie.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${movie.progress}% watched`}
          >
            <div
              className="h-full bg-vc-burgundy rounded-full shadow-[0_0_8px_#6f2028]"
              style={{ width: `${movie.progress}%` }}
            />
          </div>
        )}

        {/* Genre + year reveal on hover / persistent in mobile */}
        <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-vc-gold-dim mb-1 tracking-wide">
          <span>{movie.year}</span>
          <span>&middot;</span>
          <span className="text-vc-text-muted">{movie.genre}</span>
          <span>&middot;</span>
          <span className="text-vc-text-muted/80">{movie.duration}</span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-[14px] font-semibold text-vc-text-primary leading-snug line-clamp-2 group-hover:text-vc-gold transition-colors duration-200">
          {movie.title}
        </h3>
      </div>
    </article>
  );
}
