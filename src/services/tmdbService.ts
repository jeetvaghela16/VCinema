import type { Movie, Series } from '../types';
import { secureLogger } from '../utils/secureLogger';
import { getSyncImdbRating, enrichListWithImdbRatings } from './imdbService';

/**
 * The Movie Database (TMDB) API Client & Global Showcase Service
 *
 * Provides access to movies and web series from all over the world.
 * Automatically falls back to a curated global cinema catalog if no API key is provided.
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

const STORAGE_SLOT = '__vc_catalog_cred_v1__';

// Safe internal retrieval from secure .env environment variables (never stored in LocalStorage)
export function getTmdbApiKey(): string {
  const envKey = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
  if (envKey && envKey.trim().length > 0 && !envKey.includes('your-api-key') && !envKey.includes('your_free_tmdb_api_key_here')) {
    return envKey.trim();
  }
  // Remove any legacy keys that might have been stored in browser storage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('vcinema_tmdb_api_key');
      localStorage.removeItem(STORAGE_SLOT);
      sessionStorage.removeItem('vcinema_tmdb_api_key');
      sessionStorage.removeItem(STORAGE_SLOT);
    } catch {
      // Ignore
    }
  }
  return '';
}

export function isTmdbConfigured(): boolean {
  return getTmdbApiKey().length > 0;
}

// Genre ID maps
const MOVIE_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

const TV_GENRES: Record<number, string> = {
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
};

function mapGenre(genreIds?: number[], isTv = false): string {
  if (!genreIds || genreIds.length === 0) return isTv ? 'Web Series' : 'Cinema';
  const map = isTv ? TV_GENRES : MOVIE_GENRES;
  return map[genreIds[0]] || 'Drama';
}

/**
 * Format raw TMDB movie object into VCinema Movie with Real IMDb Rating
 */
export function formatTmdbMovie(raw: any): Movie {
  const year = raw.release_date ? new Date(raw.release_date).getFullYear() : 2025;
  const tmdbVote = raw.vote_average ? raw.vote_average.toFixed(1) : '8.0';
  const title = raw.title || raw.original_title || 'Untitled Film';
  const rating = getSyncImdbRating(title, tmdbVote, isNaN(year) ? undefined : year);
  const duration = raw.runtime ? `${Math.floor(raw.runtime / 60)}h ${raw.runtime % 60}m` : '2h 10m';

  return {
    id: `tmdb-m-${raw.id}`,
    title,
    year: isNaN(year) ? 2025 : year,
    genre: raw.genres ? raw.genres[0]?.name : mapGenre(raw.genre_ids, false),
    rating,
    duration,
    description: raw.overview || 'A masterclass screening presenting in the VCinema auditorium.',
    gradientFrom: '#121214',
    gradientTo: '#08080a',
    posterUrl: raw.poster_path ? `${TMDB_IMAGE_BASE}${raw.poster_path}` : undefined,
    backdropUrl: raw.backdrop_path ? `${TMDB_BACKDROP_BASE}${raw.backdrop_path}` : undefined,
    tmdbId: raw.id,
    originCountry: raw.original_language?.toUpperCase() || 'WORLD',
  };
}

/**
 * Format raw TMDB TV object into VCinema Series with Real IMDb Rating
 */
export function formatTmdbSeries(raw: any): Series {
  const year = raw.first_air_date ? new Date(raw.first_air_date).getFullYear() : 2025;
  const tmdbVote = raw.vote_average ? raw.vote_average.toFixed(1) : '8.2';
  const title = raw.name || raw.original_name || 'Untitled Series';
  const rating = getSyncImdbRating(title, tmdbVote, isNaN(year) ? undefined : year);

  return {
    id: `tmdb-tv-${raw.id}`,
    title,
    year: isNaN(year) ? 2025 : year,
    genre: raw.genres ? raw.genres[0]?.name : mapGenre(raw.genre_ids, true),
    rating,
    seasons: raw.number_of_seasons || 1,
    episodes: raw.number_of_episodes || 10,
    description: raw.overview || 'An acclaimed episodic journey streaming in the virtual auditorium.',
    gradientFrom: '#181410',
    gradientTo: '#0a0808',
    posterUrl: raw.poster_path ? `${TMDB_IMAGE_BASE}${raw.poster_path}` : undefined,
    backdropUrl: raw.backdrop_path ? `${TMDB_BACKDROP_BASE}${raw.backdrop_path}` : undefined,
    tmdbId: raw.id,
    originCountry: raw.original_language?.toUpperCase() || 'WORLD',
  };
}

/**
 * Safe fetch wrapper with error handling
 */
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  // 1. Primary: Use local secure proxy (/api/tmdb) so that TMDB API key is injected server-side
  // and is NEVER visible in browser Network tab or URLs.
  if (typeof window !== 'undefined') {
    try {
      const proxyUrl = new URL(`/api/tmdb${endpoint}`, window.location.origin);
      proxyUrl.searchParams.append('include_adult', 'false');
      Object.entries(params).forEach(([k, v]) => {
        proxyUrl.searchParams.append(k, v);
      });

      const res = await fetch(proxyUrl.toString());
      if (res.ok) {
        return (await res.json()) as T;
      }
    } catch {
      // Non-fatal, try direct fallback
    }
  }

  // 2. Direct Fallback: Only used if proxy server is unavailable (e.g. standalone static build)
  const apiKey = getTmdbApiKey();
  if (!apiKey) return null;

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', apiKey);
  url.searchParams.append('include_adult', 'false');

  Object.entries(params).forEach(([k, v]) => {
    url.searchParams.append(k, v);
  });

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      secureLogger.warn(`TMDB API response not OK [${res.status}]: ${res.statusText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch {
    secureLogger.error('TMDB API network connection error');
    return null;
  }
}

/**
 * Fetch Worldwide Trending Movies with Real IMDb Ratings
 */
export async function fetchTrendingMovies(page = 1): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: any[] }>('/trending/movie/week', { page: String(page) });
  if (!data?.results?.length) {
    return CURATED_GLOBAL_MOVIES;
  }
  const formatted = data.results.map(formatTmdbMovie);
  enrichListWithImdbRatings(formatted);
  return formatted;
}

/**
 * Fetch Worldwide Trending TV / Web Series with Real IMDb Ratings
 */
export async function fetchTrendingSeries(page = 1): Promise<Series[]> {
  const data = await tmdbFetch<{ results: any[] }>('/trending/tv/week', { page: String(page) });
  if (!data?.results?.length) {
    return CURATED_GLOBAL_SERIES;
  }
  const formatted = data.results.map(formatTmdbSeries);
  enrichListWithImdbRatings(formatted);
  return formatted;
}

/**
 * Fetch Popular Movies with Real IMDb Ratings
 */
export async function fetchPopularMovies(page = 1): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: any[] }>('/movie/popular', { page: String(page) });
  if (!data?.results?.length) return CURATED_GLOBAL_MOVIES;
  const formatted = data.results.map(formatTmdbMovie);
  enrichListWithImdbRatings(formatted);
  return formatted;
}

/**
 * Fetch Top Rated Movies Worldwide with Real IMDb Ratings
 */
export async function fetchTopRatedMovies(page = 1): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: any[] }>('/movie/top_rated', { page: String(page) });
  if (!data?.results?.length) return CURATED_GLOBAL_MOVIES;
  const formatted = data.results.map(formatTmdbMovie);
  enrichListWithImdbRatings(formatted);
  return formatted;
}

// ── High-speed Search Cache & In-flight Deduplication (0ms latency for cached queries) ──
const movieSearchCache = new Map<string, Movie[]>();
const seriesSearchCache = new Map<string, Series[]>();
const inFlightMovieSearches = new Map<string, Promise<Movie[]>>();
const inFlightSeriesSearches = new Map<string, Promise<Series[]>>();

/**
 * Search Movies by title or keyword across the world (instant 0ms cached response)
 */
export async function searchMovies(query: string): Promise<Movie[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return CURATED_GLOBAL_MOVIES;

  // Instant 0ms cache return
  if (movieSearchCache.has(normalized)) {
    return movieSearchCache.get(normalized)!;
  }

  // Deduplicate in-flight requests for identical queries
  if (inFlightMovieSearches.has(normalized)) {
    return inFlightMovieSearches.get(normalized)!;
  }

  const searchPromise = (async () => {
    try {
      const data = await tmdbFetch<{ results: any[] }>('/search/movie', { query: query.trim() });
      if (!data?.results || data.results.length === 0) {
        // Fallback filter on curated list
        const fallback = CURATED_GLOBAL_MOVIES.filter((m) =>
          m.title.toLowerCase().includes(normalized) ||
          m.genre.toLowerCase().includes(normalized)
        );
        movieSearchCache.set(normalized, fallback);
        return fallback;
      }
      const formatted = data.results.map(formatTmdbMovie);
      enrichListWithImdbRatings(formatted);
      if (movieSearchCache.size > 150) {
        const firstKey = movieSearchCache.keys().next().value;
        if (firstKey) movieSearchCache.delete(firstKey);
      }
      movieSearchCache.set(normalized, formatted);
      return formatted;
    } catch (err) {
      secureLogger.warn('searchMovies failed:', err);
      const fallback = CURATED_GLOBAL_MOVIES.filter((m) =>
        m.title.toLowerCase().includes(normalized) ||
        m.genre.toLowerCase().includes(normalized)
      );
      return fallback;
    } finally {
      inFlightMovieSearches.delete(normalized);
    }
  })();

  inFlightMovieSearches.set(normalized, searchPromise);
  return searchPromise;
}

/**
 * Search Series by title or keyword (instant 0ms cached response)
 */
export async function searchSeries(query: string): Promise<Series[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return CURATED_GLOBAL_SERIES;

  if (seriesSearchCache.has(normalized)) {
    return seriesSearchCache.get(normalized)!;
  }

  if (inFlightSeriesSearches.has(normalized)) {
    return inFlightSeriesSearches.get(normalized)!;
  }

  const searchPromise = (async () => {
    try {
      const data = await tmdbFetch<{ results: any[] }>('/search/tv', { query: query.trim() });
      if (!data?.results || data.results.length === 0) {
        const fallback = CURATED_GLOBAL_SERIES.filter((s) =>
          s.title.toLowerCase().includes(normalized) ||
          s.genre.toLowerCase().includes(normalized)
        );
        seriesSearchCache.set(normalized, fallback);
        return fallback;
      }
      const formatted = data.results.map(formatTmdbSeries);
      enrichListWithImdbRatings(formatted);
      if (seriesSearchCache.size > 150) {
        const firstKey = seriesSearchCache.keys().next().value;
        if (firstKey) seriesSearchCache.delete(firstKey);
      }
      seriesSearchCache.set(normalized, formatted);
      return formatted;
    } catch (err) {
      secureLogger.warn('searchSeries failed:', err);
      const fallback = CURATED_GLOBAL_SERIES.filter((s) =>
        s.title.toLowerCase().includes(normalized) ||
        s.genre.toLowerCase().includes(normalized)
      );
      return fallback;
    } finally {
      inFlightSeriesSearches.delete(normalized);
    }
  })();

  inFlightSeriesSearches.set(normalized, searchPromise);
  return searchPromise;
}

/**
 * Fetch movie trailer YouTube video key
 */
export async function fetchMovieTrailerKey(tmdbId: number): Promise<string | null> {
  const data = await tmdbFetch<{ results: any[] }>(`/movie/${tmdbId}/videos`);
  if (!data?.results?.length) return null;

  // Prioritize official trailer on YouTube
  const trailer =
    data.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
    data.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    data.results.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
    data.results.find((v) => v.site === 'YouTube');

  return trailer ? trailer.key : null;
}

/**
 * Fetch series trailer YouTube video key
 */
export async function fetchSeriesTrailerKey(tmdbId: number): Promise<string | null> {
  const data = await tmdbFetch<{ results: any[] }>(`/tv/${tmdbId}/videos`);
  if (!data?.results?.length) return null;

  const trailer =
    data.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    data.results.find((v) => v.site === 'YouTube');

  return trailer ? trailer.key : null;
}

export interface TmdbSeasonInfo {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  overview: string;
}

export interface TmdbEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date?: string;
  runtime?: number;
  vote_average?: number;
}

export interface TmdbSeriesDetails {
  id: number;
  name: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TmdbSeasonInfo[];
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: { id: number; name: string }[];
  first_air_date: string;
}

const seriesDetailsCache = new Map<number, TmdbSeriesDetails>();
const seasonEpisodesCache = new Map<string, TmdbEpisode[]>();

/**
 * Fetch full series details from TMDB including real seasons count
 */
export async function fetchSeriesDetails(tmdbId: number): Promise<TmdbSeriesDetails | null> {
  if (seriesDetailsCache.has(tmdbId)) {
    return seriesDetailsCache.get(tmdbId)!;
  }

  const data = await tmdbFetch<any>(`/tv/${tmdbId}`);
  if (!data) return null;

  const validSeasons = (data.seasons || [])
    .filter((s: any) => s.season_number > 0)
    .map((s: any) => ({
      id: s.id,
      name: s.name || `Season ${s.season_number}`,
      season_number: s.season_number,
      episode_count: s.episode_count || 1,
      poster_path: s.poster_path ? `${TMDB_IMAGE_BASE}${s.poster_path}` : null,
      overview: s.overview || '',
    }));

  const details: TmdbSeriesDetails = {
    id: data.id,
    name: data.name || data.original_name || 'Series',
    number_of_seasons: Math.max(1, validSeasons.length || data.number_of_seasons || 1),
    number_of_episodes: data.number_of_episodes || 10,
    seasons: validSeasons,
    overview: data.overview || '',
    poster_path: data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : null,
    backdrop_path: data.backdrop_path ? `${TMDB_BACKDROP_BASE}${data.backdrop_path}` : null,
    genres: data.genres || [],
    first_air_date: data.first_air_date || '',
  };

  seriesDetailsCache.set(tmdbId, details);
  return details;
}

/**
 * Fetch episodes for a specific season of a TV series
 */
export async function fetchSeasonEpisodes(
  tmdbId: number,
  seasonNumber: number
): Promise<TmdbEpisode[]> {
  const cacheKey = `${tmdbId}-s${seasonNumber}`;
  if (seasonEpisodesCache.has(cacheKey)) {
    return seasonEpisodesCache.get(cacheKey)!;
  }

  const data = await tmdbFetch<any>(`/tv/${tmdbId}/season/${seasonNumber}`);
  if (!data?.episodes) {
    return [];
  }

  const episodes: TmdbEpisode[] = data.episodes.map((ep: any) => ({
    id: ep.id,
    episode_number: ep.episode_number,
    season_number: ep.season_number || seasonNumber,
    name: ep.name || `Episode ${ep.episode_number}`,
    overview: ep.overview || '',
    still_path: ep.still_path ? `${TMDB_IMAGE_BASE}${ep.still_path}` : null,
    air_date: ep.air_date,
    runtime: ep.runtime,
    vote_average: ep.vote_average ? Number(ep.vote_average.toFixed(1)) : undefined,
  }));

  seasonEpisodesCache.set(cacheKey, episodes);
  return episodes;
}

export interface StreamServer {
  id: string;
  name: string;
  badge: string;
  category: 'multi' | 'hindi' | 'english' | 'global';
  audioSupport: string;
  syncRating?: 'perfect' | 'high' | 'standard';
  getUrl: (
    tmdbId: number,
    isTv: boolean,
    season?: number,
    episode?: number,
    audioLang?: string,
    startSeconds?: number,
    quality?: string
  ) => string;
}

export interface AudioTrackOption {
  id: string; // 'hindi' | 'multi' | 'english' | 'spanish' | 'french' | 'japanese'
  label: string;
  glyph: string;
  badge: string;
  description: string;
  recommendedServerId: string;
}

export const LANG_CODE_MAP: Record<string, string> = {
  hindi: 'hi',
  english: 'en',
  spanish: 'es',
  french: 'fr',
  japanese: 'ja',
  multi: 'all',
  global: 'all',
};

export const AUDIO_LANGUAGES: AudioTrackOption[] = [
  {
    id: 'hindi',
    label: 'हिन्दी · Hindi Dub',
    glyph: 'हि',
    badge: 'Hindi Dub',
    description: 'Hindi voice-over audio track (Bollywood, Hollywood & International dubbed)',
    recommendedServerId: 'multiembed',
  },
  {
    id: 'multi',
    label: 'Multi-Audio (All Dubs)',
    glyph: '🌐',
    badge: 'Multi-Track',
    description: 'Switch audio tracks inside player (Hindi, English, Tamil, Telugu, Spanish, French, etc.)',
    recommendedServerId: 'vidfast',
  },
  {
    id: 'english',
    label: 'English (Original)',
    glyph: 'EN',
    badge: 'English HD',
    description: 'Original English audio with dual language stream',
    recommendedServerId: 'vidlink',
  },
  {
    id: 'spanish',
    label: 'Español · Spanish Dub',
    glyph: 'ES',
    badge: 'Español',
    description: 'Spanish dubbed track for international cinema',
    recommendedServerId: 'autoembed',
  },
  {
    id: 'french',
    label: 'Français · French Dub',
    glyph: 'FR',
    badge: 'Français',
    description: 'French dubbed voice track',
    recommendedServerId: 'autoembed',
  },
  {
    id: 'japanese',
    label: '日本語 · Japanese',
    glyph: 'JA',
    badge: 'Sub/Dub',
    description: 'Original Japanese audio track or dubbed stream for Anime',
    recommendedServerId: 'vidfast',
  },
];

export const STREAM_SERVERS: StreamServer[] = [
  {
    id: 'vidfast',
    name: 'Server 1 (VidFast Multi-Audio)',
    badge: 'Multi-Audio ★ Fast Sync',
    category: 'multi',
    syncRating: 'perfect',
    audioSupport: 'Hindi, English, Tamil, Telugu, Spanish, French in player settings',
    getUrl: (id, isTv, s = 1, e = 1, _lang = 'multi', startSeconds = 0, quality = 'auto') => {
      const sec = Math.floor(Math.max(0, startSeconds));
      const timeParam = sec > 0 ? `&startAt=${sec}&start=${sec}&t=${sec}` : '';
      const langCode = LANG_CODE_MAP[_lang] || _lang;
      const langParam = langCode && langCode !== 'all' ? `&audio=${langCode}&lang=${langCode}&ds_lang=${langCode}` : '';
      const qualParam = quality && quality !== 'auto' ? `&quality=${quality}&res=${quality}` : '';
      return isTv
        ? `https://vidfast.vc/tv/${id}/${s}/${e}?autoPlay=true${langParam}${qualParam}${timeParam}`
        : `https://vidfast.vc/movie/${id}?autoPlay=true${langParam}${qualParam}${timeParam}`;
    },
  },
  {
    id: 'multiembed',
    name: 'Server 2 (MultiEmbed Hindi/Dual)',
    badge: 'हिन्दी Dubbed ★ Top Sync',
    category: 'hindi',
    syncRating: 'perfect',
    audioSupport: 'Specialized Hindi Dubbed and Multi-Audio player with regional audio tracks',
    getUrl: (id, isTv, s = 1, e = 1, _lang = 'hindi', startSeconds = 0, quality = 'auto') => {
      const sec = Math.floor(Math.max(0, startSeconds));
      const timeParam = sec > 0 ? `&start=${sec}&t=${sec}&startAt=${sec}` : '';
      const langCode = LANG_CODE_MAP[_lang] || _lang;
      const langParam = langCode && langCode !== 'all' ? `&ds_lang=${langCode}&lang=${langCode}&audio=${langCode}&preferred_audio=${langCode}&dub=${langCode}` : '&ds_lang=hi&lang=hi&audio=hi';
      const qualParam = quality && quality !== 'auto' ? `&quality=${quality}` : '';
      return isTv
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}&autoplay=1${langParam}${qualParam}${timeParam}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&autoplay=1${langParam}${qualParam}${timeParam}`;
    },
  },
  {
    id: 'nxsha',
    name: 'Server 3 (Nxsha Hindi Dub)',
    badge: 'हिन्दी Dubbed',
    category: 'hindi',
    syncRating: 'standard',
    audioSupport: 'Dedicated Hindi Dubbed audio stream',
    getUrl: (id, isTv, s = 1, e = 1, _lang = 'hindi', startSeconds = 0, quality = 'auto') => {
      const sec = Math.floor(Math.max(0, startSeconds));
      const langCode = LANG_CODE_MAP[_lang] || _lang;
      const langParam = langCode && langCode !== 'all' ? `&audio=${langCode}&lang=${langCode}&ds_lang=${langCode}&dub=${langCode}` : '&audio=hi&lang=hi&ds_lang=hi&dub=hi';
      const qualParam = quality && quality !== 'auto' ? `&quality=${quality}` : '';
      const timeParam = sec > 0 ? `&start=${sec}&t=${sec}&startAt=${sec}` : '';
      return isTv
        ? `https://nxsha.space/embed/tv/${id}/${s}/${e}?autoplay=1${langParam}${qualParam}${timeParam}`
        : `https://nxsha.space/embed/movie/${id}?autoplay=1${langParam}${qualParam}${timeParam}`;
    },
  },
  {
    id: 'vidlink',
    name: 'Server 4 (VidLink 1080p)',
    badge: '1080p ★ Fast Sync',
    category: 'english',
    syncRating: 'high',
    audioSupport: 'Original English audio, crystal clear 1080p stream',
    getUrl: (id, isTv, s = 1, e = 1, _lang = 'english', startSeconds = 0, quality = 'auto') => {
      const sec = Math.floor(Math.max(0, startSeconds));
      const timeParam = sec > 0 ? `&start=${sec}&t=${sec}&startAt=${sec}` : '';
      const langCode = LANG_CODE_MAP[_lang] || _lang;
      const langParam = langCode && langCode !== 'all' ? `&audio=${langCode}&lang=${langCode}&ds_lang=${langCode}&preferred_audio=${langCode}` : '';
      const qualParam = quality && quality !== 'auto' ? `&quality=${quality}` : '';
      return isTv
        ? `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true${langParam}${qualParam}${timeParam}`
        : `https://vidlink.pro/movie/${id}?autoplay=true${langParam}${qualParam}${timeParam}`;
    },
  },
  {
    id: 'bingr',
    name: 'Server 5 (Bingr Hindi & Dual)',
    badge: 'हिन्दी / Fast',
    category: 'hindi',
    syncRating: 'standard',
    audioSupport: 'Hindi & Dual Audio library',
    getUrl: (id, isTv, s = 1, e = 1, _lang = 'hindi', startSeconds = 0, quality = 'auto') => {
      const sec = Math.floor(Math.max(0, startSeconds));
      const langCode = LANG_CODE_MAP[_lang] || _lang;
      const langParam = langCode && langCode !== 'all' ? `&lang=${langCode}&audio=${langCode}&ds_lang=${langCode}&dub=${langCode}` : '&lang=hi&audio=hi&ds_lang=hi';
      const qualParam = quality && quality !== 'auto' ? `&quality=${quality}` : '';
      const timeParam = sec > 0 ? `&start=${sec}&t=${sec}` : '';
      return isTv
        ? `https://bingr.one/watch/tv/${id}/${s}/${e}?autoplay=1${langParam}${qualParam}${timeParam}`
        : `https://bingr.one/watch/movie/${id}?autoplay=1${langParam}${qualParam}${timeParam}`;
    },
  },
  {
    id: 'autoembed',
    name: 'Server 6 (AutoEmbed CC)',
    badge: 'Global Cloud',
    category: 'global',
    syncRating: 'high',
    audioSupport: 'Worldwide auto-resolving stream nodes',
    getUrl: (id, isTv, s = 1, e = 1, _lang = 'global', startSeconds = 0, quality = 'auto') => {
      const sec = Math.floor(Math.max(0, startSeconds));
      const langCode = LANG_CODE_MAP[_lang] || _lang;
      const langParam = langCode && langCode !== 'all' ? `&lang=${langCode}&audio=${langCode}` : '';
      const qualParam = quality && quality !== 'auto' ? `&quality=${quality}` : '';
      const timeParam = sec > 0 ? `&start=${sec}&t=${sec}` : '';
      return isTv
        ? `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}?autoplay=1${langParam}${qualParam}${timeParam}`
        : `https://player.autoembed.cc/embed/movie/${id}?autoplay=1${langParam}${qualParam}${timeParam}`;
    },
  },
  {
    id: 'vidsrc_cc',
    name: 'Server 7 (VidSrc Pro)',
    badge: '4K Mirror',
    category: 'english',
    syncRating: 'high',
    audioSupport: '4K & 1080p ultra-high bitrate mirror',
    getUrl: (id, isTv, s = 1, e = 1, _lang = 'english', startSeconds = 0, quality = 'auto') => {
      const sec = Math.floor(Math.max(0, startSeconds));
      const langCode = LANG_CODE_MAP[_lang] || _lang;
      const langParam = langCode && langCode !== 'all' ? `&lang=${langCode}` : '';
      const qualParam = quality && quality !== 'auto' ? `&quality=${quality}` : '';
      const timeParam = sec > 0 ? `&start=${sec}&t=${sec}` : '';
      return isTv
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}?autoPlay=true${langParam}${qualParam}${timeParam}`
        : `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true${langParam}${qualParam}${timeParam}`;
    },
  },
  {
    id: 'vidstuck',
    name: 'Server 8 (VidStuck Ultra)',
    badge: 'Multi-CDN',
    category: 'global',
    syncRating: 'standard',
    audioSupport: 'High-speed mirror with multi-CDN backup',
    getUrl: (id, isTv, s = 1, e = 1, _lang = 'global', startSeconds = 0, quality = 'auto') => {
      const sec = Math.floor(Math.max(0, startSeconds));
      const langCode = LANG_CODE_MAP[_lang] || _lang;
      const langParam = langCode && langCode !== 'all' ? `&lang=${langCode}` : '';
      const qualParam = quality && quality !== 'auto' ? `&quality=${quality}` : '';
      const timeParam = sec > 0 ? `&start=${sec}&t=${sec}` : '';
      return isTv
        ? `https://vidstuck.cc/embed/tv/${id}/${s}/${e}?autoplay=1${langParam}${qualParam}${timeParam}`
        : `https://vidstuck.cc/embed/movie/${id}?autoplay=1${langParam}${qualParam}${timeParam}`;
    },
  },
];

/**
 * Get streaming embed player URL based on TMDB ID, selected server, audio language, start timestamp, and video quality
 */
export function getEmbedStreamUrl(
  tmdbId: number,
  type: 'movie' | 'tv' = 'movie',
  season = 1,
  episode = 1,
  serverId = 'vidfast',
  audioLang = 'multi',
  startSeconds = 0,
  quality = 'auto'
): string {
  const server = STREAM_SERVERS.find((s) => s.id === serverId) || STREAM_SERVERS[0];
  return server.getUrl(tmdbId, type === 'tv', season, episode, audioLang, startSeconds, quality);
}

// --------------------------------------------------------------------------
// CURATED SHOWCASE OF WORLD CINEMA (Default Fallback with Real Posters & Trailers)
// --------------------------------------------------------------------------
export const CURATED_GLOBAL_MOVIES: Movie[] = [
  {
    id: 'tmdb-m-157336',
    title: 'Interstellar',
    year: 2014,
    genre: 'Sci-Fi',
    rating: '8.7',
    duration: '2h 49m',
    description:
      'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    gradientFrom: '#0a101d',
    gradientTo: '#04060a',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rAiYTsqBkgnKVXrQxH04F7yV9hN.jpg',
    tmdbId: 157336,
    trailerKey: 'zSWdZVtXT7E',
    originCountry: 'USA',
  },
  {
    id: 'tmdb-m-496243',
    title: 'Parasite',
    year: 2019,
    genre: 'Thriller',
    rating: '8.5',
    duration: '2h 12m',
    description:
      'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    gradientFrom: '#151a14',
    gradientTo: '#080c07',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    tmdbId: 496243,
    trailerKey: '5xH0hhMBcGg',
    originCountry: 'KOREA',
  },
  {
    id: 'tmdb-m-579974',
    title: 'RRR',
    year: 2022,
    genre: 'Action',
    rating: '8.1',
    duration: '3h 07m',
    description:
      'A fictional history of two legendary revolutionaries\' journey away from home before they began fighting for their country in the 1920s.',
    gradientFrom: '#241408',
    gradientTo: '#0c0703',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kdO19T546m4fG8aVqgG5X7Hh1qB.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8O4w7Fj5Gv3zFm9u2z8rYw4aZqI.jpg',
    tmdbId: 579974,
    trailerKey: 'f_vbAtFSEc0',
    originCountry: 'INDIA',
  },
  {
    id: 'tmdb-m-372058',
    title: 'Your Name (Kimi no Na wa)',
    year: 2016,
    genre: 'Animation',
    rating: '8.5',
    duration: '1h 46m',
    description:
      'High schoolers Mitsuha and Taki are complete strangers living separate lives in Tokyo and the rural mountains. But when they begin swapping bodies, a profound connection forms across space and time.',
    gradientFrom: '#101626',
    gradientTo: '#070a12',
    posterUrl: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6qFsRwaqAYmy.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/dIWwZW7dJJNCiNp6EN5vFe0jTKG.jpg',
    tmdbId: 372058,
    trailerKey: 'xU47nhruN-Q',
    originCountry: 'JAPAN',
  },
  {
    id: 'tmdb-m-693134',
    title: 'Dune: Part Two',
    year: 2024,
    genre: 'Sci-Fi',
    rating: '8.5',
    duration: '2h 46m',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    gradientFrom: '#1f150a',
    gradientTo: '#0e0904',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg',
    tmdbId: 693134,
    trailerKey: 'Way9Dexny3w',
    originCountry: 'USA',
  },
  {
    id: 'tmdb-m-872585',
    title: 'Oppenheimer',
    year: 2023,
    genre: 'Drama',
    rating: '8.9',
    duration: '3h 01m',
    description:
      'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II.',
    gradientFrom: '#1f1008',
    gradientTo: '#0c0703',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveGHudvK0zgj9d.jpg',
    tmdbId: 872585,
    trailerKey: 'uYPbbksJxIg',
    originCountry: 'USA',
  },
  {
    id: 'tmdb-m-27205',
    title: 'Inception',
    year: 2010,
    genre: 'Action',
    rating: '8.8',
    duration: '2h 28m',
    description:
      'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.',
    gradientFrom: '#121922',
    gradientTo: '#070b10',
    posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    tmdbId: 27205,
    trailerKey: 'YoHD9XEInc0',
    originCountry: 'USA',
  },
  {
    id: 'tmdb-m-129',
    title: 'Spirited Away',
    year: 2001,
    genre: 'Animation',
    rating: '8.6',
    duration: '2h 05m',
    description:
      'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
    gradientFrom: '#171120',
    gradientTo: '#09070d',
    posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    tmdbId: 129,
    trailerKey: 'ByXuk9QqQkk',
    originCountry: 'JAPAN',
  },
  {
    id: 'tmdb-m-238',
    title: 'The Godfather',
    year: 1972,
    genre: 'Crime',
    rating: '9.2',
    duration: '2h 55m',
    description:
      'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son steps in.',
    gradientFrom: '#1e140a',
    gradientTo: '#0d0803',
    posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tmU7GeKVybMWF92GImsGZxwAhAp.jpg',
    tmdbId: 238,
    trailerKey: 'UaVTIH8mujA',
    originCountry: 'USA',
  },
  {
    id: 'tmdb-m-155',
    title: 'The Dark Knight',
    year: 2008,
    genre: 'Action',
    rating: '9.1',
    duration: '2h 32m',
    description:
      'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    gradientFrom: '#0e151f',
    gradientTo: '#06090e',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    tmdbId: 155,
    trailerKey: 'EXeTwQWrcwY',
    originCountry: 'USA',
  },
];

export const CURATED_GLOBAL_SERIES: Series[] = [
  {
    id: 'tmdb-tv-66732',
    title: 'Stranger Things',
    year: 2016,
    genre: 'Sci-Fi & Fantasy',
    rating: '8.7',
    seasons: 4,
    episodes: 34,
    description:
      'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    gradientFrom: '#1b0914',
    gradientTo: '#0a0307',
    posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    tmdbId: 66732,
    trailerKey: 'b9EkMc79ZSU',
    originCountry: 'USA',
  },
  {
    id: 'tmdb-tv-93405',
    title: 'Squid Game',
    year: 2021,
    genre: 'Action & Adventure',
    rating: '8.0',
    seasons: 2,
    episodes: 16,
    description:
      'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games. Inside, a tempting prize awaits with deadly high stakes.',
    gradientFrom: '#240d16',
    gradientTo: '#0c0407',
    posterUrl: 'https://image.tmdb.org/t/p/w500/dDlG1T6z7T7p0c5H2Z1E7Jb9aFz.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/2meX1nMdScFOoV4370rqHWFDxZq.jpg',
    tmdbId: 93405,
    trailerKey: 'oqxAJKy0ii4',
    originCountry: 'KOREA',
  },
  {
    id: 'tmdb-tv-1399',
    title: 'Game of Thrones',
    year: 2011,
    genre: 'Sci-Fi & Fantasy',
    rating: '9.2',
    seasons: 8,
    episodes: 73,
    description:
      'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war while a very ancient evil awakens.',
    gradientFrom: '#151318',
    gradientTo: '#08070a',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    tmdbId: 1399,
    trailerKey: 'KPLWWIOCOOQ',
    originCountry: 'USA',
  },
  {
    id: 'tmdb-tv-94605',
    title: 'Arcane',
    year: 2021,
    genre: 'Animation',
    rating: '9.0',
    seasons: 2,
    episodes: 18,
    description:
      'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.',
    gradientFrom: '#141424',
    gradientTo: '#07070f',
    posterUrl: 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rkB4LyZHo1NHXSTXYuhTGIIWWgp.jpg',
    tmdbId: 94605,
    trailerKey: 'fXmAurh012s',
    originCountry: 'USA',
  },
  {
    id: 'tmdb-tv-71446',
    title: 'Money Heist (La Casa de Papel)',
    year: 2017,
    genre: 'Crime',
    rating: '8.2',
    seasons: 5,
    episodes: 41,
    description:
      'To carry out the biggest heist in history, a mysterious man called The Professor recruits a band of eight robbers who have a single characteristic: none of them has anything to lose.',
    gradientFrom: '#22080a',
    gradientTo: '#0e0304',
    posterUrl: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbk5rSXGno05Y8g2.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/gFZri2YbFUReUE6ZcfKcXZ6ZESj.jpg',
    tmdbId: 71446,
    trailerKey: 'htqXL94Rza4',
    originCountry: 'SPAIN',
  },
  {
    id: 'tmdb-tv-1429',
    title: 'Attack on Titan (Shingeki no Kyojin)',
    year: 2013,
    genre: 'Animation',
    rating: '9.1',
    seasons: 4,
    episodes: 88,
    description:
      'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.',
    gradientFrom: '#1a1410',
    gradientTo: '#090705',
    posterUrl: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/v5C7RkFk4W6w3N4oZcWnQ5e0v4Q.jpg',
    tmdbId: 1429,
    trailerKey: 'MGRm4IzK1SQ',
    originCountry: 'JAPAN',
  },
  {
    id: 'tmdb-tv-87108',
    title: 'Chernobyl',
    year: 2019,
    genre: 'Drama',
    rating: '9.3',
    seasons: 1,
    episodes: 5,
    description:
      'The true story of one of the worst man-made catastrophes in history: the catastrophic nuclear plant explosion in Soviet Ukraine.',
    gradientFrom: '#151812',
    gradientTo: '#080a06',
    posterUrl: 'https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/uL6Ad12Fe4yg359BM40zy98Te7v.jpg',
    tmdbId: 87108,
    trailerKey: 's9APLXM9Ei8',
    originCountry: 'USA',
  },
  {
    id: 'tmdb-tv-100088',
    title: 'The Last of Us',
    year: 2023,
    genre: 'Drama',
    rating: '8.7',
    seasons: 1,
    episodes: 9,
    description:
      'Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.',
    gradientFrom: '#1c1810',
    gradientTo: '#0a0805',
    posterUrl: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqmi2bpK193u.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    tmdbId: 100088,
    trailerKey: 'uLtkt8BonwM',
    originCountry: 'USA',
  },
];
