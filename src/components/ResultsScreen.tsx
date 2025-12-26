// src/components/ResultsScreen.tsx
import React, { useEffect, useState } from 'react';
import type { Room, PlayerRole } from '../types';
import { motion } from 'framer-motion';

interface ResultsScreenProps {
  room: Room;
  onReturnToLobby: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ room, onReturnToLobby }) => {
  const [displayedRole, setDisplayedRole] = useState<PlayerRole>('LOCAL');
  
  // 1. Suspense Phase: Shuffle Animation
  useEffect(() => {
    if (room.phase === 'SUSPENSE') {
      const roles: PlayerRole[] = ['LOCAL', 'SPY', 'TOURIST', 'JOKER'];
      const interval = setInterval(() => {
        setDisplayedRole(roles[Math.floor(Math.random() * roles.length)]);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [room.phase]);

  // 2. Suspense View
  if (room.phase === 'SUSPENSE') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black">
        <p className="text-slate-400 uppercase tracking-widest mb-8 animate-pulse">Analyzing DNA...</p>
        
        <motion.div
          key={displayedRole}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.5 }}
          exit={{ opacity: 0 }}
          className="text-6xl font-black text-white"
        >
          {displayedRole}
        </motion.div>
      </div>
    );
  }

  // 3. Results View
  const winnerColor = room.winner === 'LOCALS' ? 'text-blue-500' : room.winner === 'SPY' ? 'text-red-500' : 'text-purple-500';
  const winnerText = room.winner === 'LOCALS' ? 'MISSION ACCOMPLISHED' : room.winner === 'SPY' ? 'MISSION FAILED' : 'JOKER VICTORY';

  return (
    <div className="flex flex-col h-full p-6 animate-in fade-in duration-1000">
      
      {/* Winner Banner */}
      <div className="text-center mt-10 mb-8">
        <h1 className={`text-5xl font-black uppercase tracking-tighter leading-none mb-2 ${winnerColor} drop-shadow-2xl`}>
          {room.winner} <br/> WIN
        </h1>
        <p className="text-white font-bold tracking-widest bg-slate-800 inline-block px-4 py-1 rounded">
          {winnerText}
        </p>
      </div>

      {/* Role Reveal List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Declassified Files</p>
        
        {Object.values(room.players).map(p => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (Math.random() * 0.5) }} // Random stagger
            className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700"
          >
            <span className="font-bold text-slate-300">{p.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{p.secretWord}</span>
              <span className={`font-black uppercase text-sm ${
                p.role === 'SPY' ? 'text-red-500' : 
                p.role === 'TOURIST' ? 'text-yellow-500' :
                p.role === 'JOKER' ? 'text-purple-500' : 'text-blue-500'
              }`}>
                {p.role}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={onReturnToLobby}
        className="mt-4 w-full bg-slate-100 text-slate-900 p-4 rounded-xl font-bold uppercase hover:bg-white"
      >
        Back to HQ
      </button>
    </div>
  );
};