export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string;
  rating: string;
  duration: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  progress?: number;
}

export interface Series {
  id: string;
  title: string;
  year: number;
  genre: string;
  rating: string;
  seasons: number;
  episodes: number;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface TheatreRoom {
  id: string;
  name: string;
  code: string;
  type: 'private' | 'friends' | 'family' | 'open';
  hostName: string;
  participantCount: number;
  maxParticipants: number;
  currentMovie?: string;
  isPasswordProtected: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isOnline: boolean;
}

export interface TheatreType {
  id: string;
  label: string;
  description: string;
  icon: string;
  maxViewers: number;
  accent: string;
}
