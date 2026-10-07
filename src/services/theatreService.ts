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
 * Character set avoiding ambiguous characters (0, O, 1, I)
 */
const CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates an uppercase 6-character room code in the format "VCX-XXXXXX"
 * Provides ~1.07 billion collision-resistant unique combinations.
 */
export function generateRoomCode(): string {
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARSET.length);
    result += CODE_CHARSET[randomIndex];
  }
  return `VCX-${result}`;
}

/**
 * Format seconds into a digital timestamp (e.g. 3674 -> "1:01:14" or 45 -> "0:45")
 */
export function formatTimecode(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safeSec / 3600);
  const m = Math.floor((safeSec % 3600) / 60);
  const s = safeSec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Calculates authoritative target position in seconds based on wall-clock elapsed time.
 * Synchronization Formula:
 * targetPosition = storedPosition + (now - lastUpdated) * playbackRate
 */
export function calculateAuthoritativePosition(playback: PlaybackState): number {
  if (!playback.isPlaying) {
    return Math.min(playback.currentTime, playback.duration);
  }
  const now = Date.now();
  const elapsedMs = Math.max(0, now - (playback.lastUpdated || now));
  const elapsedSeconds = elapsedMs / 1000;
  const rate = playback.playbackRate || 1.0;
  const calculated = playback.currentTime + elapsedSeconds * rate;
  return Math.min(calculated, playback.duration);
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
 * Creates a new Virtual Theatre room in Firestore with collision-checked room code
 */
export async function createTheatreRoom(
  params: CreateTheatreParams,
  host: AuthenticatedUser
): Promise<LiveTheatreRoom> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please add your credentials to .env.local.');
  }

  // Generate collision-resistant unique room code (retry up to 5 times)
  let roomCode = generateRoomCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await getTheatreByCode(roomCode);
    if (!existing) break;
    roomCode = generateRoomCode();
    attempts++;
  }

  const theatreRef = doc(collection(db, 'theatres'));
  const theatreId = theatreRef.id;
  const selectedMovie = movies.find((m) => m.id === params.movieId) ?? movies[0];

  // Default duration in seconds (2h 18m -> 8280s)
  const initialDuration = 8280;

  const initialPlayback: PlaybackState = {
    isPlaying: false,
    currentTime: 0,
    duration: initialDuration,
    lastUpdated: Date.now(),
    playbackRate: 1.0,
    version: 1,
    currentMovieId: selectedMovie.id,
    currentMovieTitle: selectedMovie.title,
  };

  const newRoom: LiveTheatreRoom = {
    id: theatreId,
    code: roomCode,
    name: params.name.trim().slice(0, 60) || 'Midnight Cinema 01',
    format: params.format,
    hostId: host.uid,
    hostName: (host.displayName || 'Cinema Host').slice(0, 50),
    hostPhoto: host.photoURL || null,
    maxViewers: params.maxViewers,
    isPasswordProtected: params.isPasswordProtected,
    password: params.isPasswordProtected ? params.password?.trim() : undefined,
    playback: initialPlayback,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true,
  };

  // 1. Create Room Document (Authenticated Host Only)
  await setDoc(theatreRef, newRoom);

  // 2. Register Host as the first Participant
  const hostParticipant: TheatreParticipant = {
    uid: host.uid,
    displayName: (host.displayName || 'Cinema Host').slice(0, 50),
    photoURL: host.photoURL || null,
    isHost: true,
    isOnline: true,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  };

  const hostDocRef = doc(db, 'theatres', theatreId, 'participants', host.uid);
  await setDoc(hostDocRef, hostParticipant);

  // 3. Post Initial System Message to Theatre Chat (Authenticated as host)
  const welcomeMessageRef = doc(collection(db, 'theatres', theatreId, 'messages'));
  await setDoc(welcomeMessageRef, {
    id: welcomeMessageRef.id,
    theatreId,
    userId: host.uid,
    userName: (host.displayName || 'Cinema Host').slice(0, 50),
    message: `Auditorium initialized. Host controls projection.`,
    timestamp: '0:00',
    createdAt: Date.now(),
  });

  return newRoom;
}

/**
 * Looks up a Theatre Room by room code (e.g. "VCX-7K9M2Q")
 */
export async function getTheatreByCode(code: string): Promise<LiveTheatreRoom | null> {
  if (!isFirebaseConfigured) return null;

  const cleanCode = code.trim().toUpperCase();
  const q = query(
    collection(db, 'theatres'),
    where('code', '==', cleanCode),
    where('isActive', '==', true)
  );
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
    displayName: (user.displayName || 'Cinema Viewer').slice(0, 50),
    photoURL: user.photoURL || null,
    isHost,
    isOnline: true,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  };

  await setDoc(participantRef, participantData, { merge: true });
}

/**
 * Heartbeat: Updates participant lastSeen timestamp to prevent stale online status
 */
export async function updateParticipantHeartbeat(
  theatreId: string,
  userId: string
): Promise<void> {
  if (!isFirebaseConfigured) return;

  try {
    const participantRef = doc(db, 'theatres', theatreId, 'participants', userId);
    await updateDoc(participantRef, {
      lastSeen: Date.now(),
      isOnline: true,
    });
  } catch {
    // Gracefully handle if user already left
  }
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
 * Filters out stale participants whose last heartbeat was > 60 seconds ago
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
    const now = Date.now();
    const staleThresholdMs = 60000; // 60 seconds

    const list: TheatreParticipant[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as TheatreParticipant;
      const isHeartbeatFresh = now - (data.lastSeen || 0) < staleThresholdMs;
      const isActuallyOnline = data.isOnline && isHeartbeatFresh;

      list.push({
        ...data,
        isOnline: isActuallyOnline,
      });
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
 * Increments monotonic version number to order state updates.
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
  const nextVersion = (currentPlayback.version || 0) + 1;

  const updated: PlaybackState = {
    ...currentPlayback,
    ...partialPlayback,
    version: nextVersion,
    lastUpdated: Date.now(),
  };

  await updateDoc(roomDocRef, {
    playback: updated,
    updatedAt: Date.now(),
  });
}

/**
 * Sends a real-time message to theatre chat
 * Validates message size (1-300 chars) before writing.
 */
export async function sendChatMessage(
  theatreId: string,
  user: AuthenticatedUser,
  message: string,
  currentTime = 0
): Promise<void> {
  const trimmed = message.trim().slice(0, 300);
  if (!isFirebaseConfigured || !trimmed) return;

  const msgRef = doc(collection(db, 'theatres', theatreId, 'messages'));
  const newMsg: TheatreChatMessage = {
    id: msgRef.id,
    theatreId,
    userId: user.uid,
    userName: (user.displayName || 'Cinema Viewer').slice(0, 50),
    userPhoto: user.photoURL || null,
    message: trimmed,
    timestamp: formatTimecode(currentTime),
    createdAt: Date.now(),
  };

  await setDoc(msgRef, newMsg);
}
