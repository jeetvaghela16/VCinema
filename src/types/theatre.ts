import type { Movie } from './index';

export type TheatreFormat = 'private' | 'friends' | 'family' | 'open';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number; // in seconds
  duration: number; // in seconds
  lastUpdated: number; // epoch ms
  currentMovieId: string;
  currentMovieTitle: string;
}

export interface TheatreParticipant {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  isHost: boolean;
  isOnline: boolean;
  joinedAt: number;
  lastSeen: number;
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
  code: string; // 6-8 chars uppercase e.g. "VCX-4821"
  name: string;
  format: TheatreFormat;
  hostId: string;
  hostName: string;
  hostPhoto?: string | null;
  maxViewers: number;
  isPasswordProtected: boolean;
  password?: string;
  playback: PlaybackState;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  selectedMovie?: Movie;
}
