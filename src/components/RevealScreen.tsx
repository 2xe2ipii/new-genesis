// src/components/RevealScreen.tsx
import React, { useState } from 'react';
import type { Player } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface RevealScreenProps {
  player: Player;
  wordType?: 'word' | 'question';
  onReadyToDiscuss: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({ player, wordType, onReadyToDiscuss }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // 1. THEME LOGIC
  const getRoleConfig = () => {
    switch (player.role) {
      case 'SPY': 
        return { 
          color: 'text-rose-500', 
          border: 'border-rose-500',
          bg: 'bg-rose-950/30',
          icon: '🕵️'
        };
      case 'TOURIST': 
        return { 
          color: 'text-amber-500', 
          border: 'border-amber-500',
          bg: 'bg-amber-950/30',
          icon: '📸'
        };
      case 'JOKER': 
        return { 
          color: 'text-fuchsia-500', 
          border: 'border-fuchsia-500',
          bg: 'bg-fuchsia-950/30',
          icon: '🤡'
        };
      default: // LOCAL
        return { 
          color: 'text-violet-500', 
          border: 'border-violet-500',
          bg: 'bg-violet-950/30',
          icon: '👤'
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 relative overflow-hidden font-mono">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-slate-950" />
      
      <div className="w-full max-w-sm relative z-10">
        
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            /* --- STATE 1: LOCKED CARD (FACE DOWN) --- */
            <motion.button
              key="locked"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0, transition: { duration: 0.2 } }}
              onClick={() => setIsRevealed(true)}
              className="w-full aspect-[3/4] rounded-xl border-2 border-slate-700 bg-slate-900 shadow-2xl flex flex-col items-center justify-center gap-6 group hover:border-slate-500 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Decorative patterns */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-500 to-transparent" />
              <div className="text-6xl opacity-20 group-hover:scale-110 transition-transform">🔒</div>
              
              <div className="z-10 text-center space-y-2">
                <p className="text-slate-400 text-sm tracking-[0.2em] uppercase">Identity Encrypted</p>
                <p className="text-white text-lg font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-700 group-hover:bg-slate-700 transition-colors">
                  TAP TO REVEAL
                </p>
              </div>
            </motion.button>
          ) : (
            /* --- STATE 2: ID CARD (REVEALED) --- */
            <motion.div
              key="revealed"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`w-full aspect-[3/4] rounded-xl border-2 ${config.border} ${config.bg} relative flex flex-col overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-sm`}
            >
              {/* HEADER: ID STRIP */}
              <div className={`h-24 w-full border-b ${config.border} bg-slate-900/80 flex items-center px-6 justify-between`}>
                 <div>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Agent Name</p>
                   <p className="text-xl font-bold text-white uppercase tracking-wider">{player.name}</p>
                 </div>
                 <div className="text-4xl filter drop-shadow-lg">{config.icon}</div>
              </div>

              {/* BODY: ROLE & WORD */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 text-center">
                
                {/* ROLE DISPLAY */}
                <div className="w-full space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Assignment</p>
                  <h2 className={`text-4xl font-black ${config.color} uppercase tracking-tight drop-shadow-md`}>
                    {player.role}
                  </h2>
                </div>

                {/* SECRET WORD DISPLAY */}
                <div className="w-full py-4 border-y border-white/10 bg-black/20 space-y-2">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {wordType === 'question' ? 'Security Question' : 'Passphrase'}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {player.secretWord || "???"}
                  </p>
                </div>

                {/* ITEM SLOT (Only if exists) */}
                {player.abilityCard && (
                  <div className="w-full flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded px-4 py-3">
                    <span className="text-[10px] text-amber-500 uppercase tracking-wider font-bold">Equipped Item</span>
                    <span className="text-sm text-amber-300 font-bold uppercase">{player.abilityCard}</span>
                  </div>
                )}
              </div>

              {/* FOOTER: ACTION BUTTON */}
              <button
                onClick={onReadyToDiscuss}
                className="h-16 w-full bg-slate-900 border-t border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center group"
              >
                <span className="text-xs text-slate-400 group-hover:text-white uppercase tracking-[0.2em] font-bold">
                  Burn & Proceed &rarr;
                </span>
              </button>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};