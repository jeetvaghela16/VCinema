import type { Series } from '../../types';
import { cn } from '../../utils/cn';
import { PosterArtwork } from './PosterArtwork';

interface SeriesCardProps {
  series: Series;
  className?: string;
}

export default function SeriesCard({ series, className }: SeriesCardProps) {
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
      aria-label={`${series.title}, ${series.seasons} season${series.seasons > 1 ? 's' : ''}, ${series.episodes} episodes, rated ${series.rating}`}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.currentTarget.click();
        }
      }}
    >
      {/* Poster Artwork Container with Parallax Zoom */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none">
          <PosterArtwork id={series.id} title={series.title} genre={series.genre} />
        </div>

        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-85"
          style={{
            background:
              'radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(8,8,7,0.4) 75%, rgba(8,8,7,0.92) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Light sweep */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 motion-reduce:hidden"
          style={{
            background:
              'linear-gradient(105deg, transparent 20%, rgba(244,240,232,0.06) 45%, rgba(198,167,106,0.12) 50%, rgba(244,240,232,0.04) 55%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Film strip sprockets */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[5px] opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 10px, rgba(244,240,232,0.5) 10px, rgba(244,240,232,0.5) 12px)',
        }}
      />

      {/* SERIES badge */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span className="text-[9px] font-sans font-semibold tracking-widest text-vc-gold/90 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-[2px] border border-vc-gold/25 uppercase">
          Series
        </span>
      </div>

      {/* Rating badge */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-vc-gold bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-[3px] border border-vc-gold/25 shadow-sm">
          <span className="text-[10px] text-vc-gold">★</span> {series.rating}
        </span>
      </div>

      {/* Bottom metadata */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-3.5 pt-12 bg-gradient-to-t from-black/95 via-black/75 to-transparent">
        <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-vc-gold-dim mb-1 tracking-wide">
          <span>{series.year}</span>
          <span>&middot;</span>
          <span className="text-vc-text-muted">{series.genre}</span>
        </div>

        <h3 className="font-serif text-[14px] font-semibold text-vc-text-primary leading-snug line-clamp-2 mb-1 group-hover:text-vc-gold transition-colors duration-200">
          {series.title}
        </h3>

        <p className="text-[11px] text-vc-text-muted/80 flex items-center gap-1">
          <span>{series.seasons} Season{series.seasons > 1 ? 's' : ''}</span>
          <span>&middot;</span>
          <span>{series.episodes} Episodes</span>
        </p>
      </div>
    </article>
  );
}
