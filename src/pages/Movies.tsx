import { useState } from 'react';
import MovieCard from '../components/cards/MovieCard';
import { movies } from '../data/movies';

const GENRES = ['All', 'Drama', 'Sci-Fi', 'Action', 'Thriller', 'Romance', 'Mystery', 'Historical Drama'];

export default function Movies() {
  const [activeGenre, setActiveGenre] = useState('All');

  const filtered = activeGenre === 'All'
    ? movies
    : movies.filter((m) => m.genre.toLowerCase().includes(activeGenre.toLowerCase()));

  return (
    <div className="min-h-screen pt-[72px]">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-12 pb-8">
        <div className="section-divider mb-0">
          <h1 className="font-sans text-[11px] font-semibold tracking-[0.25em] text-vc-gold uppercase">
            Movies
          </h1>
        </div>
        <h2 className="font-serif text-4xl md:text-5xl text-vc-text-primary mt-4 mb-8">
          Feature Films
        </h2>

        {/* Genre filters */}
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

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-vc-text-muted">No movies found in this genre yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
