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
  | 'DISCUSSION'     // 10 min timer running
  | 'VOTING'         // Voting process (Locked/Hidden)
  | 'SUSPENSE'       // The "Shuffle" animation before reveal
  | 'RESULTS';       // Winner declaration & Role reveal

// --- 2. CORE ENTITIES ---

export interface SystemMessage {
  type: string;        // e.g., 'RADAR_RESULT', 'SPOOF_ACTIVATE'
  text: string;        // The message to display
  targetId: string | null; // Who was targeted (optional)
  timestamp: number;   // For sorting
}

export interface Player {
  id: string;          // Unique device ID or socket ID
  name: string;        // Display name
  avatar?: string;     // Optional: Emoji or color code
  isHost: boolean;     // Can start the game
  isReady: boolean;    // For Lobby status
  
  // Game State Data (Hidden from others locally)
  role: PlayerRole | null;
  secretWord: string;  // "Sun" or "Day" or "" (for Tourist)
  
  // Card System
  abilityCard: AbilityCard;
  isCardUsed: boolean;
  
  // Voting Data
  votedFor: string | null;  // ID of player they voted for
  isVoteLocked: boolean;    // Cannot change vote once true
  votesReceived: number;    // Calculated server-side or derived
  
  // Status Effects
  isSilenced: boolean;      // If true, their vote counts as 0
  isScrambled?: boolean;    // NEW: If true, Radar results are inverted
}

export interface Room {
  code: string;           // The 4-letter join code
  hostId: string;
  players: Record<string, Player>; // Map ID -> Player
  
  // Global State
  phase: GamePhase;
  timerEndTime: number;   // Timestamp (Date.now() + ms)
  
  // The Hidden Truths (Stored in DB, but clients should be careful reading)
  majorityWord: string;
  impostorWord: string;
  
  // Dynamic Game Data
  votesToSkipDiscussion: string[]; 
  winner: 'LOCALS' | 'SPY' | 'JOKER' | null;
  
  // NEW: System Message Feed
  systemMessages?: Record<string, SystemMessage>;
}

// --- 3. PROPS & UTILS ---

export interface ScratchCardProps {
  content: string;      
  onReveal: () => void; 
}