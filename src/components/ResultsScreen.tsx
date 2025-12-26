// src/components/ResultsScreen.tsx
import React, { useEffect, useState } from 'react';
import type { Room } from '../types';
import { motion } from 'framer-motion';

interface ResultsScreenProps {
  room: Room;
  onReturnToLobby: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ room, onReturnToLobby }) => {
  // STAGES:
  // 0: SYSTEM ANALYSIS (Suspense - 3s)
  // 1: EJECTION REVEAL (Who got voted out - 5s)
  // 2: THREAT IDENTIFICATION (The Twist - 5s) - Skipped if Spy is caught
  // 3: FINAL REPORT (Scoreboard)
  const [stage, setStage] = useState(0);
  const [ejectedId, setEjectedId] = useState<string | null>(null);
  const [spyId, setSpyId] = useState<string | null>(null);

  useEffect(() => {
    // --- 1. CALCULATE DATA ---
    const players = Object.values(room.players);
    const votes: Record<string, number> = {};
    
    // Tally votes (excluding silenced)
    players.forEach(p => {
      if (p.votedFor && !p.isSilenced) {
        votes[p.votedFor] = (votes[p.votedFor] || 0) + 1;
      }
    });

    // Find Most Voted
    let max = 0;
    let victimId: string | null = null;
    Object.entries(votes).forEach(([pid, count]) => {
      if (count > max) {
        max = count;
        victimId = pid;
      } else if (count === max) {
        victimId = null; // Tie
      }
    });

    setEjectedId(victimId);
    
    // Identify Real Spy
    const actualSpy = players.find(p => p.role === 'SPY');
    setSpyId(actualSpy?.id || null);

    // --- 2. CINEMATIC SEQUENCE ---
    
    // Stage 1: Reveal Ejection (at 3s)
    const timer1 = setTimeout(() => setStage(1), 3000);
    
    let timer2: ReturnType<typeof setTimeout>;
    let timer3: ReturnType<typeof setTimeout>;

    // Check for Twist condition:
    // (No one ejected) OR (Ejected person is NOT the Spy)
    const isSpySafe = !victimId || (actualSpy && victimId !== actualSpy.id);

    if (isSpySafe) {
        // Stage 2: The Twist (at 8s)
        timer2 = setTimeout(() => setStage(2), 8000);
        // Stage 3: Final Scoreboard (at 13s)
        timer3 = setTimeout(() => setStage(3), 13000);
    } else {
        // Spy Caught! Skip Twist.
        // Stage 3: Final Scoreboard (at 8s)
        timer3 = setTimeout(() => setStage(3), 8000);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const ejectedPlayer = ejectedId ? room.players[ejectedId] : null;
  const spyPlayer = spyId ? room.players[spyId] : null;

  // --- RENDERERS ---

  // PHASE 0: SYSTEM ANALYSIS
  if (stage === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 font-mono relative overflow-hidden text-violet-500">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />
        
        {/* Full Screen Suspense */}
        <div className="relative z-10 flex flex-col items-center gap-8 animate-pulse">
          <div className="w-32 h-32 border-t-2 border-b-2 border-violet-500 rounded-full animate-spin" />
          <h2 className="text-2xl font-black tracking-[0.3em] uppercase text-white">
             ANALYZING
          </h2>
        </div>
      </div>
    );
  }

  // PHASE 1: THE VERDICT (Who was ejected?)
  if (stage === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 font-mono relative overflow-hidden p-6 text-center">
        {/* Background Flash */}
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.1 }} 
            className="absolute inset-0 bg-violet-500 pointer-events-none" 
        />
        
        <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="z-10 w-full flex flex-col items-center gap-8"
        >
            <p className="text-violet-400 uppercase tracking-[0.4em] text-xs font-bold">
               EJECTION CONFIRMED
            </p>

            {ejectedPlayer ? (
                <>
                    {/* GIANT NAME REVEAL */}
                    <div className="relative">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                            {ejectedPlayer.name}
                        </h1>
                    </div>
                    
                    <div className="w-16 h-1 bg-slate-800" />
                    
                    <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                            TRUE IDENTITY
                        </p>
                        <p className={`text-4xl font-black uppercase tracking-[0.2em] ${
                            ejectedPlayer.role === 'SPY' ? 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 
                            ejectedPlayer.role === 'JOKER' ? 'text-fuchsia-500' : 'text-emerald-400'
                        }`}>
                            {ejectedPlayer.role}
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <h1 className="text-4xl font-black text-slate-400 uppercase tracking-widest opacity-50">
                        NO EJECTION
                    </h1>
                    <p className="text-rose-500 mt-4 uppercase tracking-widest text-sm animate-pulse font-bold">
                        VOTE INCONCLUSIVE
                    </p>
                </>
            )}
        </motion.div>
      </div>
    );
  }

  // PHASE 2: THE TWIST (If Spy Survived)
  if (stage === 2) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 font-mono relative overflow-hidden text-center p-6">
        {/* Warning Background */}
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-950/20 to-slate-950 pointer-events-none" 
        />
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 w-full flex flex-col items-center gap-10"
        >
            <div className="flex items-center gap-3 text-rose-500 animate-pulse">
                <span className="text-2xl">⚠️</span>
                <span className="font-bold uppercase tracking-[0.3em] text-sm">
                    CRITICAL ALERT
                </span>
                <span className="text-2xl">⚠️</span>
            </div>

            <h1 className="text-4xl font-black text-white uppercase tracking-widest leading-tight">
                THREAT<br/>STILL ACTIVE
            </h1>
            
            <div className="space-y-4">
                <p className="text-slate-500 text-xs uppercase tracking-widest">
                    THE REAL SPY WAS
                </p>
                <p className="text-5xl font-black text-rose-500 uppercase tracking-tighter drop-shadow-[0_0_25px_rgba(244,63,94,0.4)]">
                    {spyPlayer?.name || "UNKNOWN"}
                </p>
            </div>
        </motion.div>
      </div>
    );
  }

  // PHASE 3: MISSION REPORT (Scoreboard)
  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-white relative overflow-hidden">
      
      {/* HEADER */}
      <div className="pt-12 pb-6 px-6 bg-slate-900/50 z-20 text-center border-b border-slate-800/50 backdrop-blur-sm">
         <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] mb-3">
            MISSION REPORT
         </p>
         <h1 className={`text-5xl font-black uppercase tracking-tighter ${
             room.winner === 'LOCALS' ? 'text-emerald-400' : 
             room.winner === 'JOKER' ? 'text-fuchsia-500' : 'text-rose-500'
         }`}>
            {room.winner === 'LOCALS' ? 'LOCALS WIN' : 
             room.winner === 'JOKER' ? 'JOKER WINS' : 'SPY WINS'}
         </h1>
      </div>

      {/* FULL SCREEN LIST */}
      <div className="flex-1 overflow-y-auto p-0 z-10">
        {Object.values(room.players).map((p, i) => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center justify-between p-6 border-b border-slate-900 ${
                // Subtle highlight for Spy
                p.role === 'SPY' ? 'bg-rose-950/10' : 'bg-transparent'
            }`}
          >
            <div>
              <p className="font-bold text-lg text-white uppercase tracking-wide">
                {p.name}
              </p>
              <p className="text-[10px] text-slate-500 uppercase mt-1 tracking-widest">
                CODE: <span className="text-slate-300">{p.secretWord || "---"}</span>
              </p>
            </div>
            
            <div className="text-right">
              <span className={`text-xs font-black uppercase tracking-wider ${
                 p.role === 'SPY' ? 'text-rose-500' : 
                 p.role === 'LOCAL' ? 'text-emerald-400' : 
                 p.role === 'JOKER' ? 'text-fuchsia-500' : 'text-amber-400'
              }`}>
                {p.role}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FOOTER ACTION */}
      <div className="p-6 bg-slate-900/50 z-20 border-t border-slate-800/50 backdrop-blur-sm">
        <button
          onClick={onReturnToLobby}
          className="w-full py-5 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-[0.2em] rounded-sm transition-all shadow-[0_0_25px_rgba(139,92,246,0.3)] text-sm"
        >
          RETURN TO LOBBY
        </button>
      </div>
    </div>
  );
};