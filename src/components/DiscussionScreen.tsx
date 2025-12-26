// src/components/DiscussionScreen.tsx
import React, { useState } from 'react';
import type { Room, AbilityCard } from '../types';
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
  
  // FIX: votesToSkipDiscussion is an Array, so we must use .includes()
  // We use optional chaining (?.) just in case the array is undefined initially
  const hasVotedToSkip = room.votesToSkipDiscussion?.includes(playerId);
  
  // Local state for "Arming" the ability
  const [isTargeting, setIsTargeting] = useState(false);

  if (!hasRevealed) {
    return (
      <RevealScreen 
        player={me} 
        onReadyToDiscuss={() => setHasRevealed(true)} 
      />
    );
  }

  // ... (Rest of the file remains exactly the same)
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

  const isUrgent = Number(minutes) === 0 && Number(seconds) < 30;

  const getItemIcon = (card: AbilityCard) => {
    if (card === 'RADAR') return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
    if (card === 'INTERCEPT') return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    if (card === 'SILENCER') return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden font-mono">
      
      {/* 1. TOP HUD */}
      <div className="flex justify-between items-stretch h-20 border-b border-slate-800 bg-slate-900/50">
        {/* Timer */}
        <div className="flex-1 flex flex-col justify-center items-center border-r border-slate-800 p-2">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Time Remaining</p>
          <div className={`text-3xl font-black tracking-tighter ${isUrgent ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {minutes}:{seconds}
          </div>
        </div>

        {/* Word */}
        <div className="flex-1 flex flex-col justify-center items-center p-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-violet-500/5 group-hover:bg-violet-500/10 transition-colors" />
          <p className="text-[9px] text-violet-400 uppercase tracking-widest mb-1">Passphrase</p>
          <p className="text-lg font-bold text-white uppercase tracking-wider truncate max-w-full px-2">
            {me.secretWord || "???"}
          </p>
        </div>
      </div>

      {/* 2. SURVEILLANCE GRID */}
      <div className="flex-1 p-4 flex flex-col justify-center">
        <div className="grid grid-cols-3 gap-3">
          {playersList.map(p => {
            const isMe = p.id === me.id;
            const isValidTarget = isTargeting && !isMe;
            
            return (
              <button
                key={p.id}
                disabled={!isValidTarget && !isMe} 
                onClick={() => handlePlayerTap(p.id)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all duration-300 border ${
                  isMe 
                    ? 'bg-slate-800 border-slate-600 opacity-100' 
                    : isValidTarget
                      ? 'bg-amber-900/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer animate-pulse' 
                      : 'bg-slate-900/50 border-slate-800 opacity-60' 
                }`}
              >
                {/* Name Only */}
                <span className={`text-xs font-black uppercase truncate w-full text-center tracking-wider ${isValidTarget ? 'text-amber-400' : 'text-slate-300'}`}>
                  {p.name}
                </span>

                {isMe && <span className="text-[8px] text-slate-500 mt-1 uppercase">UNIT_SELF</span>}

                {/* Target Overlay Icon */}
                {isValidTarget && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-amber-500 opacity-30">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                       <path d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" />
                     </svg>
                   </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TACTICAL FOOTER */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
        
        {/* WEAPON SLOT */}
        {me.abilityCard && (
           <button
             disabled={me.isCardUsed}
             onClick={toggleTargeting}
             className={`w-full h-14 flex items-center justify-between px-4 rounded border transition-all relative overflow-hidden group ${
                me.isCardUsed 
                  ? 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
                  : isTargeting 
                    ? 'bg-amber-950/30 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
             }`}
           >
             <div className="flex items-center gap-3 z-10">
               <div className={`p-1.5 rounded ${me.isCardUsed ? 'text-slate-600 bg-slate-900' : 'text-amber-500 bg-amber-950/50 border border-amber-500/30'}`}>
                 {getItemIcon(me.abilityCard)}
               </div>
               <div className="flex flex-col items-start">
                 <span className={`text-[9px] font-bold uppercase tracking-widest ${me.isCardUsed ? 'text-slate-600' : 'text-amber-600'}`}>
                   Active Module
                 </span>
                 <span className={`text-sm font-black uppercase tracking-wider ${me.isCardUsed ? 'text-slate-500 line-through' : 'text-white'}`}>
                   {me.abilityCard}
                 </span>
               </div>
             </div>

             <div className="z-10">
                {me.isCardUsed ? (
                   <span className="text-[10px] font-bold text-slate-600 uppercase">DEPLETED</span>
                ) : isTargeting ? (
                   <span className="text-[10px] font-bold text-amber-500 uppercase animate-pulse">SELECT TARGET</span>
                ) : (
                   <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase">TAP TO ARM</span>
                )}
             </div>

             {!me.isCardUsed && isTargeting && (
                <div className="absolute inset-0 bg-amber-500/5 animate-[scan_2s_ease-in-out_infinite]" />
             )}
           </button>
        )}

        {/* VOTE TO SKIP BUTTON */}
        <button
          disabled={!!hasVotedToSkip}
          onClick={onVoteToSkip}
          className={`w-full p-4 rounded-lg font-bold uppercase tracking-[0.2em] text-xs transition-all border ${
            hasVotedToSkip
              ? 'bg-transparent border-slate-700 text-slate-500 cursor-default'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-600 hover:border-slate-500 active:scale-[0.98]'
          }`}
        >
          {hasVotedToSkip ? (
            <span className="flex items-center justify-center gap-2 animate-pulse">
              <span>VOTE REGISTERED</span>
              <span className="text-slate-600">//</span>
              <span>WAITING</span>
            </span>
          ) : (
            "INITIATE VOTE_SKIP"
          )}
        </button>
      </div>
    </div>
  );
};