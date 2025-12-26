// src/components/RevealScreen.tsx
import React, { useState } from 'react';
import type { Player, AbilityCard } from '../types';
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

  // 2. ITEM VISUALS
  const getItemDetails = (card: AbilityCard) => {
    switch (card) {
      case 'RADAR':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a9.75 9.75 0 11-19.5 0 9.75 9.75 0 0119.5 0zM12 5.25a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5z" />
            </svg>
          ),
          desc: "Scan player alignment."
        };
      case 'INTERCEPT':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.352 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.303zm-7.389 4.267a.75.75 0 011-.353c1.135.418 2.159 1.103 3.014 1.95s1.533 1.879 1.95 3.014a.75.75 0 11-1.4.516 5.26 5.26 0 00-1.783-2.26.75.75 0 01-.354-1h.573z" clipRule="evenodd" />
            </svg>
          ),
          desc: "Reveal enemy data."
        };
      case 'SILENCER':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.5 12a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0z" />
            </svg>
          ),
          desc: "Nullify one vote."
        };
      default:
        return { icon: null, desc: "" };
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

        <div className="relative min-h-[420px]">
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              /* --- STATE 1: LOCKED (ENCRYPTED) --- */
              <motion.button
                key="locked"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0, filter: "blur(10px)" }}
                onClick={() => setIsRevealed(true)}
                className="w-full h-[420px] bg-slate-900/80 border border-slate-700 rounded-xl flex flex-col items-center justify-center gap-6 group hover:border-violet-500 transition-colors shadow-2xl relative overflow-hidden"
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
                className={`w-full h-[420px] bg-slate-900 border-2 ${theme.border} rounded-xl shadow-2xl ${theme.glow} flex flex-col relative overflow-hidden`}
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
                <div className="flex-1 p-6 flex flex-col items-center justify-between">
                  
                  {/* ROLE */}
                  <div className="text-center mt-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Assigned Role</p>
                    <h1 className={`text-5xl font-black uppercase tracking-tighter ${theme.main} drop-shadow-lg leading-none`}>
                      {player.role}
                    </h1>
                  </div>

                  {/* WORD BOX */}
                  <div className="w-full bg-slate-950/50 p-4 rounded-lg border border-slate-800 text-center">
                    <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Passphrase</p>
                    <p className="text-2xl font-bold text-white tracking-widest">
                      {player.secretWord || "/// NO DATA"}
                    </p>
                  </div>

                  {/* ITEM SLOT (The Fix) */}
                  {player.abilityCard && (
                    <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-4">
                      {/* Icon Box */}
                      <div className="w-10 h-10 bg-amber-500/20 rounded flex items-center justify-center text-amber-500 shrink-0">
                         {getItemDetails(player.abilityCard).icon}
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-0.5">
                          Hardware Acquired
                        </p>
                        <p className="text-sm font-black text-white uppercase tracking-wider truncate">
                          {player.abilityCard}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Empty Slot Placeholder if no card (keeps layout consistent) */}
                  {!player.abilityCard && (
                     <div className="w-full h-[66px]" />
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

        {/* CONFIRM BUTTON */}
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