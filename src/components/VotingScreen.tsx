// src/components/VotingScreen.tsx
import React, { useState, useEffect } from 'react';
import type { Room } from '../types';

interface VotingScreenProps {
  room: Room;
  playerId: string;
  onVote: (targetId: string) => void;
  onCheckCompletion: () => void; // Trigger for Host
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

  // Calculate Real-Time Votes (Only meaningful if I have voted)
  const getVoteCount = (targetId: string) => {
    return players.filter(p => p.votedFor === targetId && !p.isSilenced).length;
  };

  // Calculate max votes for progress bar scaling
  const maxVotes = Math.max(...players.map(p => getVoteCount(p.id)), 1);

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-red-500 uppercase tracking-widest animate-pulse">
          Who is the Spy?
        </h1>
        <p className="text-slate-400 text-sm">
          {me.isVoteLocked ? "Waiting for others..." : "Select a player to eliminate."}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {players.map(p => {
          const voteCount = getVoteCount(p.id);
          const isSelected = selectedId === p.id;
          
          return (
            <div key={p.id} className="relative">
              <button
                disabled={me.isVoteLocked}
                onClick={() => setSelectedId(p.id)}
                className={`w-full relative z-10 p-4 rounded-xl border-2 transition-all text-left flex justify-between items-center ${
                  isSelected 
                    ? 'bg-red-500/20 border-red-500' 
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                } ${me.isVoteLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold text-xs text-white">
                    {p.name.charAt(0)}
                  </div>
                  <span className="font-bold text-white">{p.name}</span>
                  {p.isSilenced && <span className="text-[10px] text-red-400 font-bold ml-2">(SILENCED)</span>}
                </div>
                
                {/* Vote Count (Hidden until I lock my vote) */}
                {me.isVoteLocked && (
                  <span className="font-black text-xl text-white">{voteCount}</span>
                )}
              </button>

              {/* Real-time Bar Background */}
              {me.isVoteLocked && voteCount > 0 && (
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-red-600/30 rounded-xl z-0 transition-all duration-500"
                  style={{ width: `${(voteCount / maxVotes) * 100}%` }}
                />
              )}
            </div>
          );
        })}
      </div>

      {!me.isVoteLocked && (
        <button
          disabled={!selectedId}
          onClick={() => selectedId && onVote(selectedId)}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 p-5 rounded-xl font-black text-white text-xl uppercase tracking-widest shadow-lg shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          LOCK IN VOTE
        </button>
      )}
    </div>
  );
};