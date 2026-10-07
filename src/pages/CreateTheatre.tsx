import { useState } from 'react';
import { Link } from 'react-router-dom';
import { theatreTypes } from '../data/theatres';
import { movies } from '../data/movies';
import { cn } from '../utils/cn';

export default function CreateTheatre() {
  const [selectedType, setSelectedType] = useState('friends');
  const [theatreName, setTheatreName] = useState('Midnight Screen 01');
  const [maxViewers, setMaxViewers] = useState(10);
  const [selectedMovieId, setSelectedMovieId] = useState('m1');
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');

  const selectedTypeData = theatreTypes.find((t) => t.id === selectedType) ?? theatreTypes[0];
  const maxLimit = selectedTypeData.maxViewers;
  const minLimit = 2;

  // Keep slider and displayed capacity strictly synchronized when theatre type changes
  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    const targetType = theatreTypes.find((t) => t.id === typeId);
    if (targetType) {
      setMaxViewers((current) => Math.min(Math.max(current, minLimit), targetType.maxViewers));
    }
  };

  // Immediate synchronization when slider is adjusted
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setMaxViewers(Math.min(Math.max(val, minLimit), maxLimit));
  };

  // Nudge buttons for precision keyboard/touch control
  const adjustCapacity = (delta: number) => {
    setMaxViewers((prev) => Math.min(Math.max(prev + delta, minLimit), maxLimit));
  };

  // Track progress fill percentage for custom range styling
  const sliderPercentage = maxLimit > minLimit ? ((maxViewers - minLimit) / (maxLimit - minLimit)) * 100 : 100;

  const selectedMovie = movies.find((m) => m.id === selectedMovieId);

  return (
    <div className="min-h-screen pt-[72px] pb-24 bg-vc-bg-base">
      {/* ── Console Header ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-10 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-[0.25em] text-vc-gold uppercase px-2 py-0.5 border border-vc-gold/30 rounded-[2px] bg-vc-gold/5">
            Auditorium Architecture
          </span>
          <span className="text-xs text-vc-text-muted">&middot; Step 1 of 1</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-vc-text-primary mt-2 mb-2">
          Configure Virtual Theatre
        </h1>
        <p className="text-vc-text-muted text-sm max-w-xl">
          Establish an synchronized virtual screening room. Tailor the acoustics, seating capacity, and admission protocol for your audience.
        </p>
      </div>

      {/* ── Main Configuration Canvas ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <div className="glass-panel rounded-[6px] border border-vc-border/80 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 sm:p-8 md:p-10 space-y-10">

          {/* ── SECTION 01: Theatre Type (Screening Architecture) ── */}
          <fieldset className="space-y-4">
            <div className="flex items-center justify-between border-b border-vc-border/60 pb-3">
              <div>
                <legend className="text-xs font-semibold text-vc-text-primary tracking-widest uppercase">
                  01 &middot; Choose Theatre Format
                </legend>
                <p className="text-[11px] text-vc-text-muted mt-0.5">
                  Select the spatial atmosphere and scale of the auditorium
                </p>
              </div>
              <span className="text-[11px] font-mono text-vc-gold font-medium">
                Max {selectedTypeData.maxViewers} Seats
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {theatreTypes.map((type) => {
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeSelect(type.id)}
                    className={cn(
                      'relative flex flex-col text-left p-4 rounded-[4px] border transition-all duration-300 group',
                      isSelected
                        ? 'border-vc-gold bg-vc-gold/[0.08] shadow-[0_0_24px_rgba(198,167,106,0.18)] translate-y-[-2px]'
                        : 'border-vc-border/70 bg-vc-bg-card/40 hover:border-vc-border-strong hover:bg-vc-bg-card',
                    )}
                    aria-pressed={isSelected}
                  >
                    {/* Active Pip */}
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-vc-gold shadow-[0_0_8px_#c6a76a]" />
                    )}

                    <span className="text-2xl mb-2" aria-hidden="true">
                      {type.icon}
                    </span>

                    <span className="font-serif text-sm font-semibold text-vc-text-primary mb-1">
                      {type.label}
                    </span>

                    <span className="text-[11px] text-vc-text-muted/90 leading-relaxed mb-3 flex-1">
                      {type.description}
                    </span>

                    <span className="text-[10px] font-mono tracking-wider text-vc-gold-dim group-hover:text-vc-gold transition-colors">
                      Up to {type.maxViewers} Viewers
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* ── SECTION 02: Theatre Identity & Name ── */}
          <div className="space-y-4">
            <div className="border-b border-vc-border/60 pb-3">
              <label htmlFor="theatre-name" className="text-xs font-semibold text-vc-text-primary tracking-widest uppercase block">
                02 &middot; Auditorium Placard
              </label>
              <p className="text-[11px] text-vc-text-muted mt-0.5">
                The name displayed on the theatre lobby marquee and invitation tickets
              </p>
            </div>

            <div className="relative">
              <input
                id="theatre-name"
                type="text"
                value={theatreName}
                onChange={(e) => setTheatreName(e.target.value)}
                placeholder="e.g. Midnight Salon 01"
                maxLength={48}
                className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3.5 text-sm text-vc-text-primary placeholder-vc-text-muted/40 focus:border-vc-gold/60 focus:outline-none transition-colors shadow-inner"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-vc-text-muted/50">
                {theatreName.length}/48
              </span>
            </div>
          </div>

          {/* ── SECTION 03: Interactive Capacity & Synchronized Slider ── */}
          <div className="space-y-5">
            <div className="border-b border-vc-border/60 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-vc-text-primary tracking-widest uppercase block">
                  03 &middot; Audience Seating Capacity
                </span>
                <p className="text-[11px] text-vc-text-muted mt-0.5">
                  Synchronized viewers limit for this screening session
                </p>
              </div>

              {/* Exact Synchronized Value Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-vc-text-muted uppercase">Max Viewers:</span>
                <span className="text-base font-mono font-bold text-vc-gold px-2.5 py-0.5 bg-vc-gold/10 border border-vc-gold/30 rounded-[3px]">
                  {maxViewers}
                </span>
              </div>
            </div>

            {/* Slider Track with Custom Progress Fill & Touch Nudges */}
            <div className="bg-vc-bg-base/70 p-5 rounded-[4px] border border-vc-border/80 space-y-4">
              <div className="flex items-center gap-4">
                {/* Decrement Button */}
                <button
                  type="button"
                  onClick={() => adjustCapacity(-1)}
                  disabled={maxViewers <= minLimit}
                  className="w-8 h-8 rounded-[3px] border border-vc-border flex items-center justify-center text-vc-text-muted hover:text-vc-gold hover:border-vc-gold/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label="Decrease maximum viewers"
                >
                  &minus;
                </button>

                {/* Range Slider */}
                <div className="flex-1 relative flex items-center">
                  <input
                    id="max-viewers-range"
                    type="range"
                    min={minLimit}
                    max={maxLimit}
                    step={1}
                    value={maxViewers}
                    onChange={handleSliderChange}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-transparent focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, #c6a76a 0%, #c6a76a ${sliderPercentage}%, #181714 ${sliderPercentage}%, #181714 100%)`,
                    }}
                    aria-label={`Maximum viewers: ${maxViewers}`}
                    aria-valuemin={minLimit}
                    aria-valuemax={maxLimit}
                    aria-valuenow={maxViewers}
                  />
                </div>

                {/* Increment Button */}
                <button
                  type="button"
                  onClick={() => adjustCapacity(1)}
                  disabled={maxViewers >= maxLimit}
                  className="w-8 h-8 rounded-[3px] border border-vc-border flex items-center justify-center text-vc-text-muted hover:text-vc-gold hover:border-vc-gold/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label="Increase maximum viewers"
                >
                  &#43;
                </button>
              </div>

              {/* Slider Bounds & Quick Select Pill Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-vc-text-muted">
                  Min: {minLimit} Viewers
                </span>

                <div className="flex items-center gap-1.5">
                  {[2, 5, 10, 20, 50]
                    .filter((val) => val <= maxLimit)
                    .map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setMaxViewers(preset)}
                        className={cn(
                          'text-[10px] font-mono px-2 py-0.5 rounded-[2px] border transition-all',
                          maxViewers === preset
                            ? 'bg-vc-gold text-black font-semibold border-vc-gold'
                            : 'border-vc-border text-vc-text-muted hover:text-vc-gold hover:border-vc-gold/30',
                        )}
                      >
                        {preset}
                      </button>
                    ))}
                </div>

                <span className="text-[11px] font-mono text-vc-gold">
                  Limit: {maxLimit} Viewers
                </span>
              </div>

              {/* Seating Grid Visualizer (Simulated Cinema Seats) */}
              <div className="pt-2 border-t border-vc-border/40">
                <p className="text-[10px] font-mono text-vc-text-muted/70 uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>Auditorium Floorplan</span>
                  <span>{maxViewers} of {maxLimit} Seats Active</span>
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                  {Array.from({ length: Math.min(maxLimit, 50) }).map((_, index) => {
                    const isOccupied = index < maxViewers;
                    return (
                      <div
                        key={index}
                        title={`Seat ${index + 1}`}
                        className={cn(
                          'w-3.5 h-3.5 rounded-[1px] transition-colors duration-200 flex items-center justify-center text-[7px]',
                          isOccupied
                            ? 'bg-vc-gold/80 border border-vc-gold text-black font-bold'
                            : 'bg-white/[0.04] border border-white/5',
                        )}
                        aria-hidden="true"
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 04: Feature Presentation Selector ── */}
          <div className="space-y-4">
            <div className="border-b border-vc-border/60 pb-3">
              <label htmlFor="movie-select" className="text-xs font-semibold text-vc-text-primary tracking-widest uppercase block">
                04 &middot; Feature Presentation
              </label>
              <p className="text-[11px] text-vc-text-muted mt-0.5">
                Authorized film or series loaded onto the virtual projection system
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <select
                  id="movie-select"
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3.5 text-sm text-vc-text-primary focus:border-vc-gold/60 focus:outline-none transition-colors"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.year}) &middot; {m.genre} &middot; {m.duration}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Title Preview Card */}
              {selectedMovie && (
                <div className="bg-vc-bg-base/70 p-3.5 rounded-[4px] border border-vc-border flex items-center gap-3">
                  <div className="w-10 h-14 rounded-[2px] bg-black/60 border border-vc-border flex-shrink-0 flex items-center justify-center font-serif text-vc-gold text-sm font-bold">
                    V
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-serif font-semibold text-vc-text-primary truncate">
                      {selectedMovie.title}
                    </p>
                    <p className="text-[10px] text-vc-text-muted">
                      {selectedMovie.genre} &middot; ★ {selectedMovie.rating}
                    </p>
                    <span className="text-[9px] font-mono text-vc-gold uppercase">
                      Ready for Reel
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 05: Admission Security Protocol ── */}
          <div className="space-y-4">
            <div className="border-b border-vc-border/60 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-vc-text-primary tracking-widest uppercase block">
                  05 &middot; Admission Security
                </span>
                <p className="text-[11px] text-vc-text-muted mt-0.5">
                  Require a private passcode for viewers entering this virtual room
                </p>
              </div>

              {/* Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={usePassword}
                onClick={() => setUsePassword((v) => !v)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-vc-gold',
                  usePassword ? 'bg-vc-gold' : 'bg-vc-bg-base border border-vc-border',
                )}
                aria-label="Toggle password requirement"
              >
                <span
                  className={cn(
                    'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-md',
                    usePassword ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            {usePassword && (
              <div className="pt-2 animate-slide-down">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter 4-to-12 character passkey"
                  aria-label="Room admission password"
                  className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3 text-sm text-vc-text-primary placeholder-vc-text-muted/40 focus:border-vc-gold/60 focus:outline-none transition-colors"
                />
              </div>
            )}
          </div>

          {/* ── Submit & Initialize Auditorium ── */}
          <div className="pt-4 space-y-3">
            <button
              type="button"
              className="w-full py-4 bg-vc-gold text-black font-semibold text-sm tracking-wide rounded-[4px] hover:bg-vc-gold/90 transition-all duration-200 active:scale-[0.99] shadow-[0_4px_24px_rgba(198,167,106,0.35)] flex items-center justify-center gap-2"
              onClick={() => alert(`Auditorium "${theatreName}" configured with ${maxViewers} seats! (UI Demo — backend arriving in Step 2)`)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              <span>INITIALIZE VIRTUAL AUDITORIUM</span>
            </button>

            <p className="text-center text-xs text-vc-text-muted">
              Authentication will synchronize and persist rooms across devices.{' '}
              <Link to="/settings" className="text-vc-gold hover:underline">
                View Account Settings
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
