import type { TheatreType } from '../types';

export const theatreTypes: TheatreType[] = [
  {
    id: 'private',
    label: 'Private Screen',
    description: 'Your personal screening room. Just you and whoever you choose to invite.',
    icon: '🎬',
    maxViewers: 2,
    accent: '#C6A76A',
  },
  {
    id: 'friends',
    label: 'Friends Night',
    description: 'The ultimate movie night. Host up to 10 friends with full chat and reactions.',
    icon: '🍿',
    maxViewers: 10,
    accent: '#A9A39A',
  },
  {
    id: 'family',
    label: 'Family Room',
    description: 'A warm, comfortable space for family viewing. Kid-friendly controls available.',
    icon: '🏡',
    maxViewers: 20,
    accent: '#8a7248',
  },
  {
    id: 'open',
    label: 'Open Screen',
    description: 'Open your theatre to anyone with the link. Perfect for community screenings.',
    icon: '🌐',
    maxViewers: 50,
    accent: '#6F2028',
  },
];

export const recentTheatres = [
  {
    id: 't1',
    name: "Neon's Watch Party",
    code: 'VCX-4821',
    type: 'friends' as const,
    hostName: 'Neon',
    participantCount: 4,
    maxParticipants: 10,
    currentMovie: 'Neon Requiem',
    isPasswordProtected: false,
  },
  {
    id: 't2',
    name: 'Friday Classics',
    code: 'VCX-1193',
    type: 'open' as const,
    hostName: 'Aria',
    participantCount: 12,
    maxParticipants: 50,
    currentMovie: 'Hollow Crown',
    isPasswordProtected: false,
  },
];
