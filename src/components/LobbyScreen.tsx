// src/components/LobbyScreen.tsx
import React from 'react';
import type { Room } from '../types';

interface LobbyScreenProps {
  room: Room;
  playerId: string;
  onToggleReady: () => void;
  onStartGame: () => void; // We will implement this later
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
  const allReady = playersList.length > 2 && playersList.every(p => p.isReady); // Min 3 players?

  return (
    <div className="flex flex-col h-full py-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
        <div>
          <p className="text-xs text-slate-400 uppercase font-bold">Access Code</p>
          <p className="text-3xl font-black font-mono tracking-widest text-white">{room.code}</p>
        </div>
        <button onClick={onLeave} className="text-xs text-red-400 font-bold hover:text-red-300">
          ABORT
        </button>
      </div>

      {/* Players List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <h2 className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">
          Operatives ({playersList.length})
        </h2>
        
        {playersList.map((p) => (
          <div 
            key={p.id} 
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              p.isReady 
                ? 'bg-green-500/10 border-green-500/50' 
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${p.isReady ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`} />
              <span className={`font-bold ${p.id === playerId ? 'text-white' : 'text-slate-300'}`}>
                {p.name} {p.id === playerId && '(You)'}
              </span>
            </div>
            {p.isHost && (
              <span className="text-[10px] bg-purple-600 px-2 py-1 rounded text-white font-bold tracking-wider">
                HOST
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <button
          onClick={onToggleReady}
          className={`w-full p-5 rounded-xl font-black text-lg tracking-widest transition-all ${
            currentPlayer?.isReady
              ? 'bg-slate-700 text-slate-400'
              : 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
          }`}
        >
          {currentPlayer?.isReady ? 'WAITING FOR OTHERS...' : 'MARK READY'}
        </button>

        {isHost && (
          <button
            disabled={!allReady}
            onClick={onStartGame}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl font-black text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
          >
            INITIATE MISSION
          </button>
        )}
      </div>
    </div>
  );
};