interface PosterArtworkProps {
  id: string;
  title?: string;
  genre?: string;
  className?: string;
}

export function PosterArtwork({ id }: PosterArtworkProps) {
  // Render specific cinematic SVG/CSS composition based on id
  switch (id) {
    // ----------------------------------------------------
    // MOVIES
    // ----------------------------------------------------
    case 'm1': // The Grand Horizon
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#0c0d10]" aria-hidden="true">
          {/* Atmospheric sky gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 90% 60% at 50% 35%, #2a1f14 0%, #151412 55%, #090908 100%)',
            }}
          />
          {/* Sun & Horizon light */}
          <div
            className="absolute top-[28%] left-1/2 -translate-x-1/2 w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(220, 168, 85, 0.45) 0%, rgba(198, 167, 106, 0.15) 45%, transparent 75%)',
              filter: 'blur(8px)',
            }}
          />
          <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#f4ebd0] opacity-90 shadow-[0_0_35px_#c6a76a]" />
          
          {/* Distant mountain and sand dunes silhouettes */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450" preserveAspectRatio="none">
            <defs>
              <linearGradient id="m1-grad-dune1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1f1813" />
                <stop offset="100%" stopColor="#0d0b09" />
              </linearGradient>
              <linearGradient id="m1-grad-dune2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#15120f" />
                <stop offset="100%" stopColor="#080706" />
              </linearGradient>
            </defs>
            {/* Mountain ridge silhouette */}
            <path d="M0 240 L50 215 L110 235 L170 195 L220 220 L270 190 L300 210 L300 450 L0 450 Z" fill="#13100e" opacity="0.85" />
            {/* Front dramatic desert dunes */}
            <path d="M-10 270 Q 70 230 160 280 T 310 250 L310 450 L-10 450 Z" fill="url(#m1-grad-dune1)" />
            <path d="M-20 330 Q 110 290 200 340 T 320 310 L320 450 L-20 450 Z" fill="url(#m1-grad-dune2)" />
            {/* Lone traveler silhouette on dune crest */}
            <circle cx="152" cy="271" r="2" fill="#c6a76a" opacity="0.9" />
            <path d="M151 273 L153 273 L154 282 L150 282 Z" fill="#080706" />
          </svg>

          {/* Minimalist fine horizon line */}
          <div className="absolute top-[49%] inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#c6a76a]/30 to-transparent" />
          
          {/* Subtle festival laurel & micro typography */}
          <div className="absolute top-4 inset-x-0 text-center pointer-events-none">
            <span className="text-[8px] font-sans font-medium tracking-[0.28em] text-[#c6a76a]/70 uppercase">
              ✦ OFFICIAL SELECTION 2026 ✦
            </span>
          </div>
        </div>
      );

    case 'm2': // Eclipse Protocol
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#07090e]" aria-hidden="true">
          {/* Deep cosmos gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 40%, #0d1a29 0%, #070c14 55%, #040609 100%)',
            }}
          />
          {/* Starfield particles */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 70px 120px, #c6a76a, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 80px, #93b5cf, rgba(0,0,0,0)), radial-gradient(1px 1px at 240px 190px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 190px 40px, #a9a39a, rgba(0,0,0,0))',
              backgroundSize: '280px 280px',
            }}
          />
          {/* Solar Eclipse Corona */}
          <div className="absolute top-[26%] left-1/2 -translate-x-1/2 w-44 h-44 rounded-full border border-[#c6a76a]/20 shadow-[0_0_50px_rgba(198,167,106,0.25)] flex items-center justify-center">
            <div className="w-36 h-36 rounded-full bg-[#040609] border border-[#a9a39a]/15 shadow-inner" />
            <div
              className="absolute -top-1 right-8 w-5 h-5 rounded-full bg-[#f4f0e8] blur-[2px] shadow-[0_0_20px_#ffffff]"
            />
          </div>

          {/* Orbital telemetry geometry */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 300 450">
            <circle cx="150" cy="180" r="105" fill="none" stroke="#c6a76a" strokeWidth="0.5" strokeDasharray="3 4" />
            <circle cx="150" cy="180" r="130" fill="none" stroke="#a9a39a" strokeWidth="0.5" opacity="0.4" />
            <line x1="20" y1="180" x2="280" y2="180" stroke="#c6a76a" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 6" />
            <line x1="150" y1="50" x2="150" y2="310" stroke="#c6a76a" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 6" />
            {/* Satellite silhouette */}
            <rect x="220" y="110" width="12" height="4" fill="#a9a39a" />
            <line x1="226" y1="104" x2="226" y2="120" stroke="#a9a39a" strokeWidth="1" />
            <rect x="214" y="106" width="4" height="12" fill="#c6a76a" opacity="0.7" />
            <rect x="234" y="106" width="4" height="12" fill="#c6a76a" opacity="0.7" />
          </svg>

          {/* Micro telemetry label */}
          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-mono tracking-[0.3em] text-[#93b5cf]/60">
              ORBITAL SECTOR · 41.8°N
            </span>
          </div>
        </div>
      );

    case 'm3': // Ember Falls
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#10080a]" aria-hidden="true">
          {/* Oxblood & twilight gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 90% 70% at 65% 30%, #3d1419 0%, #1e0b0e 45%, #0a0506 90%)',
            }}
          />
          {/* Lighthouse beam */}
          <div
            className="absolute top-[28%] right-[15%] w-64 h-64 origin-top-right rotate-[-25deg] opacity-25 pointer-events-none"
            style={{
              background: 'conic-gradient(from 180deg at 100% 0%, transparent 0deg, rgba(244,240,232,0.8) 12deg, transparent 24deg)',
              filter: 'blur(4px)',
            }}
          />
          {/* Coastal cliff & Lighthouse silhouette */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450" preserveAspectRatio="none">
            {/* Distant headland */}
            <path d="M0 260 Q 60 240 140 270 T 300 245 L300 450 L0 450 Z" fill="#150a0d" opacity="0.7" />
            {/* Front rugged cliff */}
            <path d="M120 450 L140 280 L180 270 L210 240 L240 235 L260 245 L290 280 L300 320 L300 450 Z" fill="#0c0507" />
            {/* Lighthouse structure */}
            <rect x="236" y="200" width="8" height="35" fill="#080304" />
            <polygon points="234,200 246,200 240,192" fill="#080304" />
            {/* Beacon glow point */}
            <circle cx="240" cy="197" r="3" fill="#f4ebd0" />
            <circle cx="240" cy="197" r="10" fill="#c6a76a" opacity="0.4" />
            {/* Waves foam lines */}
            <path d="M0 340 Q 50 330 110 345 T 220 335" stroke="#a9a39a" strokeWidth="0.5" opacity="0.2" fill="none" />
            <path d="M0 375 Q 70 365 140 380 T 260 370" stroke="#a9a39a" strokeWidth="0.5" opacity="0.15" fill="none" />
          </svg>

          {/* Floating glowing embers */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[52%] left-[28%] w-1.5 h-1.5 rounded-full bg-[#e87042] opacity-80 blur-[0.5px] shadow-[0_0_8px_#e87042]" />
            <div className="absolute top-[43%] left-[45%] w-1 h-1 rounded-full bg-[#f4a261] opacity-70 shadow-[0_0_6px_#f4a261]" />
            <div className="absolute top-[35%] left-[32%] w-1.5 h-1.5 rounded-full bg-[#e76f51] opacity-90 blur-[0.5px] shadow-[0_0_10px_#e76f51]" />
            <div className="absolute top-[60%] left-[55%] w-1 h-1 rounded-full bg-[#e87042] opacity-60" />
            <div className="absolute top-[48%] left-[62%] w-1.5 h-1.5 rounded-full bg-[#f4ebd0] opacity-80 shadow-[0_0_6px_#f4ebd0]" />
          </div>

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-sans font-medium tracking-[0.25em] text-[#e87042]/70 uppercase">
              A CINEMATIC MEMOIR
            </span>
          </div>
        </div>
      );

    case 'm4': // The Silent Archive
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#0d0d0b]" aria-hidden="true">
          {/* Deep charcoal amber warmth */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 20%, #24211a 0%, #12110e 55%, #080807 100%)',
            }}
          />
          {/* Architectural Colonnade & Vaulted Archway */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450" preserveAspectRatio="none">
            <defs>
              <linearGradient id="m4-arch-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2c2820" />
                <stop offset="100%" stopColor="#0a0a09" />
              </linearGradient>
            </defs>
            {/* Grand perspective ceiling ribs */}
            <line x1="150" y1="50" x2="20" y2="450" stroke="#3d372c" strokeWidth="1" opacity="0.4" />
            <line x1="150" y1="50" x2="80" y2="450" stroke="#3d372c" strokeWidth="1" opacity="0.4" />
            <line x1="150" y1="50" x2="220" y2="450" stroke="#3d372c" strokeWidth="1" opacity="0.4" />
            <line x1="150" y1="50" x2="280" y2="450" stroke="#3d372c" strokeWidth="1" opacity="0.4" />
            
            {/* Arches receding */}
            <path d="M70 450 L70 200 Q 150 140 230 200 L230 450" fill="none" stroke="#2a251d" strokeWidth="6" />
            <path d="M100 450 L100 230 Q 150 190 200 230 L200 450" fill="none" stroke="#1d1a15" strokeWidth="5" />
            <path d="M120 450 L120 260 Q 150 230 180 260 L180 450" fill="none" stroke="#151310" strokeWidth="4" />
            
            {/* Sealed Vault Keyhole / Medallion at focal point */}
            <circle cx="150" cy="180" r="16" fill="#181510" stroke="#c6a76a" strokeWidth="1" opacity="0.8" />
            <polygon points="150,172 153,184 147,184" fill="#c6a76a" opacity="0.9" />
            <circle cx="150" cy="185" r="2" fill="#080807" />
          </svg>

          {/* Light shaft piercing down */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-full pointer-events-none opacity-20"
            style={{
              background: 'linear-gradient(180deg, rgba(198,167,106,0.6) 0%, rgba(198,167,106,0.1) 40%, transparent 80%)',
              clipPath: 'polygon(40% 0%, 60% 0%, 90% 100%, 10% 100%)',
            }}
          />

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-serif tracking-[0.3em] text-[#c6a76a]/60 uppercase">
              CLASSIFIED ARCHIVE · VOL. IX
            </span>
          </div>
        </div>
      );

    case 'm5': // Cascade
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#070e10]" aria-hidden="true">
          {/* Desaturated teal to deep slate */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(165deg, #102326 0%, #0a171a 45%, #050a0b 100%)',
            }}
          />
          {/* Modern Brutalist geometric skyline */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450" preserveAspectRatio="none">
            <defs>
              <linearGradient id="m5-tower-1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1a3136" />
                <stop offset="100%" stopColor="#0c181a" />
              </linearGradient>
              <linearGradient id="m5-tower-2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0e1b1e" />
                <stop offset="100%" stopColor="#050a0c" />
              </linearGradient>
            </defs>
            {/* Diagonal searchlights */}
            <polygon points="50,450 180,0 210,0 70,450" fill="rgba(82, 149, 158, 0.12)" />
            <polygon points="250,450 130,0 150,0 270,450" fill="rgba(198, 167, 106, 0.08)" />
            
            {/* Background towers */}
            <rect x="40" y="160" width="55" height="290" fill="#0d1b1e" />
            <rect x="180" y="120" width="70" height="330" fill="#0d1b1e" />
            <polygon points="180,120 215,80 250,120" fill="#0d1b1e" />

            {/* Foreground angular monoliths */}
            <polygon points="0,450 0,220 80,180 80,450" fill="url(#m5-tower-1)" />
            <polygon points="110,450 110,140 180,90 180,450" fill="url(#m5-tower-2)" />
            <polygon points="220,450 220,190 300,150 300,450" fill="url(#m5-tower-1)" />

            {/* Architectural window grids / telemetry */}
            <line x1="120" y1="170" x2="170" y2="170" stroke="#52959e" strokeWidth="0.5" opacity="0.4" strokeDasharray="3 3" />
            <line x1="120" y1="200" x2="170" y2="200" stroke="#52959e" strokeWidth="0.5" opacity="0.4" strokeDasharray="3 3" />
            <line x1="120" y1="230" x2="170" y2="230" stroke="#52959e" strokeWidth="0.5" opacity="0.4" strokeDasharray="3 3" />
            <line x1="120" y1="260" x2="170" y2="260" stroke="#52959e" strokeWidth="0.5" opacity="0.4" strokeDasharray="3 3" />
          </svg>

          {/* Rain streaks */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(-35deg, transparent, transparent 18px, rgba(169,163,154,0.4) 18px, rgba(169,163,154,0.4) 19px)',
            }}
          />

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-mono tracking-[0.25em] text-[#52959e]/80">
              METROPOLIS · PROTOCOL ZERO
            </span>
          </div>
        </div>
      );

    case 'm6': // Nightwatch
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#09080d]" aria-hidden="true">
          {/* Midnight charcoal atmosphere */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 30%, #171520 0%, #0d0b13 50%, #060508 100%)',
            }}
          />
          {/* Streetlamp / Security floodlight cone */}
          <div
            className="absolute top-[22%] left-1/2 -translate-x-1/2 w-72 h-80 opacity-25 pointer-events-none"
            style={{
              background: 'conic-gradient(from 180deg at 50% 0%, transparent 0deg, rgba(220,175,90,0.6) 20deg, transparent 40deg)',
              filter: 'blur(10px)',
            }}
          />
          
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450" preserveAspectRatio="none">
            {/* Brutalist facility facade */}
            <rect x="20" y="140" width="260" height="310" fill="#0f0e15" stroke="#1c1926" strokeWidth="1" />
            
            {/* Dark silent windows */}
            <rect x="50" y="180" width="24" height="36" fill="#08070b" />
            <rect x="90" y="180" width="24" height="36" fill="#08070b" />
            <rect x="130" y="180" width="24" height="36" fill="#08070b" />
            <rect x="170" y="180" width="24" height="36" fill="#08070b" />
            <rect x="210" y="180" width="24" height="36" fill="#08070b" />

            <rect x="50" y="240" width="24" height="36" fill="#08070b" />
            <rect x="90" y="240" width="24" height="36" fill="#08070b" />
            
            {/* The ONE illuminated window where the secret is witnessed */}
            <rect x="130" y="240" width="24" height="36" fill="#dca855" className="animate-pulse" />
            <rect x="138" y="248" width="8" height="20" fill="#2a1e0d" opacity="0.8" />

            <rect x="170" y="240" width="24" height="36" fill="#08070b" />
            <rect x="210" y="240" width="24" height="36" fill="#08070b" />

            {/* Perimeter fence silhouette */}
            <line x1="0" y1="380" x2="300" y2="380" stroke="#1c1926" strokeWidth="2" />
            <line x1="50" y1="360" x2="50" y2="450" stroke="#1c1926" strokeWidth="1.5" />
            <line x1="150" y1="360" x2="150" y2="450" stroke="#1c1926" strokeWidth="1.5" />
            <line x1="250" y1="360" x2="250" y2="450" stroke="#1c1926" strokeWidth="1.5" />
          </svg>

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-mono tracking-[0.25em] text-[#dca855]/70 uppercase">
              FACILITY SUB-LEVEL · 03:44 AM
            </span>
          </div>
        </div>
      );

    case 'm7': // The Cartographer
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#120e09]" aria-hidden="true">
          {/* Burnt amber parchment gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 45%, #2a2014 0%, #17120a 55%, #0a0805 100%)',
            }}
          />
          {/* Topographic elevation contour lines */}
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 300 450">
            <path d="M-20,100 C60,80 180,120 320,70" stroke="#c6a76a" strokeWidth="0.75" fill="none" />
            <path d="M-20,130 C80,110 160,160 320,110" stroke="#c6a76a" strokeWidth="0.75" fill="none" />
            <path d="M-20,160 C100,150 140,200 320,150" stroke="#c6a76a" strokeWidth="0.75" fill="none" />
            <path d="M-20,190 C60,190 200,240 320,200" stroke="#c6a76a" strokeWidth="0.75" fill="none" />
            <path d="M-20,230 C80,240 180,280 320,240" stroke="#c6a76a" strokeWidth="0.75" fill="none" />
            <path d="M-20,270 C100,280 150,330 320,290" stroke="#c6a76a" strokeWidth="0.75" fill="none" />

            {/* Compass Rose / Astrolabe motif */}
            <g transform="translate(150, 190)">
              <circle cx="0" cy="0" r="45" stroke="#c6a76a" strokeWidth="0.5" fill="none" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="55" stroke="#a9a39a" strokeWidth="0.5" fill="none" opacity="0.5" />
              <polygon points="0,-40 6,-10 0,0 -6,-10" fill="#c6a76a" opacity="0.9" />
              <polygon points="0,40 6,10 0,0 -6,10" fill="#8a7248" opacity="0.7" />
              <polygon points="40,0 10,6 0,0 10,-6" fill="#8a7248" opacity="0.7" />
              <polygon points="-40,0 -10,6 0,0 -10,-6" fill="#8a7248" opacity="0.7" />
              <circle cx="0" cy="0" r="3" fill="#f4f0e8" />
            </g>
          </svg>

          {/* Patagonian jagged mountain peaks silhouette */}
          <svg className="absolute bottom-0 inset-x-0 w-full h-44" viewBox="0 0 300 160" preserveAspectRatio="none">
            <path d="M0,160 L0,90 L40,50 L80,100 L130,20 L180,80 L230,35 L270,85 L300,60 L300,160 Z" fill="#0a0805" />
            <path d="M30,160 L70,85 L130,20 L160,85" stroke="#c6a76a" strokeWidth="0.75" opacity="0.4" fill="none" />
          </svg>

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-mono tracking-[0.3em] text-[#c6a76a]/70 uppercase">
              TERRA INCOGNITA · 1642
            </span>
          </div>
        </div>
      );

    case 'm8': // Hollow Crown
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#0d0708]" aria-hidden="true">
          {/* Deep royal oxblood & bronze */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 25%, #2d1015 0%, #15080b 55%, #080304 100%)',
            }}
          />
          {/* Gothic Cathedral Rose Window silhouette */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450">
            {/* Great Rose Window Outline */}
            <g transform="translate(150, 130)">
              <circle cx="0" cy="0" r="70" stroke="#6f2028" strokeWidth="2" fill="none" opacity="0.6" />
              <circle cx="0" cy="0" r="50" stroke="#c6a76a" strokeWidth="1" fill="none" opacity="0.5" />
              {/* Petals / Traceries */}
              <circle cx="0" cy="-35" r="14" stroke="#c6a76a" strokeWidth="0.5" fill="none" opacity="0.4" />
              <circle cx="35" cy="0" r="14" stroke="#c6a76a" strokeWidth="0.5" fill="none" opacity="0.4" />
              <circle cx="0" cy="35" r="14" stroke="#c6a76a" strokeWidth="0.5" fill="none" opacity="0.4" />
              <circle cx="-35" cy="0" r="14" stroke="#c6a76a" strokeWidth="0.5" fill="none" opacity="0.4" />
              <circle cx="0" cy="0" r="8" fill="#c6a76a" opacity="0.7" />
            </g>

            {/* Light beam descending from window */}
            <polygon points="120,130 180,130 250,450 50,450" fill="rgba(198,167,106,0.08)" />

            {/* The Crown suspended in the light beam */}
            <g transform="translate(150, 240)">
              <path
                d="M-30,15 L-30,-5 L-18,6 L0,-16 L18,6 L30,-5 L30,15 Z"
                fill="#0d0708"
                stroke="#c6a76a"
                strokeWidth="1.5"
              />
              <circle cx="-30" cy="-6" r="2" fill="#c6a76a" />
              <circle cx="0" cy="-17" r="2.5" fill="#f4f0e8" />
              <circle cx="30" cy="-6" r="2" fill="#c6a76a" />
              <circle cx="0" cy="5" r="2" fill="#6f2028" />
            </g>

            {/* Gothic throne silhouette */}
            <polygon points="110,450 110,320 150,290 190,320 190,450" fill="#080304" />
          </svg>

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-serif tracking-[0.3em] text-[#c6a76a]/70 uppercase">
              A HISTORICAL TRAGEDY
            </span>
          </div>
        </div>
      );

    case 'm9': // Neon Requiem
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#090b0e]" aria-hidden="true">
          {/* Rain-slicked Neo-Noir alley */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(175deg, #10151c 0%, #0a0d12 45%, #050608 100%)',
            }}
          />
          {/* Muted neon amber & desaturated teal glow reflections on wet pavement */}
          <div
            className="absolute bottom-0 inset-x-0 h-44 opacity-35"
            style={{
              background: 'radial-gradient(ellipse at 40% 90%, rgba(198,167,106,0.4) 0%, rgba(53,92,99,0.3) 40%, transparent 80%)',
            }}
          />

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450" preserveAspectRatio="none">
            {/* Narrow city alley walls */}
            <polygon points="0,0 70,0 70,360 0,450" fill="#0d1016" />
            <polygon points="300,0 230,0 230,360 300,450" fill="#0b0e13" />

            {/* Fire escape zig-zag silhouettes */}
            <line x1="15" y1="100" x2="65" y2="100" stroke="#1b222d" strokeWidth="2" />
            <line x1="65" y1="100" x2="20" y2="150" stroke="#1b222d" strokeWidth="1.5" />
            <line x1="15" y1="150" x2="65" y2="150" stroke="#1b222d" strokeWidth="2" />
            <line x1="20" y1="150" x2="65" y2="200" stroke="#1b222d" strokeWidth="1.5" />
            <line x1="15" y1="200" x2="65" y2="200" stroke="#1b222d" strokeWidth="2" />

            {/* Vertical glowing kanji/neon sign outline */}
            <rect x="240" y="80" width="10" height="70" fill="none" stroke="#c6a76a" strokeWidth="1" opacity="0.6" />
            <line x1="245" y1="90" x2="245" y2="140" stroke="#355c63" strokeWidth="2" opacity="0.8" />

            {/* Vintage streetlamp */}
            <path d="M150,220 L150,370" stroke="#1b222d" strokeWidth="2" />
            <path d="M140,220 C140,205 160,205 160,220 Z" fill="#c6a76a" />
            <circle cx="150" cy="223" r="5" fill="#f4ebd0" />

            {/* Lone musician with saxophone case silhouette under lamp */}
            <circle cx="150" cy="318" r="4" fill="#050608" />
            <polygon points="144,324 156,324 158,368 142,368" fill="#050608" />
            {/* Instrument case */}
            <rect x="157" y="340" width="5" height="18" rx="1" fill="#050608" />
          </svg>

          {/* Rain streaks overlay */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(-20deg, transparent, transparent 15px, rgba(147,181,207,0.3) 15px, rgba(147,181,207,0.3) 16px)',
            }}
          />

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-sans tracking-[0.3em] text-[#355c63]/90 uppercase">
              A RAIN-SOAKED ELEGY
            </span>
          </div>
        </div>
      );

    case 'm10': // Solstice
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#070e0a]" aria-hidden="true">
          {/* Forest green and twilight bronze */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, #15281e 0%, #0d1a13 50%, #050a07 100%)',
            }}
          />
          {/* Giant pale solstice sun setting behind pine trees */}
          <div
            className="absolute top-[22%] left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(198,167,106,0.35) 0%, rgba(138,114,72,0.1) 60%, transparent 80%)',
            }}
          />
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-[#f4ebd0] opacity-80" />

          {/* Layered coniferous pine tree silhouettes */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450" preserveAspectRatio="none">
            {/* Back ridge of pines */}
            <g fill="#0b1711" opacity="0.6">
              <polygon points="40,240 25,270 55,270" />
              <polygon points="80,220 60,260 100,260" />
              <polygon points="120,235 105,270 135,270" />
              <polygon points="170,210 150,255 190,255" />
              <polygon points="210,225 195,265 225,265" />
              <polygon points="260,230 240,270 280,270" />
              <rect x="0" y="260" width="300" height="190" />
            </g>
            {/* Front dense pines */}
            <g fill="#050a07">
              <polygon points="20,280 0,330 40,330" />
              <polygon points="65,260 40,320 90,320" />
              <polygon points="110,290 85,345 135,345" />
              <polygon points="230,270 200,335 260,335" />
              <polygon points="280,285 255,340 305,340" />
              <rect x="0" y="325" width="300" height="125" />
            </g>

            {/* Mountain cabin with warm golden window */}
            <polygon points="150,330 185,330 167,315" fill="#142018" />
            <rect x="153" y="330" width="30" height="22" fill="#0b130e" />
            <rect x="163" y="336" width="10" height="9" fill="#c6a76a" className="animate-pulse" />
          </svg>

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-sans tracking-[0.25em] text-[#c6a76a]/70 uppercase">
              THE LONGEST DAY
            </span>
          </div>
        </div>
      );

    // ----------------------------------------------------
    // SERIES
    // ----------------------------------------------------
    case 's1': // Threshold
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#050b14]" aria-hidden="true">
          {/* Deep oceanic/outer space Europa gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 30%, #0d1e34 0%, #071220 50%, #03080e 100%)',
            }}
          />
          {/* Europa Ice fissure emitting bioluminescent cyan/teal glow */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450">
            {/* Fissure crack lines */}
            <path
              d="M150,140 Q130,220 160,290 T145,450"
              stroke="#52959e"
              strokeWidth="4"
              fill="none"
              style={{ filter: 'drop-shadow(0 0 8px #52959e)' }}
            />
            <path
              d="M150,140 Q130,220 160,290 T145,450"
              stroke="#f4f0e8"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Side cracks */}
            <path d="M140,230 L90,260 L60,250" stroke="#52959e" strokeWidth="1" fill="none" opacity="0.7" />
            <path d="M155,270 L210,300 L240,290" stroke="#52959e" strokeWidth="1" fill="none" opacity="0.7" />
            <path d="M150,350 L110,380" stroke="#52959e" strokeWidth="0.75" fill="none" opacity="0.5" />

            {/* Giant celestial gas giant cresting upper horizon */}
            <circle cx="150" cy="-20" r="130" stroke="#c6a76a" strokeWidth="0.75" fill="#08101a" opacity="0.8" />
            <ellipse cx="150" cy="-20" rx="160" ry="25" stroke="#a9a39a" strokeWidth="0.5" fill="none" opacity="0.4" />
          </svg>

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-mono tracking-[0.3em] text-[#52959e] uppercase">
              EUROPA BASE · SECTOR NINE
            </span>
          </div>
        </div>
      );

    case 's2': // The Meridian
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#110c08]" aria-hidden="true">
          {/* Neoclassical embassy terrace divided by golden meridian */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #1c140c 0%, #100b07 50%, #080503 100%)',
            }}
          />
          {/* The Glowing Gold Meridian Line dividing two timelines */}
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#c6a76a] to-transparent shadow-[0_0_12px_#c6a76a]" />

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450">
            {/* Left timeline architecture (Classical balustrade) */}
            <rect x="20" y="320" width="115" height="15" fill="#1b130b" />
            <line x1="35" y1="335" x2="35" y2="400" stroke="#1b130b" strokeWidth="4" />
            <line x1="60" y1="335" x2="60" y2="400" stroke="#1b130b" strokeWidth="4" />
            <line x1="85" y1="335" x2="85" y2="400" stroke="#1b130b" strokeWidth="4" />
            <line x1="110" y1="335" x2="110" y2="400" stroke="#1b130b" strokeWidth="4" />

            {/* Silhouette 1 (Past) */}
            <circle cx="75" cy="270" r="5" fill="#080503" />
            <polygon points="68,278 82,278 85,320 65,320" fill="#080503" />

            {/* Right timeline architecture (Modern steel glass) */}
            <rect x="165" y="320" width="115" height="4" fill="#8a7248" />
            <line x1="185" y1="324" x2="185" y2="400" stroke="#8a7248" strokeWidth="1" />
            <line x1="225" y1="324" x2="225" y2="400" stroke="#8a7248" strokeWidth="1" />
            <line x1="265" y1="324" x2="265" y2="400" stroke="#8a7248" strokeWidth="1" />

            {/* Silhouette 2 (Present) looking across at Silhouette 1 */}
            <circle cx="225" cy="270" r="5" fill="#080503" />
            <polygon points="218,278 232,278 235,320 215,320" fill="#080503" />
          </svg>

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-serif tracking-[0.3em] text-[#c6a76a]/80 uppercase">
              TWO CONTINENTS · ONE TRUTH
            </span>
          </div>
        </div>
      );

    case 's3': // Cold Case: Ashford
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#090e11]" aria-hidden="true">
          {/* Desaturated coastal teal in fog */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 40%, #121c22 0%, #0b1216 55%, #05080a 100%)',
            }}
          />
          {/* Atmospheric sea fog layers */}
          <div className="absolute top-[35%] inset-x-0 h-28 bg-gradient-to-b from-transparent via-[#a9a39a]/10 to-transparent blur-md" />

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450" preserveAspectRatio="none">
            {/* Abandoned coastal jetty leading out into foggy water */}
            <polygon points="150,250 154,250 190,450 110,450" fill="#080c0e" />
            {/* Jetty wooden pilings */}
            <line x1="140" y1="260" x2="140" y2="300" stroke="#121a1f" strokeWidth="2" />
            <line x1="164" y1="260" x2="164" y2="300" stroke="#121a1f" strokeWidth="2" />
            <line x1="130" y1="310" x2="130" y2="360" stroke="#121a1f" strokeWidth="2.5" />
            <line x1="174" y1="310" x2="174" y2="360" stroke="#121a1f" strokeWidth="2.5" />
            <line x1="118" y1="370" x2="118" y2="440" stroke="#121a1f" strokeWidth="3" />
            <line x1="186" y1="370" x2="186" y2="440" stroke="#121a1f" strokeWidth="3" />

            {/* Faint solitary lantern on the end of the dock */}
            <circle cx="152" cy="246" r="3" fill="#c6a76a" />
            <circle cx="152" cy="246" r="10" fill="#c6a76a" opacity="0.3" />
            {/* Police archive case file watermark */}
            <text x="150" y="160" textAnchor="middle" fill="#a9a39a" opacity="0.15" fontSize="32" fontFamily="monospace">
              EVIDENCE #402
            </text>
          </svg>

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-mono tracking-[0.25em] text-[#a9a39a]/70 uppercase">
              ASHFORD POLICE ARCHIVE
            </span>
          </div>
        </div>
      );

    case 's4': // Celestial
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#0c0816]" aria-hidden="true">
          {/* Midnight indigo-charcoal & bronze constellation field */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 35%, #1f1433 0%, #100b1c 50%, #06040a 100%)',
            }}
          />
          {/* Armillary sphere / Astrolabe circles */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450">
            <g transform="translate(150, 180)">
              <circle cx="0" cy="0" r="75" stroke="#c6a76a" strokeWidth="1" fill="none" opacity="0.5" />
              <ellipse cx="0" cy="0" rx="75" ry="30" stroke="#c6a76a" strokeWidth="0.75" fill="none" opacity="0.6" transform="rotate(-25)" />
              <ellipse cx="0" cy="0" rx="75" ry="30" stroke="#a9a39a" strokeWidth="0.75" fill="none" opacity="0.4" transform="rotate(35)" />
              
              {/* Glowing star core */}
              <circle cx="0" cy="0" r="8" fill="#f4ebd0" className="animate-pulse" style={{ filter: 'drop-shadow(0 0 10px #c6a76a)' }} />
              
              {/* Constellation stars and lines */}
              <circle cx="-40" cy="-45" r="2" fill="#c6a76a" />
              <circle cx="35" cy="-55" r="2.5" fill="#f4ebd0" />
              <circle cx="50" cy="40" r="2" fill="#c6a76a" />
              <circle cx="-55" cy="30" r="2" fill="#a9a39a" />

              <line x1="-40" y1="-45" x2="0" y2="0" stroke="#c6a76a" strokeWidth="0.5" opacity="0.4" />
              <line x1="35" y1="-55" x2="0" y2="0" stroke="#c6a76a" strokeWidth="0.5" opacity="0.4" />
              <line x1="50" y1="40" x2="0" y2="0" stroke="#c6a76a" strokeWidth="0.5" opacity="0.4" />
            </g>
          </svg>

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-serif tracking-[0.3em] text-[#c6a76a]/80 uppercase">
              EPIC FANTASY ANTHOLOGY
            </span>
          </div>
        </div>
      );

    case 's5': // Undertow
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#040d12]" aria-hidden="true">
          {/* Deep ocean abyss looking up at ship keel */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 15%, #0b222d 0%, #06141b 50%, #02070a 100%)',
            }}
          />
          {/* Hull of luxury cruise ship viewed from below */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450" preserveAspectRatio="none">
            {/* Surface light ripples */}
            <ellipse cx="150" cy="20" rx="160" ry="40" fill="rgba(82, 149, 158, 0.2)" />
            
            {/* The sharp knife-keel of the ship cutting the dark water */}
            <polygon points="150,40 180,0 120,0" fill="#03080b" />
            <polygon points="150,40 220,180 80,180" fill="#03080b" stroke="#0a1a23" strokeWidth="1" />
            <polygon points="150,180 150,240 148,240 148,180" fill="#0a1a23" />

            {/* Rising air bubbles */}
            <circle cx="140" cy="220" r="3" fill="none" stroke="#52959e" strokeWidth="0.75" opacity="0.6" />
            <circle cx="155" cy="260" r="4.5" fill="none" stroke="#52959e" strokeWidth="0.75" opacity="0.5" />
            <circle cx="145" cy="290" r="2" fill="none" stroke="#52959e" strokeWidth="0.75" opacity="0.7" />
            <circle cx="160" cy="330" r="5" fill="none" stroke="#52959e" strokeWidth="0.75" opacity="0.4" />
            <circle cx="138" cy="360" r="3" fill="none" stroke="#52959e" strokeWidth="0.75" opacity="0.5" />
          </svg>

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-mono tracking-[0.25em] text-[#52959e] uppercase">
              ABYSSAL INVESTIGATION
            </span>
          </div>
        </div>
      );

    case 's6': // The Founding
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#120a06]" aria-hidden="true">
          {/* Historical oxblood and warm bronze sunset */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, #30160d 0%, #1a0c07 50%, #0a0503 100%)',
            }}
          />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 450" preserveAspectRatio="none">
            {/* Windswept hill silhouette */}
            <path d="M-20,320 Q80,260 170,290 T320,270 L320,450 L-20,450 Z" fill="#0a0503" />

            {/* Silhouettes of three women founders on the hill ridge */}
            {/* Founder 1 */}
            <circle cx="120" cy="245" r="4" fill="#0a0503" />
            <path d="M115,251 L125,251 L128,290 L112,290 Z" fill="#0a0503" />
            {/* Founder 2 (Center) */}
            <circle cx="145" cy="240" r="4.5" fill="#0a0503" />
            <path d="M138,247 L152,247 L155,285 L135,285 Z" fill="#0a0503" />
            {/* Billowing cloak */}
            <path d="M152,250 Q165,260 175,255 L155,275 Z" fill="#0a0503" />
            {/* Founder 3 */}
            <circle cx="175" cy="246" r="4" fill="#0a0503" />
            <path d="M170,252 L180,252 L183,292 L167,292 Z" fill="#0a0503" />

            {/* Faint parchment historic seal */}
            <circle cx="150" cy="120" r="35" stroke="#c6a76a" strokeWidth="0.75" fill="none" opacity="0.3" strokeDasharray="3 3" />
          </svg>

          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[8px] font-serif tracking-[0.28em] text-[#c6a76a]/80 uppercase">
              THE UNTOLD CHRONICLE
            </span>
          </div>
        </div>
      );

    // Default Fallback
    default:
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#101012]" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 35%, #22201b 0%, #12110e 55%, #080807 100%)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="font-serif text-5xl text-vc-gold">V</span>
          </div>
        </div>
      );
  }
};
