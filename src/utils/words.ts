// src/utils/words.ts

export const WORD_PAIRS = [
  // Original pairs...
  { majority: "Sun", impostor: "Moon" },
  { majority: "Coffee", impostor: "Tea" },
  { majority: "Beach", impostor: "Pool" },
  { majority: "Train", impostor: "Subway" },
  { majority: "Guitar", impostor: "Violin" },
  
  // Nature & Weather
  { majority: "Mountain", impostor: "Hill" },
  { majority: "Rain", impostor: "Snow" },
  { majority: "River", impostor: "Lake" },
  
  // Food & Drink
  { majority: "Hamburger", impostor: "Sandwich" },
  { majority: "Pizza", impostor: "Pasta" },
  { majority: "Wine", impostor: "Beer" },
  { majority: "Butter", impostor: "Margarine" },
  
  // Objects & Daily Life
  { majority: "Wallet", impostor: "Purse" },
  { majority: "Mirror", impostor: "Window" },
  { majority: "Toothbrush", impostor: "Hairbrush" },
  { majority: "Laptop", impostor: "Tablet" },
  
  // Animals & Creatures
  { majority: "Lion", impostor: "Tiger" },
  { majority: "Dolphin", impostor: "Shark" },
  { majority: "Butterfly", impostor: "Moth" },
  
  // Entertainment & Tech
  { majority: "Netflix", impostor: "YouTube" },
  { majority: "Instagram", impostor: "TikTok" },
  { majority: "Cinema", impostor: "Theater" }
];

export const getRandomWordPair = () => {
  const index = Math.floor(Math.random() * WORD_PAIRS.length);
  return WORD_PAIRS[index];
};