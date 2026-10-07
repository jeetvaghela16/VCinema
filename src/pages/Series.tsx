import { useState } from 'react';
import SeriesCard from '../components/cards/SeriesCard';
import { seriesList } from '../data/series';

const GENRES = ['All', 'Drama', 'Sci-Fi', 'Crime', 'Fantasy', 'Thriller', 'Historical'];

export default function Series() {
  const [activeGenre, setActiveGenre] = useState('All');

  const filtered = activeGenre === 'All'
    ? seriesList
    : seriesList.filter((s) => s.genre.toLowerCase().includes(activeGenre.toLowerCase()));

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-12 pb-8">
        <div className="section-divider mb-0">
          <h1 className="font-sans text-[11px] font-semibold tracking-[0.25em] text-vc-gold uppercase">
            Series
          </h1>
        </div>
        <h2 className="font-serif text-4xl md:text-5xl text-vc-text-primary mt-4 mb-8">
          Web Series
        </h2>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeGenre === genre
                  ? 'bg-vc-gold text-black'
                  : 'border border-vc-border text-vc-text-muted hover:border-vc-gold/40 hover:text-vc-gold bg-transparent'
              }`}
              aria-pressed={activeGenre === genre}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
            {filtered.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-vc-text-muted">No series found in this genre yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
