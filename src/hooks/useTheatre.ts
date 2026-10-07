import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeToTheatre,
  subscribeToParticipants,
  subscribeToMessages,
  updatePlayback,
  sendChatMessage,
  joinTheatreRoom,
  leaveTheatreRoom,
  updateParticipantHeartbeat,
} from '../services/theatreService';
import type {
  LiveTheatreRoom,
  TheatreParticipant,
  TheatreChatMessage,
} from '../types/theatre';
import { movies } from '../data/movies';

export function useTheatre(theatreId: string | undefined) {
  const { user } = useAuth();
  const [room, setRoom] = useState<LiveTheatreRoom | null>(null);
  const [participants, setParticipants] = useState<TheatreParticipant[]>([]);
  const [messages, setMessages] = useState<TheatreChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const roomRef = useRef<LiveTheatreRoom | null>(null);
  roomRef.current = room;

  // Check if current authenticated user is the auditorium host
  const isHost = useMemo(() => {
    if (!user || !room) return false;
    return user.uid === room.hostId;
  }, [user, room]);

  // Check if the host is currently connected and active
  const isHostOnline = useMemo(() => {
    if (!room) return false;
    const hostParticipant = participants.find((p) => p.uid === room.hostId);
    return hostParticipant ? hostParticipant.isOnline : false;
  }, [room, participants]);

  // Subscribe to room, participants, and chat
  useEffect(() => {
    if (!theatreId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 1. Join room presence if user is logged in
    if (user) {
      joinTheatreRoom(theatreId, user, false).catch((err) => {
        console.warn('Could not register room presence:', err);
      });
    }

    // 2. Subscribe to room state
    const unsubRoom = subscribeToTheatre(theatreId, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
      } else {
        setError('This auditorium does not exist or has been closed.');
      }
      setIsLoading(false);
    });

    // 3. Subscribe to active participants
    const unsubParticipants = subscribeToParticipants(theatreId, (list) => {
      setParticipants(list);
    });

    // 4. Subscribe to chat messages
    const unsubMessages = subscribeToMessages(theatreId, (chatList) => {
      setMessages(chatList);
    });

    // 5. Periodic presence heartbeat (every 25 seconds)
    let heartbeatInterval: NodeJS.Timeout | null = null;
    if (user) {
      heartbeatInterval = setInterval(() => {
        updateParticipantHeartbeat(theatreId, user.uid);
      }, 25000);
    }

    // 6. Beforeunload handler for clean departure on tab/browser close
    const handleBeforeUnload = () => {
      if (user && theatreId) {
        leaveTheatreRoom(theatreId, user.uid);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      unsubRoom();
      unsubParticipants();
      unsubMessages();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (user && theatreId) {
        leaveTheatreRoom(theatreId, user.uid);
      }
    };
  }, [theatreId, user]);

  // Playback Control: Play (with current elapsed position)
  const play = useCallback(
    async (currentPosition?: number) => {
      if (!theatreId || !isHost) return;
      const targetPos =
        currentPosition !== undefined
          ? currentPosition
          : roomRef.current?.playback?.currentTime ?? 0;

      await updatePlayback(theatreId, {
        isPlaying: true,
        currentTime: targetPos,
      });
    },
    [theatreId, isHost]
  );

  // Playback Control: Pause (saves exact elapsed position where host paused!)
  const pause = useCallback(
    async (currentPosition?: number) => {
      if (!theatreId || !isHost) return;
      const targetPos =
        currentPosition !== undefined
          ? currentPosition
          : roomRef.current?.playback?.currentTime ?? 0;

      await updatePlayback(theatreId, {
        isPlaying: false,
        currentTime: targetPos,
      });
    },
    [theatreId, isHost]
  );

  // Playback Control: Seek
  const seek = useCallback(
    async (seconds: number) => {
      if (!theatreId || !isHost) return;
      await updatePlayback(theatreId, {
        currentTime: Math.max(0, seconds),
      });
    },
    [theatreId, isHost]
  );

  // Change Movie
  const changeMovie = useCallback(
    async (movieId: string) => {
      if (!theatreId || !isHost) return;
      const movie = movies.find((m) => m.id === movieId);
      if (!movie) return;

      await updatePlayback(theatreId, {
        currentMovieId: movie.id,
        currentMovieTitle: movie.title,
        currentTime: 0,
        isPlaying: false,
      });
    },
    [theatreId, isHost]
  );

  // Send Chat Message
  const sendMessage = useCallback(
    async (text: string, currentPlaybackTime = 0) => {
      if (!theatreId || !user || !text.trim()) return;
      await sendChatMessage(theatreId, user, text, currentPlaybackTime);
    },
    [theatreId, user]
  );

  return {
    room,
    participants,
    messages,
    isLoading,
    error,
    isHost,
    isHostOnline,
    play,
    pause,
    seek,
    changeMovie,
    sendMessage,
  };
}
