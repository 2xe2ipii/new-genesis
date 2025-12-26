// src/components/DiscussionScreen.tsx
import React, { useState } from 'react';
import type { Room } from '../types';
import { useTimer } from '../hooks/useTimer';
import { RevealScreen } from './RevealScreen';

interface DiscussionScreenProps {
  room: Room;
  playerId: string;
  onUseCard: (targetId: string) => void;
  onVoteToSkip: () => void;
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
  
  // Local state for "Arming" the ability (to prevent accidental taps)
  const [isTargeting, setIsTargeting] = useState(false);

  if (!hasRevealed) {
    return (
      <RevealScreen 
        player={me} 
        onReadyToDiscuss={() => setHasRevealed(true)} 
      />
    );
  }

  // Helper to handle card logic
  const canUseAbility = me.abilityCard && !me.isCardUsed;
  const toggleTargeting = () => {
    if (canUseAbility) setIsTargeting(!isTargeting);
  };

  const handlePlayerTap = (targetId: string) => {
    if (isTargeting && targetId !== me.id) {
      onUseCard(targetId);
      setIsTargeting(false);
    }
  };

  // Safe timer check (convert to Number to avoid TS errors if they are strings)
  const isUrgent = Number(minutes) === 0 && Number(seconds) < 30;

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden font-mono">
      
      {/* 1. TOP HUD (Timer & Word) */}
      <div className="flex justify-between items-stretch h-24 border-b border-slate-800 bg-slate-900/50">
        {/* Timer Section */}
        <div className="flex-1 flex flex-col justify-center items-center border-r border-slate-800 p-2">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Time Remaining</p>
          <div className={`text-4xl font-black tracking-tighter ${isUrgent ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {minutes}:{seconds}
          </div>
        </div>

        {/* Word Section */}
        <div className="flex-1 flex flex-col justify-center items-center p-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-violet-500/5 group-hover:bg-violet-500/10 transition-colors" />
          <p className="text-[9px] text-violet-400 uppercase tracking-widest mb-1">Passphrase</p>
          <p className="text-xl font-bold text-white uppercase tracking-wider truncate max-w-full px-2">
            {me.secretWord || "???"}
          </p>
        </div>
      </div>

      {/* 2. SURVEILLANCE GRID (The Players) */}
      <div className="flex-1 p-4 flex flex-col justify-center">
        {/* The Grid */}
        <div className="grid grid-cols-3 gap-3">
          {playersList.map(p => {
            const isMe = p.id === me.id;
            // Visual state: Are we in targeting mode? Is this a valid target?
            const isValidTarget = isTargeting && !isMe;
            
            return (
              <button
                key={p.id}
                disabled={!isValidTarget && !isMe} // Disable click unless targeting or it's me (optional interaction)
                onClick={() => handlePlayerTap(p.id)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-300 border-2 ${
                  isMe 
                    ? 'bg-slate-800 border-slate-600 opacity-100' // Me
                    : isValidTarget
                      ? 'bg-amber-900/20 border-amber-500/50 hover:bg-amber-500/20 cursor-pointer animate-pulse' // Targetable
                      : 'bg-slate-900/50 border-slate-800 opacity-80' // Standard
                }`}
              >
                {/* Avatar Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                  isMe ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {p.name.charAt(0)}
                </div>

                {/* Name */}
                <span className={`text-[10px] font-bold uppercase truncate w-full text-center ${isValidTarget ? 'text-amber-400' : 'text-slate-400'}`}>
                  {p.name}
                </span>

                {/* Target Overlay Icon */}
                {isValidTarget && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-amber-500 opacity-30">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                       <path d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" />
                     </svg>
                   </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TACTICAL FOOTER (Item & Vote) */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-4">
        
        {/* ABILITY INTERFACE (Only if you have one) */}
        {me.abilityCard && (
          <div className="flex items-center gap-3">
             {/* Status Light */}
             <div className={`h-12 w-1 rounded-full ${me.isCardUsed ? 'bg-red-900' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
             
             <div className="flex-1">
               <div className="flex justify-between items-center mb-1">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hardware</p>
                 <p className={`text-[9px] font-bold uppercase ${me.isCardUsed ? 'text-red-700' : 'text-amber-500'}`}>
                   {me.isCardUsed ? 'OFFLINE' : 'READY'}
                 </p>
               </div>
               
               <button 
                 disabled={me.isCardUsed}
                 onClick={toggleTargeting}
                 className={`w-full text-left p-2 rounded border border-dashed transition-all ${
                   me.isCardUsed 
                     ? 'border-slate-800 text-slate-600 bg-slate-950' 
                     : isTargeting 
                       ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                       : 'border-slate-700 hover:border-amber-500/50 text-slate-300'
                 }`}
               >
                 <span className="text-xs font-bold uppercase tracking-wider">
                   {me.isCardUsed 
                     ? `[ ${me.abilityCard} DEPLETED ]` 
                     : isTargeting 
                       ? `[ TAP TARGET IN GRID ]` 
                       : `[ ACTIVATE ${me.abilityCard} ]`
                   }
                 </span>
               </button>
             </div>
          </div>
        )}

        {/* VOTE TO END BUTTON */}
        <button
          onClick={onVoteToSkip}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 p-4 rounded-lg font-bold uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98]"
        >
          VOTE TO END_DISCUSSION
        </button>
      </div>
    </div>
  );
};