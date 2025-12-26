// src/components/RevealScreen.tsx
import React, { useState } from 'react';
import type { Player } from '../types';
import { motion } from 'framer-motion';

interface RevealScreenProps {
  player: Player;
  onReadyToDiscuss: () => void; // We will use this to trigger the timer start later
}

export const RevealScreen: React.FC<RevealScreenProps> = ({ player, onReadyToDiscuss }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // Helper text based on role
  const getRoleFlavorText = () => {
    switch (player.role) {
      case 'SPY': return "Blend in. Deceive. Don't get caught.";
      case 'TOURIST': return "You have no idea what's going on. Fake it.";
      case 'JOKER': return "Make them vote for you. Chaos is your friend.";
      case 'LOCAL': return "Find the intruder. Protect the secret.";
      default: return "";
    }
  };

  const getRoleColor = () => {
    switch (player.role) {
      case 'SPY': return "text-red-500";
      case 'TOURIST': return "text-yellow-500";
      case 'JOKER': return "text-purple-500";
      case 'LOCAL': return "text-blue-500";
      default: return "text-white";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-8">
      
      <div className="text-center space-y-2">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Top Secret Clearance
        </h2>
        <p className="text-xs text-slate-600">Scratch below to reveal mission</p>
      </div>

      {/* The Scratch Card Area */}
      <div className="relative w-64 h-80 rounded-2xl overflow-hidden cursor-pointer select-none" onClick={() => setIsRevealed(true)}>
        
        {/* The Content (Hidden Layer) */}
        <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center p-6 text-center border-2 border-slate-700">
           <span className={`text-4xl font-black uppercase mb-4 ${getRoleColor()}`}>
             {player.role}
           </span>
           
           <div className="bg-black/50 p-4 rounded-lg w-full mb-4">
             <p className="text-xs text-slate-400 uppercase mb-1">Your Word</p>
             <p className="text-3xl font-bold text-white tracking-widest">
               {player.secretWord || "???"}
             </p>
           </div>
           
           <p className="text-xs text-slate-400 italic">
             {getRoleFlavorText()}
           </p>

           {player.abilityCard && (
             <div className="mt-4 pt-4 border-t border-slate-700 w-full">
               <p className="text-[10px] text-yellow-400 uppercase font-bold mb-1">Item Acquired</p>
               <p className="font-mono text-sm">{player.abilityCard}</p>
             </div>
           )}
        </div>

        {/* The Cover (Scratch Layer) - Disappears on Click for MVP */}
        {!isRevealed && (
           <motion.div 
             initial={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center z-20"
           >
             <p className="text-slate-400 font-bold animate-pulse">TAP TO REVEAL</p>
           </motion.div>
        )}
      </div>

      {/* Button to Proceed */}
      {isRevealed && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onReadyToDiscuss}
          className="w-full bg-slate-100 text-slate-900 p-4 rounded-xl font-bold uppercase tracking-wider hover:bg-white"
        >
          I Understand
        </motion.button>
      )}

    </div>
  );
};