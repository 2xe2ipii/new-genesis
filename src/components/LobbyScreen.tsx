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
  
  const canStart = playersList.length >= 3 && playersList.every(p => p.isReady);

  return (
    <div className="flex flex-col h-full py-6 space-y-6 animate-in fade-in duration-500">
      
      {/* 1. HEADER: ROOM INFO (Compact Version) */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 relative group overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
        
        <div className="flex justify-between items-center">
          <div>
             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
               Access Code
             </p>
             <p className="text-5xl font-mono font-black text-white tracking-widest leading-none">
               {room.code}
             </p>
          </div>

          <button 
            onClick={onLeave} 
            className="text-[10px] font-bold text-slate-600 hover:text-slate-300 uppercase tracking-widest transition-colors self-start"
          >
            LEAVE
          </button>
        </div>
      </div>

      {/* 2. AGENTS LIST */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Agents ({playersList.length}/9)
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {playersList.map((p) => {
            const isMe = p.id === playerId;
            
            return (
              <div 
                key={p.id} 
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 h-16 ${
                  p.isReady 
                    ? 'bg-violet-500/10 border-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.1)]' 
                    : isMe 
                      ? 'bg-slate-800 border-slate-700' 
                      : 'bg-slate-900/30 border-slate-800'
                }`}
              >
                {/* Left: Name & Host Icon */}
                <div className="flex items-center gap-3">
                  {p.isHost ? (
                    <div className="text-violet-500" title="Mission Host">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-4" /> 
                  )}
                  
                  <span className={`text-sm font-bold tracking-wider uppercase ${isMe ? 'text-white' : 'text-slate-400'}`}>
                    {p.name.toUpperCase()}
                  </span>
                </div>

                {/* Right: Status */}
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                  p.isReady ? 'text-violet-400' : 'text-slate-700'
                }`}>
                  {p.isReady ? 'READY' : 'STANDBY'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CONTROLS AREA */}
      <div className="pt-4 border-t border-slate-800/50 space-y-4">
        
        {/* Toggle Ready Button */}
        <button
          onClick={onToggleReady}
          className={`w-full p-4 rounded-lg font-bold uppercase tracking-[0.2em] text-sm transition-all duration-200 ${
            currentPlayer?.isReady
              ? 'bg-transparent border border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.2)]'
          }`}
        >
          {currentPlayer?.isReady ? 'CANCEL' : 'READY'}
        </button>

        {/* Host Launch Button */}
        {isHost && (
          <div className="transition-all duration-500">
            <button
              disabled={!canStart}
              onClick={onStartGame}
              className={`group relative w-full overflow-hidden rounded-lg p-4 transition-all ${
                !canStart 
                  ? 'cursor-not-allowed bg-slate-900/50 border-2 border-dashed border-slate-700' 
                  : ''
              }`}
            >
              {canStart ? (
                // Active State (Everyone Ready)
                <>
                  <div className="absolute inset-0 bg-slate-900 border border-violet-500/50 group-hover:border-violet-400 transition-colors" />
                  <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/10 transition-colors duration-300" />
                  <span className="relative z-10 font-bold text-violet-400 group-hover:text-white tracking-[0.2em] text-sm font-mono">
                    INITIATE_PROTOCOL
                  </span>
                </>
              ) : (
                // Disabled State (Waiting)
                <div className="flex justify-center">
                   <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                     WAITING FOR AGENTS...
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