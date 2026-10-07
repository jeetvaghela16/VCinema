import { Link } from 'react-router-dom';

export default function CinematicHero() {
  return (
    <section
      className="relative min-h-[92svh] sm:min-h-screen w-full flex flex-col justify-end overflow-hidden film-grain"
      aria-label="Featured Film: The Grand Horizon"
    >
      {/* ── Background Atmospheric Layers ── */}
      {/* Deep twilight space & warm amber horizon radial gradients */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 95% 65% at 75% 35%, rgba(42, 31, 20, 0.75) 0%, transparent 70%),
            radial-gradient(ellipse 70% 85% at 20% 75%, rgba(20, 10, 30, 0.6) 0%, transparent 65%),
            radial-gradient(circle at 85% 20%, rgba(198, 167, 106, 0.12) 0%, transparent 50%),
            linear-gradient(180deg, #090908 0%, #0c0b09 45%, #080807 100%)
          `,
        }}
      />

      {/* Atmospheric projector light beam / diagonal sweep (Desktop & Tablet) */}
      <div
        className="absolute top-0 right-0 w-[85vw] md:w-[60vw] h-[85vh] z-[1] pointer-events-none opacity-40 mix-blend-screen"
        aria-hidden="true"
        style={{
          background:
            'conic-gradient(from 225deg at 100% 0%, transparent 0deg, rgba(198,167,106,0.14) 22deg, rgba(244,240,232,0.06) 35deg, transparent 48deg)',
          filter: 'blur(16px)',
        }}
      />

      {/* Subtle distant mountain & horizon landscape silhouette */}
      <div className="absolute inset-x-0 bottom-12 md:bottom-20 z-[2] pointer-events-none opacity-45">
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
        className="absolute inset-0 z-[3] pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            linear-gradient(to top, #080807 0%, rgba(8,8,7,0.92) 15%, rgba(8,8,7,0.5) 45%, transparent 70%),
            radial-gradient(circle at 50% 50%, transparent 60%, rgba(8,8,7,0.7) 100%)
          `,
        }}
      />

      {/* Floating dust motes (CSS micro-particles, reduced-motion friendly) */}
      <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[25%] left-[65%] w-1.5 h-1.5 rounded-full bg-[#c6a76a] blur-[0.5px] shadow-[0_0_8px_#c6a76a]" />
        <div className="absolute top-[40%] left-[80%] w-1 h-1 rounded-full bg-[#f4f0e8] blur-[0.5px]" />
        <div className="absolute top-[30%] left-[45%] w-1 h-1 rounded-full bg-[#c6a76a]" />
        <div className="absolute top-[55%] left-[72%] w-1.5 h-1.5 rounded-full bg-[#f4f0e8] opacity-60" />
      </div>

      {/* ── Main Hero Container ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-10 pt-24 sm:pt-28 pb-14 sm:pb-20 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          
          {/* ── LEFT COLUMN: Editorial Typography & Actions (Mobile & Desktop) ── */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-end animate-slide-up">
            
            {/* Festival / Curator Micro-Badge */}
            <div className="flex items-center gap-2.5 mb-3.5 sm:mb-4">
              <span className="inline-flex items-center gap-1.5 text-[9.5px] sm:text-[10px] font-sans font-semibold tracking-[0.22em] text-vc-gold uppercase px-2.5 py-1 border border-vc-gold/35 rounded-[2px] bg-black/50 backdrop-blur-sm shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-vc-gold animate-pulse" aria-hidden="true" />
                Featured Premiere
              </span>
              <span className="text-[11px] sm:text-xs text-vc-text-muted/90 font-medium">
                2026 &middot; 2h 18m &middot; 4K HDR &middot; Dolby 5.1
              </span>
            </div>

            {/* Editorial Title */}
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-vc-text-primary leading-[1.04] tracking-tight mb-4 sm:mb-5">
              The Grand
              <br />
              <span className="cinema-gradient-text">Horizon</span>
            </h1>

            {/* Genre & Festival Laurel Tags */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {['Psychological Drama', 'Grand Cinema', 'Official Selection'].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] sm:text-[11px] text-vc-text-muted bg-white/[0.03] border border-vc-border/80 px-2.5 py-0.5 rounded-[2px]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Synopsis Description */}
            <p className="text-sm sm:text-base md:text-lg text-vc-text-muted/95 leading-relaxed mb-6 sm:mb-8 max-w-xl">
              A breathtaking journey across the edge of the world, where silence speaks louder than words and the horizon holds infinite secrets. Experience it synchronized with your private circle.
            </p>

            {/* Primary Action Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                to="/theatre/demo"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-vc-gold text-black text-sm font-semibold rounded-[3px] hover:bg-vc-gold/90 transition-all duration-200 active:scale-95 shadow-[0_4px_20px_rgba(198,167,106,0.3)]"
                aria-label="Enter Theatre to watch The Grand Horizon"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
                <span>ENTER THEATRE</span>
              </Link>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-vc-bg-card/80 text-vc-text-primary text-sm font-medium rounded-[3px] border border-vc-border/90 hover:border-vc-gold/40 hover:bg-white/5 transition-all duration-200 active:scale-95 backdrop-blur-sm"
                aria-label="Add The Grand Horizon to My List"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>ADD TO LIST</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Subtle Cinematic Visual Treatment (Desktop & Tablet) ── */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-end items-end animate-fade-in animate-delay-200">
            {/* Holographic Cinema Stage Telemetry Card */}
            <div className="w-full max-w-sm glass-panel p-5 rounded-[4px] border border-vc-border-strong/70 relative overflow-hidden group shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
              
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
                  REC ● 24 FPS
                </span>
              </div>

              {/* Miniature Cinematic Viewport */}
              <div className="relative aspect-[2.39/1] rounded-[2px] overflow-hidden border border-white/10 mb-4 bg-black">
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
                    Auditorium VCX-4821
                  </p>
                  <p className="text-[10px] text-vc-text-muted">
                    14 viewers synchronized in 4K Atmos
                  </p>
                </div>

                <Link
                  to="/theatre/demo"
                  className="text-[10px] font-semibold text-vc-gold hover:text-vc-gold/80 px-2.5 py-1 rounded-[2px] border border-vc-gold/30 hover:border-vc-gold/60 transition-colors uppercase tracking-wider"
                >
                  Join Screen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <div className="absolute bottom-6 right-8 sm:right-10 z-10 hidden md:flex flex-col items-center gap-2 opacity-50">
        <span className="text-[9px] font-sans font-medium tracking-[0.25em] text-vc-text-muted uppercase">
          Explore
        </span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-vc-gold to-transparent" />
      </div>
    </section>
  );
}
