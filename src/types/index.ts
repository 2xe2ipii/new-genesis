// --- 1. ENUMS & CONSTANTS ---

export type PlayerRole = 
  | 'LOCAL'    // The normal person (Majority)
  | 'SPY'      // The impostor
  | 'TOURIST'  // The blank slate
  | 'JOKER';   // Wants to be voted out

export type AbilityCard = 
  | 'INTERCEPT' // Reveal first letter of enemy word
  | 'RADAR'     // Scan alignment (Safe/Threat)
  | 'SILENCER'  // Nullify a player's vote
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
  votesToSkipDiscussion: string[]; // List of player IDs who want to skip to voting
  winner: 'LOCALS' | 'SPY' | 'JOKER' | null;
}

// --- 3. PROPS & UTILS ---

// Helper for our Scratch Card component later
export interface ScratchCardProps {
  content: string;      // The word or role to reveal
  onReveal: () => void; // Trigger when scratched enough
}