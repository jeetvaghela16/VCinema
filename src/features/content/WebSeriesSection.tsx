import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { cn } from '../../utils/cn';
import SeriesCard from '../../components/cards/SeriesCard';
import { CinemaSectionDivider } from './ContentSections';
import type { Series } from '../../types';

interface WebSeriesSectionProps {
  series: Series[];
}

export default function WebSeriesSection({ series }: WebSeriesSectionProps) {
  const [ref, visible] = useIntersectionObserver();

  return (
    <section
      ref={ref}
      className={cn(
        'max-w-7xl mx-auto px-5 sm:px-8 md:px-10 py-12 transition-all duration-700',
        visible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-6',
      )}
      aria-label="Serialized Drama & Web Series"
    >
      <CinemaSectionDivider
        hallNumber="BROADCAST SUITE"
        title="Serialized Web Series"
        subtitle="Episodic narratives curated for shared viewing circles"
      />

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1 md:overflow-visible md:grid md:grid-cols-3 lg:grid-cols-6 md:gap-4.5 scrollbar-thin">
        {series.map((s, index) => (
          <div
            key={s.id}
            className="min-w-[155px] sm:min-w-[170px] md:min-w-0 transition-all duration-300"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <SeriesCard series={s} />
          </div>
        ))}
      </div>
    </section>
  );
}
