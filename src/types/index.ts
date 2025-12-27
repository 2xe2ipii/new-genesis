// src/types/index.ts

// --- 1. ENUMS & CONSTANTS ---

export type PlayerRole = 
  | 'LOCAL'    // The normal person (Majority)
  | 'SPY'      // The impostor
  | 'TOURIST'  // The blank slate
  | 'JOKER';   // Wants to be voted out

export type AbilityCard = 
  | 'RADAR'     // Scan alignment (Safe/Threat)
  | 'SILENCER'  // Nullify a player's vote
  | 'SPOOF'     // The new Dark Card (Replaces Overload)
  | null;       // Player might not have a card (or used it)

export type GamePhase = 
  | 'LOBBY'          // Waiting for players
  | 'ASSIGNING'      // Roles are being distributed (internal state)
  | 'REVEAL'         // Scratch card phase to see roles
  | 'DISCUSSION'     // Timer running
  | 'VOTING'         // Voting process (Locked/Hidden)
  | 'SUSPENSE'       // The "Shuffle" animation before reveal
  | 'RESULTS';       // Winner declaration & Role reveal

// --- 2. CORE ENTITIES ---

export interface SystemMessage {
  type: string;
  text: string;
  targetId: string | null;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isReady: boolean;
  
  // Game State
  role: PlayerRole | null;
  secretWord: string;
  isEliminated?: boolean; // <--- NEW: Tracks if player died in Round 1
  
  // Card System
  abilityCard: AbilityCard;
  isCardUsed: boolean;
  cardTargetId?: string | null;
  
  // Voting Data
  votedFor: string | null;
  isVoteLocked: boolean;
  votesReceived: number;
  
  // Status Effects
  isSilenced: boolean;
  isScrambled?: boolean;
}

export interface Room {
  code: string;
  hostId: string;
  players: Record<string, Player>;
  phase: GamePhase;
  round: number; // <--- NEW: Tracks Round 1 vs Round 2
  timerEndTime: number;
  majorityWord: string;
  impostorWord: string;
  votesToSkipDiscussion: string[]; 
  winner: 'LOCALS' | 'SPY' | 'JOKER' | null;
  systemMessages?: Record<string, SystemMessage>;
}

// --- 3. PROPS & UTILS ---

export interface ScratchCardProps {
  content: string;      
  onReveal: () => void; 
}