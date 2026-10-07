import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeToTheatre,
  subscribeToParticipants,
  subscribeToMessages,
  updatePlayback,
  sendChatMessage,
  joinTheatreRoom,
  leaveTheatreRoom,
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

  // Check if current authenticated user is the auditorium host
  const isHost = useMemo(() => {
    if (!user || !room) return false;
    return user.uid === room.hostId;
  }, [user, room]);

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
        console.warn('Could not join room presence:', err);
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

    // Cleanup on unmount
    return () => {
      unsubRoom();
      unsubParticipants();
      unsubMessages();
      if (user && theatreId) {
        leaveTheatreRoom(theatreId, user.uid);
      }
    };
  }, [theatreId, user]);

  // Playback Control: Play
  const play = useCallback(async () => {
    if (!theatreId || !isHost) return;
    await updatePlayback(theatreId, { isPlaying: true });
  }, [theatreId, isHost]);

  // Playback Control: Pause
  const pause = useCallback(async () => {
    if (!theatreId || !isHost) return;
    await updatePlayback(theatreId, { isPlaying: false });
  }, [theatreId, isHost]);

  // Playback Control: Seek
  const seek = useCallback(
    async (seconds: number) => {
      if (!theatreId || !isHost) return;
      await updatePlayback(theatreId, { currentTime: Math.max(0, seconds) });
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
    async (text: string) => {
      if (!theatreId || !user || !text.trim()) return;
      const currentPlaybackTime = room?.playback?.currentTime ?? 0;
      await sendChatMessage(theatreId, user, text, currentPlaybackTime);
    },
    [theatreId, user, room]
  );

  return {
    room,
    participants,
    messages,
    isLoading,
    error,
    isHost,
    play,
    pause,
    seek,
    changeMovie,
    sendMessage,
  };
}
