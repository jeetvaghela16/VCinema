import type { Movie } from '../types';

export const movies: Movie[] = [
  {
    id: 'm1',
    title: 'The Grand Horizon',
    year: 2026,
    genre: 'Drama',
    rating: '8.7',
    duration: '2h 18m',
    description:
      'A breathtaking journey across the edge of the world, where silence speaks louder than words and the horizon holds infinite secrets.',
    gradientFrom: '#1c2b3a',
    gradientTo: '#0a1520',
  },
  {
    id: 'm2',
    title: 'Eclipse Protocol',
    year: 2025,
    genre: 'Sci-Fi',
    rating: '8.2',
    duration: '2h 04m',
    description:
      'When a covert space agency intercepts an alien signal, one analyst risks everything to decode a message that could rewrite human history.',
    gradientFrom: '#0d1b2a',
    gradientTo: '#1a0a2e',
    progress: 65,
  },
  {
    id: 'm3',
    title: 'Ember Falls',
    year: 2025,
    genre: 'Romance',
    rating: '7.9',
    duration: '1h 52m',
    description:
      'Two strangers meet at the end of summer in a coastal village. What begins as a brief encounter becomes an unforgettable season of loss and love.',
    gradientFrom: '#2a1018',
    gradientTo: '#1a0a0c',
  },
  {
    id: 'm4',
    title: 'The Silent Archive',
    year: 2024,
    genre: 'Mystery',
    rating: '8.5',
    duration: '2h 11m',
    description:
      'A disgraced archivist discovers a sealed vault beneath a century-old library — and the documents inside implicate everyone in power.',
    gradientFrom: '#1a1a10',
    gradientTo: '#0e0d08',
    progress: 30,
  },
  {
    id: 'm5',
    title: 'Cascade',
    year: 2026,
    genre: 'Action',
    rating: '7.6',
    duration: '1h 58m',
    description:
      'A tactical operative must stop a cascading series of engineered disasters across three cities before the final, catastrophic event.',
    gradientFrom: '#0a1c1a',
    gradientTo: '#061210',
  },
  {
    id: 'm6',
    title: 'Nightwatch',
    year: 2025,
    genre: 'Thriller',
    rating: '8.1',
    duration: '1h 46m',
    description:
      'A late-shift security guard at a pharmaceutical lab witnesses something she was never meant to see — and now she must survive the night.',
    gradientFrom: '#141020',
    gradientTo: '#0c0a14',
    progress: 82,
  },
  {
    id: 'm7',
    title: 'The Cartographer',
    year: 2024,
    genre: 'Adventure',
    rating: '7.8',
    duration: '2h 22m',
    description:
      'An eccentric mapmaker follows a 400-year-old chart into the uncharted wilderness of Patagonia, and confronts his own shattered past.',
    gradientFrom: '#1a1408',
    gradientTo: '#100c04',
  },
  {
    id: 'm8',
    title: 'Hollow Crown',
    year: 2025,
    genre: 'Historical Drama',
    rating: '8.9',
    duration: '2h 44m',
    description:
      'The untold story of a queen who ruled in silence while the world believed a king sat on the throne — a portrait of power and sacrifice.',
    gradientFrom: '#1e1408',
    gradientTo: '#120c04',
    progress: 10,
  },
  {
    id: 'm9',
    title: 'Neon Requiem',
    year: 2026,
    genre: 'Neo-Noir',
    rating: '8.4',
    duration: '2h 01m',
    description:
      'In a rain-drenched city of fractured light, a jazz musician turned reluctant detective pieces together the last night of a murdered composer.',
    gradientFrom: '#1a0a18',
    gradientTo: '#100810',
  },
  {
    id: 'm10',
    title: 'Solstice',
    year: 2024,
    genre: 'Drama',
    rating: '8.0',
    duration: '1h 55m',
    description:
      'Three generations of a family gather at a remote mountain cabin on the longest day of the year — and unburied truths refuse to stay buried.',
    gradientFrom: '#101a18',
    gradientTo: '#081210',
  },
];

export const continueWatchingMovies = movies.filter((m) => m.progress !== undefined);
export const nowShowingMovies = movies.slice(0, 6);
export const popularMovies = movies.slice(0, 6);
