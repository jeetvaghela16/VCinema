import type { Movie } from '../types';
import { CURATED_GLOBAL_MOVIES } from '../services/tmdbService';

/**
 * VCinema Core Movie Catalog
 * Pure authentic cinema catalog with verified posters, high-res backdrops, and official trailers.
 * Replaced synthetic demo movies with world cinema masterpieces.
 */
export const movies: Movie[] = CURATED_GLOBAL_MOVIES;

export const continueWatchingMovies: Movie[] = movies.slice(0, 4);
export const nowShowingMovies: Movie[] = movies.slice(0, 6);
export const popularMovies: Movie[] = movies.slice(0, 6);
