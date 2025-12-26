// src/utils/helpers.ts

export const generateRoomCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I and O to avoid confusion with 1 and 0
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generatePlayerId = (): string => {
  return 'player-' + Math.random().toString(36).substr(2, 9);
};

// Quick helper to get stored ID or create new one
export const getStoredPlayerId = (): string => {
  const stored = localStorage.getItem('ng_player_id');
  if (stored) return stored;
  
  const newId = generatePlayerId();
  localStorage.setItem('ng_player_id', newId);
  return newId;
};