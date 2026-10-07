import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase/config';
import { movies } from '../data/movies';
import type {
  LiveTheatreRoom,
  TheatreParticipant,
  TheatreChatMessage,
  PlaybackState,
  TheatreFormat,
} from '../types/theatre';
import type { AuthenticatedUser } from '../types/auth';

/**
 * Generates an uppercase 6-character room code in the format "VCX-####"
 */
export function generateRoomCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `VCX-${digits}`;
}

/**
 * Format seconds into a digital timestamp (e.g. 3674 -> "1:01:14" or "0:45:10")
 */
export function formatTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export interface CreateTheatreParams {
  name: string;
  format: TheatreFormat;
  maxViewers: number;
  movieId: string;
  isPasswordProtected: boolean;
  password?: string;
}

/**
 * Creates a new Virtual Theatre room in Firestore
 */
export async function createTheatreRoom(
  params: CreateTheatreParams,
  host: AuthenticatedUser
): Promise<LiveTheatreRoom> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please add your credentials to .env.local.');
  }

  const theatreRef = doc(collection(db, 'theatres'));
  const theatreId = theatreRef.id;
  const roomCode = generateRoomCode();
  const selectedMovie = movies.find((m) => m.id === params.movieId) ?? movies[0];

  // Default duration of movie parsed from e.g. "2h 18m" -> 8280 seconds
  const initialDuration = 8280;

  const initialPlayback: PlaybackState = {
    isPlaying: false,
    currentTime: 0,
    duration: initialDuration,
    lastUpdated: Date.now(),
    currentMovieId: selectedMovie.id,
    currentMovieTitle: selectedMovie.title,
  };

  const newRoom: LiveTheatreRoom = {
    id: theatreId,
    code: roomCode,
    name: params.name.trim() || 'Midnight Cinema 01',
    format: params.format,
    hostId: host.uid,
    hostName: host.displayName || 'Cinema Host',
    hostPhoto: host.photoURL || null,
    maxViewers: params.maxViewers,
    isPasswordProtected: params.isPasswordProtected,
    password: params.isPasswordProtected ? params.password?.trim() : undefined,
    playback: initialPlayback,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true,
  };

  // 1. Create Room Document
  await setDoc(theatreRef, newRoom);

  // 2. Register Host as the first Participant
  const hostParticipant: TheatreParticipant = {
    uid: host.uid,
    displayName: host.displayName || 'Cinema Host',
    photoURL: host.photoURL || null,
    isHost: true,
    isOnline: true,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  };

  const hostDocRef = doc(db, 'theatres', theatreId, 'participants', host.uid);
  await setDoc(hostDocRef, hostParticipant);

  // 3. Post a Welcome System Message to Theatre Chat
  const welcomeMessageRef = doc(collection(db, 'theatres', theatreId, 'messages'));
  await setDoc(welcomeMessageRef, {
    id: welcomeMessageRef.id,
    theatreId,
    userId: 'system',
    userName: 'VCinema Concierge',
    message: `Auditorium "${newRoom.name}" opened. Host ${newRoom.hostName} controls projection.`,
    timestamp: '0:00',
    createdAt: Date.now(),
  });

  return newRoom;
}

/**
 * Looks up a Theatre Room by room code (e.g. "VCX-4821")
 */
export async function getTheatreByCode(code: string): Promise<LiveTheatreRoom | null> {
  if (!isFirebaseConfigured) return null;

  const cleanCode = code.trim().toUpperCase();
  const q = query(collection(db, 'theatres'), where('code', '==', cleanCode), where('isActive', '==', true));
  const snap = await getDocs(q);

  if (snap.empty) {
    return null;
  }

  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as LiveTheatreRoom;
}

/**
 * Fetches a Theatre Room by its ID
 */
export async function getTheatreById(theatreId: string): Promise<LiveTheatreRoom | null> {
  if (!isFirebaseConfigured) return null;

  const docSnap = await getDoc(doc(db, 'theatres', theatreId));
  if (!docSnap.exists()) return null;

  return { id: docSnap.id, ...docSnap.data() } as LiveTheatreRoom;
}

/**
 * Adds or updates a participant in the theatre room
 */
export async function joinTheatreRoom(
  theatreId: string,
  user: AuthenticatedUser,
  isHost = false
): Promise<void> {
  if (!isFirebaseConfigured) return;

  const participantRef = doc(db, 'theatres', theatreId, 'participants', user.uid);
  const participantData: TheatreParticipant = {
    uid: user.uid,
    displayName: user.displayName || 'Cinema Viewer',
    photoURL: user.photoURL || null,
    isHost,
    isOnline: true,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  };

  await setDoc(participantRef, participantData, { merge: true });
}

/**
 * Removes or updates participant presence when leaving
 */
export async function leaveTheatreRoom(theatreId: string, userId: string): Promise<void> {
  if (!isFirebaseConfigured) return;

  try {
    const participantRef = doc(db, 'theatres', theatreId, 'participants', userId);
    await updateDoc(participantRef, {
      isOnline: false,
      lastSeen: Date.now(),
    });
  } catch {
    // Graceful exit even if doc already removed
  }
}

/**
 * Subscribes to real-time updates of the Theatre Room state
 */
export function subscribeToTheatre(
  theatreId: string,
  onUpdate: (room: LiveTheatreRoom | null) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    onUpdate(null);
    return () => {};
  }

  const roomDocRef = doc(db, 'theatres', theatreId);
  return onSnapshot(roomDocRef, (snap) => {
    if (snap.exists()) {
      onUpdate({ id: snap.id, ...snap.data() } as LiveTheatreRoom);
    } else {
      onUpdate(null);
    }
  });
}

/**
 * Subscribes to real-time active participants in the auditorium
 */
export function subscribeToParticipants(
  theatreId: string,
  onUpdate: (participants: TheatreParticipant[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    onUpdate([]);
    return () => {};
  }

  const colRef = collection(db, 'theatres', theatreId, 'participants');
  return onSnapshot(colRef, (snap) => {
    const list: TheatreParticipant[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as TheatreParticipant);
    });
    // Sort hosts first, then alphabetical
    list.sort((a, b) => {
      if (a.isHost === b.isHost) return a.displayName.localeCompare(b.displayName);
      return a.isHost ? -1 : 1;
    });
    onUpdate(list);
  });
}

/**
 * Subscribes to real-time theatre live chat messages
 */
export function subscribeToMessages(
  theatreId: string,
  onUpdate: (messages: TheatreChatMessage[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    onUpdate([]);
    return () => {};
  }

  const colRef = collection(db, 'theatres', theatreId, 'messages');
  const q = query(colRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snap) => {
    const msgs: TheatreChatMessage[] = [];
    snap.forEach((docSnap) => {
      msgs.push(docSnap.data() as TheatreChatMessage);
    });
    onUpdate(msgs);
  });
}

/**
 * Host updates playback state (play, pause, seek, movie change)
 */
export async function updatePlayback(
  theatreId: string,
  partialPlayback: Partial<PlaybackState>
): Promise<void> {
  if (!isFirebaseConfigured) return;

  const roomDocRef = doc(db, 'theatres', theatreId);
  const docSnap = await getDoc(roomDocRef);
  if (!docSnap.exists()) return;

  const currentPlayback = docSnap.data().playback as PlaybackState;
  const updated: PlaybackState = {
    ...currentPlayback,
    ...partialPlayback,
    lastUpdated: Date.now(),
  };

  await updateDoc(roomDocRef, {
    playback: updated,
    updatedAt: Date.now(),
  });
}

/**
 * Sends a real-time message to theatre chat
 */
export async function sendChatMessage(
  theatreId: string,
  user: AuthenticatedUser,
  message: string,
  currentTime = 0
): Promise<void> {
  if (!isFirebaseConfigured || !message.trim()) return;

  const msgRef = doc(collection(db, 'theatres', theatreId, 'messages'));
  const newMsg: TheatreChatMessage = {
    id: msgRef.id,
    theatreId,
    userId: user.uid,
    userName: user.displayName || 'Cinema Viewer',
    userPhoto: user.photoURL || null,
    message: message.trim(),
    timestamp: formatTimecode(currentTime),
    createdAt: Date.now(),
  };

  await setDoc(msgRef, newMsg);
}
