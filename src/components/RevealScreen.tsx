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

  // 1. THEME & TEXT LOGIC
  const getRoleConfig = () => {
    switch (player.role) {
      case 'SPY': 
        return { 
          color: 'text-rose-500', 
          directive: "INFILTRATE. DECEIVE. SURVIVE.",
          bg: "bg-rose-950/10"
        };
      case 'TOURIST': 
        return { 
          color: 'text-amber-500', 
          directive: "OBSERVE. BLEND IN. REMAIN CALM.",
          bg: "bg-amber-950/10"
        };
      case 'JOKER': 
        return { 
          color: 'text-fuchsia-500', 
          directive: "DISRUPT. CONFUSE. PREVAIL.",
          bg: "bg-fuchsia-950/10"
        };
      default: // LOCAL
        return { 
          color: 'text-violet-500', 
          directive: "IDENTIFY THE INTRUDER. PROTECT THE SECRET.",
          bg: "bg-slate-900/50"
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in duration-500 relative overflow-hidden font-mono">
      
      {/* Background Noise */}
      <div className={`absolute inset-0 pointer-events-none ${config.bg}`} />
      
      <div className="w-full max-w-sm relative z-10 flex flex-col h-full justify-center">
        
        {/* HEADER */}
        <div className="text-center mb-10 space-y-2 opacity-70">
          <div className="flex justify-center gap-2 text-[10px] text-slate-500 tracking-[0.2em]">
            <span>SECURE_CONNECTION</span>
            <span className="animate-pulse">●</span>
            <span>ENCRYPTED</span>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              /* --- STATE 1: LOCKED --- */
              <motion.button
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                onClick={() => setIsRevealed(true)}
                className="w-full h-[400px] border-l-2 border-slate-700 hover:border-violet-500 bg-slate-950/50 pl-6 flex flex-col justify-center text-left gap-4 group transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 typing-effect">Incoming transmission...</p>
                  <p className="text-xs text-slate-500">Source: HQ</p>
                  <p className="text-xs text-slate-500">Subject: OPERATION GENESIS</p>
                </div>
                
                <div className="mt-4">
                   <p className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors blinking-cursor">
                     [ TAP TO DECRYPT ]
                   </p>
                </div>
              </motion.button>
            ) : (
              /* --- STATE 2: THE MESSAGE --- */
              <motion.div
                key="revealed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-auto text-left space-y-8"
              >
                {/* 1. GREETING */}
                <div className="space-y-1 border-l-2 border-slate-700 pl-4 py-1">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">To: Agent {player.name}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Priority: CRITICAL</p>
                </div>

                {/* 2. THE CONTENT BODY */}
                <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
                  <p>
                    You have been activated. Your assignment is confirmed as <strong className={`text-xl ${config.color} uppercase tracking-wider`}>{player.role}</strong>.
                  </p>

                  <div className="py-4 border-y border-slate-800/50">
                    <p className="mb-2 text-xs text-slate-500 uppercase tracking-widest">Passphrase</p>
                    <p className="text-4xl md:text-5xl font-black text-white tracking-widest drop-shadow-md">
                      {player.secretWord || "UNKNOWN"}
                    </p>
                  </div>

                  <p className="italic text-slate-500 text-xs tracking-wide">
                    // DIRECTIVE: {config.directive}
                  </p>

                  {/* ITEM SECTION */}
                  {player.abilityCard && (
                    <div className="bg-amber-500/5 border-l-2 border-amber-500/50 p-4 mt-4">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                        Logistics Update
                      </p>
                      <p className="text-amber-200">
                        Equipment issued: <strong className="text-amber-400 uppercase">{player.abilityCard}</strong>.
                        Use with discretion.
                      </p>
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER: SYSTEM ACTION BAR */}
        <div className="mt-10">
          {isRevealed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onReadyToDiscuss}
              // A wide, bordered bar that looks like a UI element, not just text, but fits the terminal theme.
              className="w-full py-4 border-y border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-500 text-slate-400 hover:text-white transition-all flex items-center justify-between px-4 group"
            >
              <span className="text-xs opacity-50 group-hover:opacity-100">{`[ 001 ]`}</span>
              
              <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold">
                 ACKNOWLEDGE_&_BURN
              </span>
              
              <span className="text-xs opacity-50 group-hover:opacity-100">{`[ END ]`}</span>
            </motion.button>
          )}
        </div>

      </div>
    </div>
  );
};