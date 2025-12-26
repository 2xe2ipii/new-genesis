import { useState, useEffect, useCallback } from 'react';
import { ref, set, update, onValue, get, child, remove } from 'firebase/database';
import { db } from '../services/firebase';
import type { Room, Player, GamePhase, PlayerRole } from '../types';
import { generateRoomCode, getStoredPlayerId } from '../utils/helpers';

export const useGame = () => {
  const [gameState, setGameState] = useState<Room | null>(null);
  const [playerId] = useState<string>(getStoredPlayerId());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1. LISTENER ---
  // Automatically syncs local state whenever Firebase changes
  useEffect(() => {
    // If we are in a room (we know this if gameState.code exists), subscribe to it.
    // However, usually we store the 'active room code' in local state or URL.
    // For this simple version, we'll rely on the component telling us which room to listen to 
    // OR we track it internally if we successfully joined.
    
    // (Note: To keep this hook clean, we will only subscribe if we have a valid room code.
    // We will implement the subscription inside the join/create logic mostly, or use a separate effect
    // if we persist roomCode in localStorage. For now, let's stick to session-based.)
  }, []);

  // --- 2. ACTIONS ---

  const createRoom = async (playerName: string) => {
    setLoading(true);
    setError(null);
    try {
      const roomCode = generateRoomCode();
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        isHost: true,
        isReady: false,
        role: null,
        secretWord: '',
        abilityCard: null,
        isCardUsed: false,
        votedFor: null,
        isVoteLocked: false,
        votesReceived: 0,
        isSilenced: false,
      };

      const newRoom: Room = {
        code: roomCode,
        hostId: playerId,
        players: { [playerId]: newPlayer },
        phase: 'LOBBY',
        timerEndTime: 0,
        majorityWord: '',
        impostorWord: '',
        votesToSkipDiscussion: [],
        winner: null,
      };

      // Write to Firebase
      await set(ref(db, `rooms/${roomCode}`), newRoom);
      
      // Subscribe to changes
      subscribeToRoom(roomCode);
    } catch (err) {
      setError('Failed to create room');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomCode: string, playerName: string) => {
    setLoading(true);
    setError(null);
    const code = roomCode.toUpperCase();

    try {
      const roomRef = ref(db, `rooms/${code}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        throw new Error('Room not found');
      }

      const roomData = snapshot.val() as Room;

      if (roomData.phase !== 'LOBBY') {
        // Optional: Allow rejoin if ID matches, otherwise block
        if (!roomData.players[playerId]) {
          throw new Error('Game already in progress');
        }
      }

      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        isHost: false, // Default false, unless they are rejoining and were host
        isReady: false,
        role: null,
        secretWord: '',
        abilityCard: null,
        isCardUsed: false,
        votedFor: null,
        isVoteLocked: false,
        votesReceived: 0,
        isSilenced: false,
      };

      // Update Firebase with new player
      await update(ref(db, `rooms/${code}/players/${playerId}`), newPlayer);
      
      subscribeToRoom(code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to start listening to Firebase
  const subscribeToRoom = (roomCode: string) => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
      } else {
        setGameState(null); // Room deleted
      }
    });
  };

  const leaveRoom = async () => {
    if (!gameState) return;
    const roomRef = ref(db, `rooms/${gameState.code}/players/${playerId}`);
    await remove(roomRef);
    setGameState(null);
  };

  const toggleReady = async () => {
    if (!gameState) return;
    const playerRef = ref(db, `rooms/${gameState.code}/players/${playerId}/isReady`);
    // Toggle current ready state
    const me = gameState.players[playerId];
    await set(playerRef, !me.isReady);
  };

  return {
    gameState,
    playerId,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    // We will add more specific game actions (vote, start game) in the next phase
  };
};