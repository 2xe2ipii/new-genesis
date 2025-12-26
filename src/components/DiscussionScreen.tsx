// src/components/DiscussionScreen.tsx
import React, { useState } from 'react';
import type { Room } from '../types';
import { useTimer } from '../hooks/useTimer';
import { RevealScreen } from './RevealScreen';

interface DiscussionScreenProps {
  room: Room;
  playerId: string;
  onUseCard: (targetId: string) => void; // We'll implement logic later
  onVoteToSkip: () => void; // Logic to toggle "Ready to Vote"
}

export const DiscussionScreen: React.FC<DiscussionScreenProps> = ({ 
  room, 
  playerId, 
  onUseCard,
  onVoteToSkip 
}) => {
  const [hasRevealed, setHasRevealed] = useState(false);
  const { minutes, seconds } = useTimer(room.timerEndTime);
  const me = room.players[playerId];
  const playersList = Object.values(room.players);

  // If I haven't scratched yet, show the Reveal Overlay
  if (!hasRevealed) {
    return (
      <RevealScreen 
        player={me} 
        onReadyToDiscuss={() => setHasRevealed(true)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      
      {/* 1. Header: The Timer */}
      <div className="flex justify-between items-center p-4 bg-slate-800/80 border-b border-slate-700 backdrop-blur-md sticky top-0 z-10">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Time Remaining</p>
          <div className={`text-4xl font-black font-mono tracking-tighter ${minutes === 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {minutes}:{seconds}
          </div>
        </div>
        
        {/* Mini Role Reminder */}
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Your Word</p>
          <p className="text-xl font-bold text-purple-400">{me.secretWord || "???"}</p>
        </div>
      </div>

      {/* 2. Main Body: The Players */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        <p className="text-xs text-slate-500 uppercase font-bold text-center mb-4">
          Identify the Spy
        </p>

        {playersList.map(p => (
          <div key={p.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold text-xs text-slate-300">
                {p.name.charAt(0)}
              </div>
              <span className="text-slate-200 font-bold">{p.name}</span>
            </div>
            
            {/* Card Target Actions (Only show if I have a card and haven't used it) */}
            {me.abilityCard && !me.isCardUsed && p.id !== me.id && (
               <button 
                 onClick={() => onUseCard(p.id)}
                 className="text-[10px] bg-indigo-600 px-3 py-1 rounded-full text-white font-bold hover:bg-indigo-500"
               >
                 TARGET
               </button>
            )}
          </div>
        ))}
      </div>

      {/* 3. Footer: Your Tools */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 space-y-3">
        
        {/* Ability Card Slot */}
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-[10px] text-slate-500 uppercase font-bold">Ability Card</p>
               <p className="text-sm font-bold text-yellow-400">
                 {me.abilityCard || "NO INTEL"}
               </p>
             </div>
             {me.isCardUsed && <span className="text-[10px] text-red-500 font-bold">USED</span>}
           </div>
           
           {me.abilityCard && !me.isCardUsed && (
             <p className="text-[10px] text-slate-400 mt-1 leading-tight">
               {me.abilityCard === 'INTERCEPT' && "Tap to see 1st letter of Enemy word."}
               {me.abilityCard === 'RADAR' && "Tap a player above to scan Safe/Threat."}
               {me.abilityCard === 'SILENCER' && "Tap a player above to nullify their vote."}
             </p>
           )}
           
           {/* Special Case: Intercept doesn't target a player, it's self-use */}
           {me.abilityCard === 'INTERCEPT' && !me.isCardUsed && (
             <button 
               onClick={() => onUseCard(me.id)} // Target self to trigger
               className="mt-2 w-full bg-yellow-600/20 text-yellow-500 border border-yellow-600/50 py-2 rounded text-xs font-bold uppercase"
             >
               Revealing Intel...
             </button>
           )}
        </div>

        {/* Skip to Vote Button */}
        <button
          onClick={onVoteToSkip}
          className="w-full bg-slate-700 text-slate-300 p-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-red-900/50 hover:text-red-200 transition-colors"
        >
          Vote to End Discussion
        </button>
      </div>
      
    </div>
  );
};