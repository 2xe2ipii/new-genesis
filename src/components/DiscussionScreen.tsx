// src/components/DiscussionScreen.tsx
import React, { useState } from 'react';
import type { Room, AbilityCard } from '../types';
import { useTimer } from '../hooks/useTimer';
import { RevealScreen } from './RevealScreen';
import { AnimatePresence, motion } from 'framer-motion';

// --- DATA: GAME MANUAL CONTENT ---
const MANUAL_DATA = {
  roles: [
    { title: 'LOCAL', type: 'Majority', desc: 'Identify the Spy. Win by voting them out or if the Timer runs out (unless Spy guesses the word).' },
    { title: 'SPY', type: 'Threat', desc: 'Blend in. You do not know the word. Win by surviving the vote or guessing the secret word.' },
    { title: 'JOKER', type: 'Neutral', desc: 'Chaos Agent. You appear as a THREAT on Radar. Win specifically by getting voted out.' },
    { title: 'TOURIST', type: 'Neutral', desc: 'Observer. You appear as a THREAT on Radar. Win by betting on the winning team (Spy or Locals).' }
  ],
  items: [
    { title: 'RADAR', desc: 'Scans a player. Returns SAFE (Local) or THREAT (Spy, Joker, Tourist). Can be fooled by Spoof.' },
    { title: 'SILENCER', desc: 'Select a player to block their vote in the upcoming Tribal Council.' },
    { title: 'SPOOF', desc: 'Select a player. For this round, their Radar signature is flipped (Safe becomes Threat, Threat becomes Safe).' }
  ]
};

interface DiscussionScreenProps {
  room: Room;
  playerId: string;
  onUseCard: (targetId: string) => void;
  onVoteToSkip: () => void;
  onTimeout?: () => void;
}

export const DiscussionScreen: React.FC<DiscussionScreenProps> = ({
  room,
  playerId,
  onUseCard,
  onVoteToSkip,
  onTimeout,
}) => {
  const [hasRevealed, setHasRevealed] = useState(room.round > 1);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualTab, setManualTab] = useState<'roles' | 'items'>('roles');
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);
  
  const { minutes, seconds } = useTimer(room.timerEndTime);
  const me = room.players[playerId];

  // Auto-timeout for Host
  React.useEffect(() => {
    if (me.isHost && room.timerEndTime > 0 && minutes === 0 && seconds === '00' && onTimeout) {
      onTimeout();
    }
  }, [minutes, seconds, me.isHost, onTimeout, room.timerEndTime]);
  
  const playersList = Object.values(room.players);
  const activePlayersCount = playersList.filter(p => !p.isEliminated).length;
  const skipVotesCount = room.votesToSkipDiscussion?.length || 0;
  const hasVotedToSkip = room.votesToSkipDiscussion?.includes(playerId);

  const [isTargeting, setIsTargeting] = useState(false);
  const messages = room.systemMessages
    ? Object.values(room.systemMessages).sort((a: any, b: any) => b.timestamp - a.timestamp)
    : [];
  const latestMessage = messages.length > 0 ? (messages[0] as any) : null;

  if (me.isEliminated) {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center p-6 text-center font-mono">
        <div className="text-red-600/20 text-9xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 mx-auto animate-pulse"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
        </div>
        <h1 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-2">Terminated</h1>
        <p className="text-slate-500 max-w-xs uppercase tracking-wider text-xs">You have been removed from the protocol.</p>
      </div>
    );
  }

  if (!hasRevealed) {
    return <RevealScreen player={me} wordType={room.wordType} onReadyToDiscuss={() => setHasRevealed(true)} />;
  }

  const toggleTargeting = () => {
    if (me.abilityCard && !me.isCardUsed) setIsTargeting(!isTargeting);
  };

  const initiateUseCard = (targetId: string) => {
    setPendingTarget(targetId);
  };

  const confirmUseCard = () => {
    if (pendingTarget) {
      onUseCard(pendingTarget);
      setPendingTarget(null);
      setIsTargeting(false);
    }
  };

  const isUrgent = Number(minutes) === 0 && Number(seconds) < 30;

  const getCardConfig = (card: AbilityCard | string) => {
    switch (card) {
      case 'RADAR':
        return {
          icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a9.75 9.75 0 11-19.5 0 9.75 9.75 0 0119.5 0zM12 5.25a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5z" /></svg>,
          color: 'text-emerald-400',
          border: 'border-emerald-500',
          bg: 'bg-emerald-950',
          targetIcon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" /></svg>,
          label: 'SCANNER',
        };
      case 'SILENCER':
        return {
          icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.5 12a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0z" /></svg>,
          color: 'text-rose-500',
          border: 'border-rose-500',
          bg: 'bg-rose-950',
          targetIcon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" /><path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>,
          label: 'SILENCER',
        };
      case 'SPOOF':
        return {
          icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 6a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9A.75.75 0 0112 8.25zm0 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>,
          color: 'text-purple-400',
          border: 'border-purple-500',
          bg: 'bg-purple-950',
          targetIcon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>,
          label: 'SPOOF',
        };
      default: return null;
    }
  };

  const cardConfig = me.abilityCard ? getCardConfig(me.abilityCard) : null;
  const targetName = me.isCardUsed && me.cardTargetId ? room.players[me.cardTargetId]?.name : null;

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden font-mono">
      {/* --- TOP BAR --- */}
      <div className="flex justify-between items-stretch h-20 border-b border-slate-800 bg-slate-900/50 relative">
        {/* GLOBAL MANUAL BUTTON */}
        <button 
          onClick={() => setIsManualOpen(true)}
          className="absolute top-2 right-2 z-50 p-2 text-slate-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
             <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col justify-center items-center border-r border-slate-800 p-2">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Time</p>
          <div className={`text-3xl font-black tracking-tighter ${isUrgent ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {minutes}:{seconds}
          </div>
        </div>
        <div className="flex-[2] flex flex-col justify-center items-center p-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-violet-500/5 group-hover:bg-violet-500/10 transition-colors" />
          <p className="text-[9px] text-violet-400 uppercase tracking-widest mb-1">
            {room.wordType === 'question' ? 'Secret Question' : 'Passphrase'}
          </p>
          <p className={`${
            room.wordType === 'question' 
              ? 'text-[10px] leading-3 line-clamp-3 text-center whitespace-normal' 
              : 'text-xl truncate whitespace-nowrap'
            } font-bold text-white uppercase tracking-wider max-w-full px-2`}
          >
            {me.secretWord || '???'}
          </p>
        </div>
      </div>

      {/* --- TICKER --- */}
      <div className="bg-slate-900/80 border-b border-slate-800 h-8 flex items-center px-4 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 animate-pulse" />
        <AnimatePresence mode="wait">
          {latestMessage ? (
            <motion.p
              key={latestMessage.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-[10px] font-mono font-bold uppercase tracking-wider truncate ${
                latestMessage.text.includes('THREAT') ? 'text-red-500' : latestMessage.text.includes('SAFE') ? 'text-emerald-400' : 'text-blue-300'
              }`}
            >
              {`>> ${latestMessage.text}`}
            </motion.p>
          ) : (
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">// CHANNEL OPEN</p>
          )}
        </AnimatePresence>
      </div>

      {/* --- PLAYERS GRID --- */}
      <div className="flex-1 p-4 flex flex-col justify-center relative overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {playersList.map((p: any) => {
            const isMe = p.id === me.id;
            let isInteractable = false;

            if (isTargeting) {
              if (me.abilityCard === 'SILENCER' && isMe) isInteractable = false;
              else isInteractable = true;
            } else {
              isInteractable = isMe;
            }

            const isDead = p.isEliminated;

            return (
              <button
                key={p.id}
                disabled={(isTargeting && !isInteractable) || (!isTargeting && !isMe) || isDead}
                onClick={() => isTargeting ? initiateUseCard(p.id) : null}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                  isDead 
                    ? 'opacity-30 border border-slate-900 grayscale cursor-not-allowed'
                    : isTargeting && isInteractable
                      ? `${cardConfig?.bg} border-2 ${cardConfig?.border} shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-100 z-10`
                      : isMe
                        ? 'bg-indigo-500/10 border border-indigo-500/50'
                        : 'bg-slate-900/40 border border-slate-800 opacity-60'
                }`}
              >
                <span className="text-sm font-bold uppercase truncate w-full text-center tracking-wide text-white">
                  {p.name}
                </span>
                {isDead && <span className="text-[8px] text-red-500 mt-1 font-black">DEAD</span>}
                {isTargeting && isInteractable && !isDead && cardConfig && (
                  <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${cardConfig.color} opacity-40`}>
                    {cardConfig.targetIcon}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- BOTTOM ACTIONS --- */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
        
        {/* --- CLICKABLE ITEM CONTAINER --- */}
        {cardConfig && (
          <button
            disabled={me.isCardUsed}
            onClick={toggleTargeting}
            className={`w-full h-20 rounded-xl border transition-all relative overflow-hidden group text-left ${
              me.isCardUsed
                ? 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
                : isTargeting
                  ? `${cardConfig.bg}/20 ${cardConfig.border} shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer`
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-800/80 cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between p-3 h-full relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${
                    me.isCardUsed ? 'text-slate-600 bg-slate-900' : `${cardConfig.color} ${cardConfig.bg}/50 border border-white/10`
                  }`}
                >
                  {React.cloneElement(cardConfig.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                </div>
                
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Item</span>
                  <span className={`text-base font-black uppercase tracking-wider ${me.isCardUsed ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {cardConfig.label}
                  </span>
                </div>
              </div>

              {/* STATUS TEXT INDICATOR */}
              <div className="pr-2">
                 {me.isCardUsed ? (
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">DEPLETED</span>
                 ) : isTargeting ? (
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest animate-pulse flex items-center gap-2">
                     <span className="w-2 h-2 bg-white rounded-full"></span>
                     ARMED
                   </span>
                 ) : (
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">
                     TAP TO ARM
                   </span>
                 )}
              </div>
            </div>
            {!me.isCardUsed && isTargeting && <div className={`absolute inset-0 ${cardConfig.bg}/10 animate-[scan_2s_ease-in-out_infinite] pointer-events-none`} />}
            {me.isCardUsed && targetName && <p className="absolute bottom-1 w-full text-center text-[9px] text-yellow-500 font-bold uppercase z-10">Target: {targetName}</p>}
          </button>
        )}

        {/* --- VOTE SKIP BUTTON --- */}
        <button
          onClick={onVoteToSkip}
          className={`w-full h-20 rounded-xl font-black uppercase tracking-wider text-sm transition-all shadow-xl relative overflow-hidden flex items-center justify-center ${
            hasVotedToSkip
              ? 'bg-slate-900 border-2 border-violet-500/50 text-white'
              : 'bg-slate-900 border-2 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 bg-violet-600 transition-all duration-500"
            style={{ width: `${(skipVotesCount / activePlayersCount) * 100}%` }}
          />

          <div className="relative z-10 flex flex-col items-center justify-center gap-1">
             {hasVotedToSkip ? (
               <span className="text-white drop-shadow-md">CONFIRMED</span>
             ) : (
               <span>PROCEED TO VOTE</span>
             )}
             
             {hasVotedToSkip && <span className="text-[10px] opacity-75 font-medium">WAITING FOR TEAM...</span>}
          </div>
        </button>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {pendingTarget && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
           >
             <div className="bg-slate-900 border-2 border-white/10 w-full max-w-xs p-6 rounded-2xl shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm Target</p>
                  <p className="text-2xl font-black text-white uppercase">
                    {room.players[pendingTarget]?.name}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setPendingTarget(null)}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl uppercase tracking-wider text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmUseCard}
                    className="flex-1 py-3 bg-white text-black font-bold rounded-xl uppercase tracking-wider text-xs hover:bg-slate-200"
                  >
                    Confirm
                  </button>
                </div>
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* --- GLOBAL MANUAL MODAL --- */}
      <AnimatePresence>
        {isManualOpen && (
           <motion.div 
             initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
             className="absolute inset-0 z-50 bg-slate-950 flex flex-col p-6 overflow-hidden"
           >
             {/* Header */}
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h2 className="text-2xl font-black uppercase tracking-widest text-white">Field Manual</h2>
               <button onClick={() => setIsManualOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
             
             {/* Tabs */}
             <div className="flex gap-2 mb-4">
               <button 
                 onClick={() => setManualTab('roles')}
                 className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded transition-colors ${manualTab === 'roles' ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-500'}`}
               >
                 Roles
               </button>
               <button 
                 onClick={() => setManualTab('items')}
                 className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded transition-colors ${manualTab === 'items' ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-500'}`}
               >
                 Items
               </button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto space-y-4 pr-1">
               {manualTab === 'roles' ? (
                 MANUAL_DATA.roles.map((role) => (
                   <div key={role.title} className="bg-slate-900/50 p-4 rounded border-l-2 border-violet-500">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-black text-white uppercase tracking-wider">{role.title}</span>
                       <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded">{role.type}</span>
                     </div>
                     <p className="text-xs text-slate-400 leading-relaxed">{role.desc}</p>
                   </div>
                 ))
               ) : (
                 MANUAL_DATA.items.map((item) => (
                   <div key={item.title} className="bg-slate-900/50 p-4 rounded border-l-2 border-amber-500">
                     <span className="block font-black text-white uppercase tracking-wider mb-1">{item.title}</span>
                     <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                   </div>
                 ))
               )}
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};