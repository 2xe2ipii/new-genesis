// src/utils/gameLogic.ts
import type { Player, PlayerRole, AbilityCard } from '../types';
import { getUniqueWordPair } from './words'; // <--- Import the new function

// Update signature to accept usedIndices
export const distributeGameRoles = (
  players: Record<string, Player>, 
  usedIndices: number[] = [] 
) => {
  const playerIds = Object.keys(players);
  const count = playerIds.length;
  
  // 1. Get Unique Word Pair
  const { wordPair, index } = getUniqueWordPair(usedIndices);
  const { majority, impostor, type } = wordPair;
  
  // 2. Shuffle Players for Roles
  const shuffledForRoles = [...playerIds].sort(() => Math.random() - 0.5);
  const assignments: Record<string, { role: PlayerRole; word: string }> = {};

  // Assign Spy (Always 1)
  const spyId = shuffledForRoles.pop()!;
  assignments[spyId] = { role: 'SPY', word: impostor };

  // Assign Tourist (Only if 4+ players)
  if (count >= 4) {
    const touristId = shuffledForRoles.pop()!;
    assignments[touristId] = { role: 'TOURIST', word: '' };
  }

  // Assign Joker (Only if 5+ players)
  if (count >= 5) {
    const jokerId = shuffledForRoles.pop()!;
    assignments[jokerId] = { role: 'JOKER', word: majority };
  }

  // Rest are Locals
  while (shuffledForRoles.length > 0) {
    const localId = shuffledForRoles.pop()!;
    assignments[localId] = { role: 'LOCAL', word: majority };
  }

  // 3. Distribute Cards (Limit 3 cards total)
  const cardAssignments: Record<string, AbilityCard> = {};
  playerIds.forEach(id => cardAssignments[id] = null);

  const threatIds = playerIds.filter(id => 
    ['SPY', 'JOKER', 'TOURIST'].includes(assignments[id].role)
  );
  let availableForStandardCards = [...playerIds];

  // A. Assign SPOOF
  if (threatIds.length > 0) {
    const randomThreatIndex = Math.floor(Math.random() * threatIds.length);
    const spooferId = threatIds[randomThreatIndex];
    cardAssignments[spooferId] = 'SPOOF';
    availableForStandardCards = availableForStandardCards.filter(id => id !== spooferId);
  }

  // B. Assign RADAR and SILENCER
  const shuffledOthers = availableForStandardCards.sort(() => Math.random() - 0.5);

  if (shuffledOthers.length > 0) cardAssignments[shuffledOthers.pop()!] = 'RADAR';
  if (shuffledOthers.length > 0) cardAssignments[shuffledOthers.pop()!] = 'RADAR';
  if (shuffledOthers.length > 0) cardAssignments[shuffledOthers.pop()!] = 'SILENCER';

  return {
    assignments,
    cardAssignments,
    majority,
    impostor,
    wordType: type,
    newWordIndex: index // <--- Return this so you can save it to Firebase
  };
};