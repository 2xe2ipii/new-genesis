import { useState } from 'react';
import { ref, set, update, onValue, get, remove, runTransaction } from 'firebase/database';
import { db } from '../services/firebase';
import type { Room, Player } from '../types';
import { generateRoomCode, getStoredPlayerId } from '../utils/helpers';
import { distributeGameRoles } from '../utils/gameLogic';

export const useGame = () => {
  const [gameState, setGameState] = useState<Room | null>(null);
  const [playerId] = useState<string>(getStoredPlayerId());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LISTENER ---
  const subscribeToRoom = (roomCode: string) => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase stores arrays as objects if keys are indices, or sometimes nulls.
        // Ensure arrays exist to prevent crashes
        if (!data.votesToSkipDiscussion) data.votesToSkipDiscussion = [];
        setGameState(data);
      } else {
        setGameState(null);
      }
    });
  };

  // --- ACTIONS ---

  const createRoom = async (playerName: string) => {
    setLoading(true);
    try {
      const roomCode = generateRoomCode();
      const newPlayer: Player = {
        id: playerId, name: playerName, isHost: true, isReady: false,
        role: null, secretWord: '', abilityCard: null, isCardUsed: false,
        votedFor: null, isVoteLocked: false, votesReceived: 0, isSilenced: false,
      };

      const newRoom: Room = {
        code: roomCode, hostId: playerId, players: { [playerId]: newPlayer },
        phase: 'LOBBY', timerEndTime: 0, majorityWord: '', impostorWord: '',
        votesToSkipDiscussion: [], winner: null,
      };

      await set(ref(db, `rooms/${roomCode}`), newRoom);
      subscribeToRoom(roomCode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomCode: string, playerName: string) => {
    setLoading(true);
    const code = roomCode.toUpperCase();
    try {
      const snapshot = await get(ref(db, `rooms/${code}`));
      if (!snapshot.exists()) throw new Error('Room not found');
      
      const roomData = snapshot.val();
      if (roomData.phase !== 'LOBBY' && !roomData.players[playerId]) {
        throw new Error('Game in progress');
      }

      const newPlayer: Player = {
        id: playerId, name: playerName, isHost: false, isReady: false,
        role: null, secretWord: '', abilityCard: null, isCardUsed: false,
        votedFor: null, isVoteLocked: false, votesReceived: 0, isSilenced: false,
      };

      await update(ref(db, `rooms/${code}/players/${playerId}`), newPlayer);
      subscribeToRoom(code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async () => {
    if (!gameState) return;
    await remove(ref(db, `rooms/${gameState.code}/players/${playerId}`));
    setGameState(null);
  };

  const toggleReady = async () => {
    if (!gameState) return;
    const player = gameState.players[playerId];
    await set(ref(db, `rooms/${gameState.code}/players/${playerId}/isReady`), !player.isReady);
  };

  const startGame = async () => {
    if (!gameState) return;
    setLoading(true);
    try {
      const { assignments, cardAssignments, majority, impostor } = distributeGameRoles(gameState.players);
      const updates: Record<string, any> = {};

      updates[`rooms/${gameState.code}/phase`] = 'DISCUSSION';
      updates[`rooms/${gameState.code}/timerEndTime`] = Date.now() + 10 * 60 * 1000; // 10 Mins
      updates[`rooms/${gameState.code}/majorityWord`] = majority;
      updates[`rooms/${gameState.code}/impostorWord`] = impostor;
      updates[`rooms/${gameState.code}/votesToSkipDiscussion`] = []; // Reset skips

      Object.keys(gameState.players).forEach(pid => {
        updates[`rooms/${gameState.code}/players/${pid}/role`] = assignments[pid].role;
        updates[`rooms/${gameState.code}/players/${pid}/secretWord`] = assignments[pid].word;
        updates[`rooms/${gameState.code}/players/${pid}/abilityCard`] = cardAssignments[pid];
        updates[`rooms/${gameState.code}/players/${pid}/isCardUsed`] = false;
        updates[`rooms/${gameState.code}/players/${pid}/isSilenced`] = false;
        updates[`rooms/${gameState.code}/players/${pid}/votesReceived`] = 0;
        updates[`rooms/${gameState.code}/players/${pid}/votedFor`] = null;
        updates[`rooms/${gameState.code}/players/${pid}/isVoteLocked`] = false;
      });

      await update(ref(db), updates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- CARD LOGIC ---
  const useCard = async (targetId: string): Promise<string> => {
    if (!gameState) return "";
    
    const myPlayer = gameState.players[playerId];
    const targetPlayer = gameState.players[targetId];
    if (!myPlayer.abilityCard || myPlayer.isCardUsed) return "";

    let resultMessage = "";

    // 1. Calculate Result locally
    if (myPlayer.abilityCard === 'RADAR') {
      const isThreat = ['SPY', 'TOURIST', 'JOKER'].includes(targetPlayer.role || '');
      resultMessage = isThreat ? `THREAT DETECTED: ${targetPlayer.name}` : `SAFE: ${targetPlayer.name} is a Local.`;
    } 
    else if (myPlayer.abilityCard === 'INTERCEPT') {
      const wordToReveal = myPlayer.role === 'SPY' ? gameState.majorityWord : gameState.impostorWord;
      resultMessage = `Intercepted Data: Starts with "${wordToReveal.charAt(0)}"`;
    }
    else if (myPlayer.abilityCard === 'SILENCER') {
      // FIX: Use 'set' instead of 'update' for boolean value
      await set(ref(db, `rooms/${gameState.code}/players/${targetId}/isSilenced`), true);
      resultMessage = `Silenced ${targetPlayer.name}. Their vote is now 0.`;
    }

    // 2. Mark Card as Used
    // FIX: Use 'set' instead of 'update' for boolean value
    await set(ref(db, `rooms/${gameState.code}/players/${playerId}/isCardUsed`), true);
    
    return resultMessage;
  };

  // --- SKIP LOGIC ---
  const voteToSkip = async () => {
    if (!gameState) return;
    
    const roomRef = ref(db, `rooms/${gameState.code}`);
    await runTransaction(roomRef, (currentRoom: Room) => {
      if (!currentRoom) return;
      if (!currentRoom.votesToSkipDiscussion) currentRoom.votesToSkipDiscussion = [];
      
      // Add me if not already in
      if (!currentRoom.votesToSkipDiscussion.includes(playerId)) {
        currentRoom.votesToSkipDiscussion.push(playerId);
      }

      // Check consensus
      const totalPlayers = Object.keys(currentRoom.players).length;
      if (currentRoom.votesToSkipDiscussion.length >= totalPlayers) {
        currentRoom.phase = 'VOTING';
      }
      
      return currentRoom;
    });
  };

  return {
    gameState, playerId, loading, error,
    createRoom, joinRoom, leaveRoom, toggleReady,
    startGame, useCard, voteToSkip
  };
};