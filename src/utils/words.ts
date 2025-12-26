// src/utils/words.ts

export const WORD_PAIRS = [
  { majority: "Sun", impostor: "Moon" },
  { majority: "Coffee", impostor: "Tea" },
  { majority: "Beach", impostor: "Pool" },
  { majority: "Train", impostor: "Subway" },
  { majority: "Guitar", impostor: "Violin" },
  { majority: "Apple", impostor: "Orange" },
  { majority: "Dog", impostor: "Wolf" },
  { majority: "Facebook", impostor: "Twitter" },
  { majority: "Superman", impostor: "Batman" },
  { majority: "Pillow", impostor: "Blanket" },
];

export const getRandomWordPair = () => {
  const index = Math.floor(Math.random() * WORD_PAIRS.length);
  return WORD_PAIRS[index];
};