// src/components/LobbyScreen.tsx
import React from 'react';
import type { Room } from '../types';

interface LobbyScreenProps {
  room: Room;
  playerId: string;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeave: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ 
  room, 
  playerId, 
  onToggleReady, 
  onStartGame,
  onLeave 
}) => {
  const playersList = Object.values(room.players);
  const currentPlayer = room.players[playerId];
  const isHost = currentPlayer?.isHost;
  
  // Logic: Everyone must be ready, and there must be at least 3 players
  const canStart = playersList.length >= 3 && playersList.every(p => p.isReady);

  return (
    <div className="flex flex-col h-full py-6 space-y-8 animate-in fade-in duration-500">
      
      {/* 1. HEADER: ROOM INFO */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
            Mission Protocol
          </p>
          <p className="text-4xl font-mono font-bold text-violet-500 tracking-[0.2em] leading-none">
            {room.code}
          </p>
        </div>
        
        <button 
          onClick={onLeave} 
          className="group flex flex-col items-end gap-1 opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest group-hover:underline decoration-red-500/50 underline-offset-4">
            Abort
          </span>
          {/* Subtle Icon */}
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-shadow" />
        </button>
      </div>

      {/* 2. OPERATIVES LIST */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Operatives Online
          </h2>
          <span className="text-[10px] font-mono text-slate-600">
            {playersList.length}/9
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {playersList.map((p) => {
            const isMe = p.id === playerId;
            
            return (
              <div 
                key={p.id} 
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                  isMe 
                    ? 'bg-slate-800/80 border-slate-700' 
                    : 'bg-slate-900/30 border-slate-800/50'
                }`}
              >
                {/* Left: Avatar & Name */}
                <div className="flex items-center gap-4">
                  {/* Status Dot */}
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    p.isReady 
                      ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                      : 'bg-slate-700'
                  }`} />
                  
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold tracking-wide ${isMe ? 'text-white' : 'text-slate-400'}`}>
                      {p.name}
                    </span>
                    {p.isHost && (
                      <span className="text-[9px] font-mono text-violet-500 uppercase tracking-wider">
                        Mission Host
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Text Status */}
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  p.isReady ? 'text-emerald-500' : 'text-slate-700'
                }`}>
                  {p.isReady ? 'Ready' : 'Standby'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CONTROLS AREA */}
      <div className="pt-6 border-t border-slate-800/50 space-y-4">
        
        {/* Toggle Ready Button */}
        <button
          onClick={onToggleReady}
          className={`w-full p-4 rounded-lg font-bold uppercase tracking-[0.2em] text-sm transition-all duration-300 ${
            currentPlayer?.isReady
              ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-default'
              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.15)] hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] active:scale-[0.98]'
          }`}
        >
          {currentPlayer?.isReady ? 'Status: Ready' : 'Mark Ready'}
        </button>

        {/* Host Launch Button */}
        {isHost && (
          <div className={`transition-all duration-500 ${canStart ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale'}`}>
            <button
              disabled={!canStart}
              onClick={onStartGame}
              className={`group relative w-full overflow-hidden rounded-lg p-4 transition-all ${
                !canStart ? 'cursor-not-allowed bg-slate-900 border border-slate-800' : ''
              }`}
            >
              {canStart ? (
                // Active State (Everyone Ready)
                <>
                  <div className="absolute inset-0 bg-slate-900 border border-emerald-500/50 group-hover:border-emerald-400 transition-colors" />
                  <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300" />
                  <span className="relative z-10 font-bold text-emerald-400 group-hover:text-white tracking-[0.2em] text-sm">
                    INITIATE MISSION
                  </span>
                </>
              ) : (
                // Disabled State
                <div className="flex flex-col items-center gap-1">
                   <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
                     Waiting for Operatives...
                   </span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};