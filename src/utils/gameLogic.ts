// src/utils/gameLogic.ts
import type { Player, PlayerRole, AbilityCard } from '../types';
import { getRandomWordPair } from './words';

export const distributeGameRoles = (players: Record<string, Player>) => {
  const playerIds = Object.keys(players);
  const count = playerIds.length;
  
  // 1. Get Words
  const { majority, impostor, type } = getRandomWordPair();
  
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
  
  // Initialize everyone with null first
  playerIds.forEach(id => cardAssignments[id] = null);

  // Identify Threats to potentially receive SPOOF
  const threatIds = playerIds.filter(id => 
    ['SPY', 'JOKER', 'TOURIST'].includes(assignments[id].role)
  );

  // Pool of players available for Standard Cards (initially everyone)
  let availableForStandardCards = [...playerIds];

  // A. Assign SPOOF (Only to a Threat)
  if (threatIds.length > 0) {
    const randomThreatIndex = Math.floor(Math.random() * threatIds.length);
    const spooferId = threatIds[randomThreatIndex];
    cardAssignments[spooferId] = 'SPOOF';
    availableForStandardCards = availableForStandardCards.filter(id => id !== spooferId);
  }

  // B. Assign RADAR and SILENCER (To anyone remaining in the pool)
  const shuffledOthers = availableForStandardCards.sort(() => Math.random() - 0.5);

  // --- UPDATED: 2 RADARS + 1 SILENCER ---
  if (shuffledOthers.length > 0) cardAssignments[shuffledOthers.pop()!] = 'RADAR';
  if (shuffledOthers.length > 0) cardAssignments[shuffledOthers.pop()!] = 'RADAR'; // 2nd Radar
  if (shuffledOthers.length > 0) cardAssignments[shuffledOthers.pop()!] = 'SILENCER';

  return {
    assignments,
    cardAssignments,
    majority,
    impostor,
    wordType: type
  };
};