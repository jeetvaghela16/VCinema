import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { cn } from '../../utils/cn';
import { theatreTypes } from '../../data/theatres';
import { CinemaSectionDivider } from '../content/ContentSections';

export default function TheatreSection() {
  const [ref, visible] = useIntersectionObserver();

  return (
    <section
      ref={ref}
      className={cn(
        'max-w-7xl mx-auto px-5 sm:px-8 md:px-10 py-16 transition-all duration-700',
        visible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-6',
      )}
      aria-label="Choose your theatre format"
    >
      <CinemaSectionDivider
        hallNumber="AUDITORIUM WING"
        title="Choose Your Theatre"
        subtitle="Every gathering deserves its own bespoke screening room"
      />

      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-vc-text-primary mb-3">
          Your Cinema. Your People. One Screen.
        </h3>
        <p className="text-vc-text-muted text-sm leading-relaxed">
          From intimate two-person private screenings to open community halls, choose an auditorium engineered for the exact rhythm of your watch party.
        </p>
      </div>

      {/* 4 Distinct Theatre Format Cards (Auditorium Box Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {theatreTypes.map((type, i) => (
          <div
            key={type.id}
            className={cn(
              'relative glass-panel rounded-[6px] p-6 flex flex-col justify-between',
              'border border-vc-border/80 shadow-[0_12px_32px_rgba(0,0,0,0.5)]',
              'transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-vc-gold/50',
              'hover:shadow-[0_20px_45px_rgba(0,0,0,0.8),0_0_25px_rgba(198,167,106,0.12)]',
              'group',
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Top Bar with Icon and Capacity Tag */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div
                  className="w-12 h-12 rounded-[4px] flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${type.accent}14`,
                    border: `1px solid ${type.accent}30`,
                  }}
                  aria-hidden="true"
                >
                  {type.icon}
                </div>

                <span className="text-[10px] font-mono tracking-widest text-vc-gold px-2.5 py-1 rounded-[2px] bg-vc-gold/10 border border-vc-gold/25 uppercase font-medium">
                  {type.maxViewers} Seats
                </span>
              </div>

              <h4 className="font-serif text-lg font-semibold text-vc-text-primary mb-2 group-hover:text-vc-gold transition-colors">
                {type.label}
              </h4>

              <p className="text-xs text-vc-text-muted/90 leading-relaxed mb-6">
                {type.description}
              </p>
            </div>

            {/* Bottom Specs & Action */}
            <div className="pt-4 border-t border-vc-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-vc-text-muted/70 text-[11px] font-mono">
                  {type.id === 'private' && 'Synchronized 1:1'}
                  {type.id === 'friends' && 'Voice & Text Chat'}
                  {type.id === 'family' && 'Kid-Safe Controls'}
                  {type.id === 'open' && 'Public Marquee Link'}
                </span>

                <Link
                  to="/create-theatre"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-vc-gold hover:text-vc-text-primary transition-colors group-hover:translate-x-1"
                >
                  <span>Select</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Call to Action */}
      <div className="text-center">
        <Link
          to="/create-theatre"
          className="inline-flex items-center gap-2.5 px-8 py-4 bg-vc-gold text-black text-sm font-semibold rounded-[3px] hover:bg-vc-gold/90 transition-all duration-200 active:scale-95 shadow-[0_4px_24px_rgba(198,167,106,0.3)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <span>CONFIGURE YOUR THEATRE</span>
        </Link>
      </div>
    </section>
  );
}
