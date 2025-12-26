// src/components/VotingScreen.tsx
import React, { useState, useEffect } from 'react';
import type { Room } from '../types';

interface VotingScreenProps {
  room: Room;
  playerId: string;
  onVote: (targetId: string) => void;
  onCheckCompletion: () => void;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({ room, playerId, onVote, onCheckCompletion }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const me = room.players[playerId];
  const players = Object.values(room.players);

  // Trigger host check whenever data changes
  useEffect(() => {
    if (me.isHost) {
      onCheckCompletion();
    }
  }, [room, me.isHost, onCheckCompletion]);

  // Calculate Real-Time Votes
  const getVoteCount = (targetId: string) => {
    return players.filter(p => p.votedFor === targetId && !p.isSilenced).length;
  };

  const maxVotes = Math.max(...players.map(p => getVoteCount(p.id)), 1);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white font-mono overflow-hidden relative">
      
      {/* 1. HEADER: Tactical/System Vibe */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-black text-rose-500 uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(244,63,94,0.5)] text-center animate-pulse">
          ELIMINATION_PROTOCOL
        </h1>
        <p className="text-center text-[10px] text-slate-500 tracking-widest mt-2 uppercase">
          {me.isVoteLocked 
            ? "VOTE LOCKED // AWAITING CONSENSUS..." 
            : "SELECT TARGET FOR EJECTION"}
        </p>
      </div>

      {/* 2. PLAYER LIST: Data Rows */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0">
        {players.map(p => {
          const voteCount = getVoteCount(p.id);
          const isSelected = selectedId === p.id;
          const isMe = p.id === playerId;
          
          return (
            <button
              key={p.id}
              disabled={me.isVoteLocked}
              onClick={() => setSelectedId(p.id)}
              className={`w-full relative group transition-all duration-300 border rounded-lg overflow-hidden ${
                isSelected 
                  ? 'bg-rose-950/30 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
              } ${me.isVoteLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              {/* Card Content */}
              <div className="p-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                   {/* Avatar / Letter */}
                   <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs border ${
                      isSelected 
                        ? 'bg-rose-900/50 border-rose-500 text-rose-200' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                   }`}>
                      {p.name.charAt(0)}
                   </div>

                   {/* Name & Status */}
                   <div className="flex flex-col items-start">
                      <span className={`text-sm font-bold uppercase tracking-wider ${
                        isSelected ? 'text-white' : 'text-slate-300'
                      }`}>
                        {p.name} {isMe && <span className="text-[9px] text-slate-500 ml-2">// SELF</span>}
                      </span>
                      {p.isSilenced && (
                        <span className="text-[8px] text-rose-500 font-bold tracking-widest animate-pulse">
                          [VOICE_DISABLED]
                        </span>
                      )}
                   </div>
                </div>

                {/* Vote Count Indicator (Only visible if I locked vote) */}
                {me.isVoteLocked && (
                   <div className="text-xl font-black text-rose-500 tracking-tighter">
                      {voteCount.toString().padStart(2, '0')}
                   </div>
                )}
              </div>

              {/* Progress Bar (Thin Line Logic) */}
              {me.isVoteLocked && voteCount > 0 && (
                <div className="absolute bottom-0 left-0 h-1 bg-rose-500 transition-all duration-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                     style={{ width: `${(voteCount / maxVotes) * 100}%` }} 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. FOOTER ACTION */}
      <div className="p-4 border-t border-slate-800 bg-slate-900 z-20">
        {!me.isVoteLocked ? (
          <button
            disabled={!selectedId}
            onClick={() => selectedId && onVote(selectedId)}
            className={`w-full p-4 rounded font-bold uppercase tracking-[0.2em] text-sm transition-all duration-300 border ${
               selectedId 
                 ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:bg-rose-500' 
                 : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {selectedId ? "CONFIRM_EJECTION >>" : "SELECT TARGET"}
          </button>
        ) : (
          <div className="w-full p-4 rounded border border-slate-700 bg-slate-800/50 text-center">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">
              AWAITING FINAL RESULTS...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};