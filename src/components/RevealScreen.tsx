// src/components/RevealScreen.tsx
import React, { useState } from 'react';
import type { Player } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface RevealScreenProps {
  player: Player;
  onReadyToDiscuss: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({ player, onReadyToDiscuss }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // 1. DYNAMIC THEMING BASED ON ROLE
  const getTheme = () => {
    switch (player.role) {
      case 'SPY': 
        return { 
          main: 'text-rose-500', 
          border: 'border-rose-500/50', 
          bg: 'bg-rose-950/30', 
          glow: 'shadow-rose-900/50',
          label: 'HOSTILE'
        };
      case 'TOURIST': 
        return { 
          main: 'text-amber-500', 
          border: 'border-amber-500/50', 
          bg: 'bg-amber-950/30', 
          glow: 'shadow-amber-900/50',
          label: 'UNKNOWN'
        };
      case 'JOKER': 
        return { 
          main: 'text-fuchsia-500', 
          border: 'border-fuchsia-500/50', 
          bg: 'bg-fuchsia-950/30', 
          glow: 'shadow-fuchsia-900/50',
          label: 'WILDCARD'
        };
      default: // LOCAL
        return { 
          main: 'text-violet-500', 
          border: 'border-violet-500/50', 
          bg: 'bg-slate-900', 
          glow: 'shadow-violet-900/50',
          label: 'OPERATIVE'
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in duration-500 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className={`absolute inset-0 opacity-10 pointer-events-none ${theme.bg}`} />

      <div className="w-full max-w-sm relative z-10 flex flex-col h-full justify-center">
        
        {/* HEADER */}
        <div className="text-center mb-8 space-y-1">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">
            Transmission Received
          </p>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">
            Identity_File_01
          </h2>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              /* --- STATE 1: LOCKED (ENCRYPTED) --- */
              <motion.button
                key="locked"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0, filter: "blur(10px)" }}
                onClick={() => setIsRevealed(true)}
                className="w-full h-[400px] bg-slate-900/80 border border-slate-700 rounded-xl flex flex-col items-center justify-center gap-6 group hover:border-violet-500 transition-colors shadow-2xl relative overflow-hidden"
              >
                {/* Animated Scan Line */}
                <div className="absolute top-0 w-full h-1 bg-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.5)] animate-[scan_3s_ease-in-out_infinite]" />

                <div className="p-6 rounded-full bg-slate-800 border border-slate-700 group-hover:bg-slate-700 group-hover:border-violet-500/50 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-400 group-hover:text-violet-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-lg font-bold text-white tracking-widest">FILE ENCRYPTED</p>
                  <p className="text-xs font-mono text-slate-500 uppercase">Tap to Decrypt</p>
                </div>
              </motion.button>
            ) : (
              /* --- STATE 2: UNLOCKED (THE DOSSIER) --- */
              <motion.div
                key="revealed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full h-[400px] bg-slate-900 border-2 ${theme.border} rounded-xl shadow-2xl ${theme.glow} flex flex-col relative overflow-hidden`}
              >
                {/* ID Header */}
                <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500">CLASS: {theme.label}</span>
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${theme.bg.replace('/30', '')} animate-pulse`} />
                    <div className={`w-2 h-2 rounded-full bg-slate-800`} />
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-6">
                  
                  {/* ROLE */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Assigned Role</p>
                    <h1 className={`text-5xl font-black uppercase tracking-tighter ${theme.main} drop-shadow-lg`}>
                      {player.role}
                    </h1>
                  </div>

                  {/* SEPARATOR */}
                  <div className="w-12 h-0.5 bg-slate-800" />

                  {/* WORD */}
                  <div className="w-full bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Passphrase</p>
                    <p className="text-2xl font-bold text-white tracking-widest">
                      {player.secretWord || "/// NO DATA"}
                    </p>
                  </div>

                  {/* ABILITY */}
                  {player.abilityCard && (
                     <div className="w-full text-left">
                       <div className="flex items-center gap-2 mb-1">
                         <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                         <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Asset Acquired</p>
                       </div>
                       <p className="text-sm font-mono text-slate-300 uppercase truncate">
                         {player.abilityCard}
                       </p>
                     </div>
                  )}
                </div>

                {/* Footer Decor */}
                <div className="h-2 w-full bg-slate-950 border-t border-slate-800 flex">
                   <div className={`h-full w-1/3 ${theme.bg.replace('/30', '')}`} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CONFIRM BUTTON (Only shows after reveal) */}
        <div className="h-20 mt-6 flex items-end">
          {isRevealed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onReadyToDiscuss}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-4 rounded-lg font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
            >
              Burn Message
            </motion.button>
          )}
        </div>

      </div>
    </div>
  );
};