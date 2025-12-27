// src/hooks/useGame.ts
import { useState } from 'react';
import { ref, set, update, onValue, get, remove, runTransaction, push } from 'firebase/database';
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
        cardTargetId: null,
        votedFor: null, isVoteLocked: false, votesReceived: 0, isSilenced: false,
        isScrambled: false, isEliminated: false
      };

      const newRoom: Room = {
        code: roomCode, hostId: playerId, players: { [playerId]: newPlayer },
        phase: 'LOBBY', timerEndTime: 0, majorityWord: '', impostorWord: '',
        votesToSkipDiscussion: [], winner: null, round: 1
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
      if (!snapshot.exists()) throw new Error('404 Not Found');

      const roomData = snapshot.val();
      if (roomData.phase !== 'LOBBY' && !roomData.players[playerId]) {
        throw new Error('Game in progress');
      }

      const newPlayer: Player = {
        id: playerId, name: playerName, isHost: false, isReady: false,
        role: null, secretWord: '', abilityCard: null, isCardUsed: false,
        cardTargetId: null,
        votedFor: null, isVoteLocked: false, votesReceived: 0, isSilenced: false,
        isScrambled: false, isEliminated: false
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
      updates[`rooms/${gameState.code}/round`] = 1;
      updates[`rooms/${gameState.code}/winner`] = null;
      // FIX: Set timer to 7 minutes (7 * 60 * 1000)
      updates[`rooms/${gameState.code}/timerEndTime`] = Date.now() + 7 * 60 * 1000;
      updates[`rooms/${gameState.code}/majorityWord`] = majority;
      updates[`rooms/${gameState.code}/impostorWord`] = impostor;
      updates[`rooms/${gameState.code}/votesToSkipDiscussion`] = [];
      updates[`rooms/${gameState.code}/systemMessages`] = null;

      Object.keys(gameState.players).forEach(pid => {
        updates[`rooms/${gameState.code}/players/${pid}/role`] = assignments[pid].role;
        updates[`rooms/${gameState.code}/players/${pid}/secretWord`] = assignments[pid].word;
        updates[`rooms/${gameState.code}/players/${pid}/abilityCard`] = cardAssignments[pid];
        updates[`rooms/${gameState.code}/players/${pid}/isCardUsed`] = false;
        updates[`rooms/${gameState.code}/players/${pid}/cardTargetId`] = null;
        updates[`rooms/${gameState.code}/players/${pid}/isSilenced`] = false;
        updates[`rooms/${gameState.code}/players/${pid}/isScrambled`] = false;
        updates[`rooms/${gameState.code}/players/${pid}/votesReceived`] = 0;
        updates[`rooms/${gameState.code}/players/${pid}/votedFor`] = null;
        updates[`rooms/${gameState.code}/players/${pid}/isVoteLocked`] = false;
        updates[`rooms/${gameState.code}/players/${pid}/isEliminated`] = false;
      });

      await update(ref(db), updates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- CARD LOGIC ---
  const useCard = async (targetId: string): Promise<void> => {
    if (!gameState) return;
    const myPlayer = gameState.players[playerId];
    if (!myPlayer.abilityCard || myPlayer.isCardUsed || myPlayer.isEliminated) return;

    const updates: Record<string, any> = {};
    updates[`rooms/${gameState.code}/players/${playerId}/isCardUsed`] = true;
    updates[`rooms/${gameState.code}/players/${playerId}/cardTargetId`] = targetId;

    const targetPlayer = gameState.players[targetId];

    if (myPlayer.abilityCard === 'RADAR') {
      const isActuallyThreat = ['SPY', 'TOURIST', 'JOKER'].includes(targetPlayer.role || '');
      // @ts-ignore
      const isScrambled = targetPlayer.isScrambled === true;
      const finalResultIsThreat = isScrambled ? !isActuallyThreat : isActuallyThreat;
      const resultText = finalResultIsThreat ? `THREAT` : `SAFE`;

      if (isScrambled) updates[`rooms/${gameState.code}/players/${targetId}/isScrambled`] = false;

      const msgRef = push(ref(db, `rooms/${gameState.code}/systemMessages`));
      updates[`rooms/${gameState.code}/systemMessages/${msgRef.key}`] = {
        type: 'RADAR_RESULT',
        text: `SCAN RESULT: ${targetPlayer.name} is confirmed ${resultText}.`,
        targetId: targetId, timestamp: Date.now()
      };
    }
    else if (myPlayer.abilityCard === 'SILENCER') {
      updates[`rooms/${gameState.code}/players/${targetId}/isSilenced`] = true;
    }
    else if (myPlayer.abilityCard === 'SPOOF') {
      updates[`rooms/${gameState.code}/players/${targetId}/isScrambled`] = true;
    }

    await update(ref(db), updates);
  };

  // --- SKIP LOGIC ---
  const voteToSkip = async () => {
    if (!gameState) return;
    const roomRef = ref(db, `rooms/${gameState.code}`);
    await runTransaction(roomRef, (currentRoom: Room) => {
      if (!currentRoom) return;
      if (!currentRoom.votesToSkipDiscussion) currentRoom.votesToSkipDiscussion = [];
      const idx = currentRoom.votesToSkipDiscussion.indexOf(playerId);
      if (idx !== -1) currentRoom.votesToSkipDiscussion.splice(idx, 1);
      else currentRoom.votesToSkipDiscussion.push(playerId);

      const activePlayers = Object.values(currentRoom.players).filter(p => !p.isEliminated).length;
      if (currentRoom.votesToSkipDiscussion.length >= activePlayers) {
        currentRoom.phase = 'VOTING';
      }
      return currentRoom;
    });
  };

  const castVote = async (targetId: string) => {
    if (!gameState) return;
    const myPlayer = gameState.players[playerId];
    if (myPlayer.isEliminated) return;

    const updates: Record<string, any> = {};
    updates[`rooms/${gameState.code}/players/${playerId}/votedFor`] = targetId;
    updates[`rooms/${gameState.code}/players/${playerId}/isVoteLocked`] = true;

    await update(ref(db), updates);
  };

  const checkVotingComplete = async () => {
    if (!gameState || !gameState.players[playerId].isHost) return;

    const players = Object.values(gameState.players);
    const activePlayers = players.filter(p => !p.isEliminated);
    const totalVotes = activePlayers.filter(p => p.isVoteLocked).length;

    if (totalVotes === activePlayers.length && gameState.phase === 'VOTING') {
      await set(ref(db, `rooms/${gameState.code}/phase`), 'SUSPENSE');
      setTimeout(() => calculateResults(), 3000);
    }
  };

  const calculateResults = async () => {
    if (!gameState) return;

    const players = Object.values(gameState.players);
    const votes: Record<string, number> = {};

    players.forEach(voter => {
      if (voter.votedFor && !voter.isSilenced && !voter.isEliminated) {
        votes[voter.votedFor] = (votes[voter.votedFor] || 0) + 1;
      }
    });

    let maxVotes = 0;
    let mostVotedPlayerId: string | null = null;

    Object.entries(votes).forEach(([pid, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedPlayerId = pid;
      } else if (count === maxVotes) {
        mostVotedPlayerId = null;
      }
    });

    let winner: 'LOCALS' | 'SPY' | 'JOKER' | null = null;
    const currentRound = gameState.round || 1;

    if (mostVotedPlayerId) {
      const victim = gameState.players[mostVotedPlayerId];

      if (victim.role === 'SPY') winner = 'LOCALS';
      else if (victim.role === 'JOKER') winner = 'JOKER'; // Joker only wins if strictly the top vote (no tie)
      else {
        // Innocent ejected
        if (currentRound === 1) winner = null; // Game continues
        else winner = 'SPY'; // Locals lose on Round 2
      }
    } else {
      // TIE SCENARIO
      if (currentRound === 1) {
        winner = null; // No one dies, proceed to Round 2
      } else {
        // Final Round Tie -> Spy survives -> Spy Wins
        winner = 'SPY'; 
      }
    }

    const updates: Record<string, any> = {};
    updates[`rooms/${gameState.code}/phase`] = 'RESULTS';
    if (winner) {
      updates[`rooms/${gameState.code}/winner`] = winner;
    } else {
      if (mostVotedPlayerId) {
        updates[`rooms/${gameState.code}/players/${mostVotedPlayerId}/isEliminated`] = true;
      }
    }

    await update(ref(db), updates);
  };

  // --- NEW ACTION: PROCEED TO ROUND 2 ---
  const startNextRound = async () => {
    if (!gameState) return;
    const updates: Record<string, any> = {};

    updates[`rooms/${gameState.code}/phase`] = 'DISCUSSION';
    updates[`rooms/${gameState.code}/round`] = 2;
    updates[`rooms/${gameState.code}/votesToSkipDiscussion`] = [];
    // FIX: Set timer to 7 minutes for round 2 as well
    updates[`rooms/${gameState.code}/timerEndTime`] = Date.now() + 7 * 60 * 1000;

    Object.keys(gameState.players).forEach(pid => {
      updates[`rooms/${gameState.code}/players/${pid}/votedFor`] = null;
      updates[`rooms/${gameState.code}/players/${pid}/isVoteLocked`] = false;
      updates[`rooms/${gameState.code}/players/${pid}/votesReceived`] = 0;
    });

    await update(ref(db), updates);
  };

  // --- NEW: Force Voting Phase (when timer expires) ---
  const forceVotingPhase = async () => {
    if (!gameState) return;
    // Only update if we are still in discussion
    if (gameState.phase === 'DISCUSSION') {
      await set(ref(db, `rooms/${gameState.code}/phase`), 'VOTING');
    }
  };

  const returnToLobby = async () => {
    // FIX: If already in Lobby, don't reset everyone's state again.
    if (!gameState || gameState.phase === 'LOBBY') return;
    const updates: Record<string, any> = {};
    updates[`rooms/${gameState.code}/phase`] = 'LOBBY';
    updates[`rooms/${gameState.code}/winner`] = null;
    updates[`rooms/${gameState.code}/votesToSkipDiscussion`] = [];
    updates[`rooms/${gameState.code}/systemMessages`] = null;
    updates[`rooms/${gameState.code}/round`] = 1;

    Object.keys(gameState.players).forEach(pid => {
      updates[`rooms/${gameState.code}/players/${pid}/isReady`] = false;
      updates[`rooms/${gameState.code}/players/${pid}/role`] = null;
      updates[`rooms/${gameState.code}/players/${pid}/votedFor`] = null;
      updates[`rooms/${gameState.code}/players/${pid}/isVoteLocked`] = false;
      updates[`rooms/${gameState.code}/players/${pid}/isCardUsed`] = false;
      updates[`rooms/${gameState.code}/players/${pid}/cardTargetId`] = null;
      updates[`rooms/${gameState.code}/players/${pid}/isSilenced`] = false;
      updates[`rooms/${gameState.code}/players/${pid}/isScrambled`] = false;
      updates[`rooms/${gameState.code}/players/${pid}/isEliminated`] = false;
    });

    await update(ref(db), updates);
  };

  const clearError = () => setError(null);

  return {
    gameState, playerId, loading, error,
    createRoom, joinRoom, leaveRoom, toggleReady,
    startGame, useCard, voteToSkip,
    castVote, checkVotingComplete, returnToLobby, startNextRound,
    clearError, forceVotingPhase
  };
};
