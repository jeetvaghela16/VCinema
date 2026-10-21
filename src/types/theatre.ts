import type { Movie } from './index';

export type TheatreFormat = 'private' | 'friends' | 'family' | 'open';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number; // in seconds (elapsed position at lastUpdated)
  duration: number; // in seconds
  lastUpdated: number; // epoch ms when this state was written
  playbackRate: number; // e.g. 1.0 (default standard rate)
  version: number; // monotonic sequence counter to prevent race conditions
  currentMovieId: string;
  currentMovieTitle: string;
  currentMoviePoster?: string;
  currentMovieBackdrop?: string;
  currentMovieTrailerKey?: string;
  currentMovieVideoUrl?: string;
  mediaType?: 'artwork' | 'trailer' | 'video' | 'embed';
  tmdbId?: number;
  isTv?: boolean;
  season?: number;
  episode?: number;
  streamServerId?: string;
  audioLanguage?: string;
}

export interface TheatreParticipant {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  isHost: boolean;
  isOnline: boolean;
  joinedAt: number;
  lastSeen: number; // epoch ms for heartbeat & stale detection
  isKicked?: boolean; // Set by host to eject participant
  isMuted?: boolean; // Set by host to mute chat
}

export interface TheatreChatMessage {
  id: string;
  theatreId: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  message: string;
  timestamp: string; // Movie timecode e.g. "0:42:15"
  createdAt: number;
}

export interface LiveTheatreRoom {
  id: string;
  code: string; // e.g. "VCX-7K9M2Q" (normalized uppercase)
  name: string;
  format: TheatreFormat;
  hostId: string;
  hostName: string;
  hostPhoto?: string | null;
  maxViewers: number;
  isPasswordProtected: boolean;
  password?: string | null; // Legacy room compatibility only
  passwordHash?: string | null; // Salted SHA-256 hash for secure room entry without DevTools plaintext leak
  playback: PlaybackState;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  isEnded?: boolean; // True if host ended the screening
  endedReason?: string; // Reason displayed to guests
  isLocked?: boolean; // True if host locked room to prevent new entries
  selectedMovie?: Movie;
}
