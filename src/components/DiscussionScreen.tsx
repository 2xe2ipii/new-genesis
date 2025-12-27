// src/components/DiscussionScreen.tsx
import React, { useState } from 'react';
import type { Room, AbilityCard } from '../types';
import { useTimer } from '../hooks/useTimer';
import { RevealScreen } from './RevealScreen';
import { AnimatePresence, motion } from 'framer-motion';

interface DiscussionScreenProps {
  room: Room;
  playerId: string;
  onUseCard: (targetId: string) => void;
  onVoteToSkip: () => void;
  onTimeout?: () => void; // <--- NEW PROP
}

export const DiscussionScreen: React.FC<DiscussionScreenProps> = ({
  room,
  playerId,
  onUseCard,
  onVoteToSkip,
  onTimeout, // <--- 1. Make sure onTimeout is destructured here
}) => {
  // KEEP your existing logic: Skip reveal if it's Round 2+
  const [hasRevealed, setHasRevealed] = useState(room.round > 1);
  const { minutes, seconds } = useTimer(room.timerEndTime);
  const me = room.players[playerId];

  // FIX: Host monitors the timer. If it hits 00:00, force the voting phase.
  React.useEffect(() => {
    // We add room.timerEndTime > 0 to prevent accidental triggers during game initialization
    if (me.isHost && room.timerEndTime > 0 && minutes === 0 && seconds === '00' && onTimeout) {
      onTimeout();
    }
  }, [minutes, seconds, me.isHost, onTimeout, room.timerEndTime]);
  
  const playersList = Object.values(room.players);

  // Voting Check
  const hasVotedToSkip = room.votesToSkipDiscussion?.includes(playerId);

  // Targeting Logic
  const [isTargeting, setIsTargeting] = useState(false);

  // System Messages handling
  const messages = room.systemMessages
    ? Object.values(room.systemMessages).sort((a: any, b: any) => b.timestamp - a.timestamp)
    : [];
  const latestMessage = messages.length > 0 ? (messages[0] as any) : null;

  // --- NEW: DEAD VIEW ---
  if (me.isEliminated) {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center p-6 text-center font-mono">
        <div className="text-red-600/20 text-9xl mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-24 h-24 mx-auto animate-pulse"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-2">Terminated</h1>
        <p className="text-slate-500 max-w-xs uppercase tracking-wider text-xs">
          You have been removed from the protocol. <br /> Observation Mode Active.
        </p>
      </div>
    );
  }

  if (!hasRevealed) {
    return <RevealScreen player={me} onReadyToDiscuss={() => setHasRevealed(true)} />;
  }

  const toggleTargeting = () => {
    if (me.abilityCard && !me.isCardUsed) setIsTargeting(!isTargeting);
  };

  const handlePlayerTap = (targetId: string) => {
    if (isTargeting) {
      onUseCard(targetId);
      setIsTargeting(false);
    }
  };

  const isUrgent = Number(minutes) === 0 && Number(seconds) < 30;

  // --- DYNAMIC ICONS & DESCRIPTIONS ---
  const getCardConfig = (card: AbilityCard | string) => {
    switch (card) {
      case 'RADAR':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a9.75 9.75 0 11-19.5 0 9.75 9.75 0 0119.5 0zM12 5.25a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5z" />
            </svg>
          ),
          color: 'text-emerald-400',
          border: 'border-emerald-500',
          bg: 'bg-emerald-950',
          targetIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path
                fillRule="evenodd"
                d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'SCAN TARGET',
          desc: 'Reveals if a player is SAFE or a THREAT.',
        };
      case 'SILENCER':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.5 12a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0z" />
            </svg>
          ),
          color: 'text-rose-500',
          border: 'border-rose-500',
          bg: 'bg-rose-950',
          targetIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
              <path
                fillRule="evenodd"
                d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'SILENCE VOTE',
          desc: "Target player's vote will not count.",
        };
      case 'SPOOF':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 6a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9A.75.75 0 0112 8.25zm0 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          ),
          color: 'text-purple-400',
          border: 'border-purple-500',
          bg: 'bg-purple-950',
          targetIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'FAKE SIGNAL',
          desc: 'Reverses RADAR results for the target.',
        };
      default:
        return null;
    }
  };

  const cardConfig = me.abilityCard ? getCardConfig(me.abilityCard) : null;
  const targetName = me.isCardUsed && me.cardTargetId ? room.players[me.cardTargetId]?.name : null;

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden font-mono">
      <div className="flex justify-between items-stretch h-20 border-b border-slate-800 bg-slate-900/50">
        <div className="flex-1 flex flex-col justify-center items-center border-r border-slate-800 p-2">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Time Remaining</p>
          <div className={`text-3xl font-black tracking-tighter ${isUrgent ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {minutes}:{seconds}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center p-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-violet-500/5 group-hover:bg-violet-500/10 transition-colors" />
          <p className="text-[9px] text-violet-400 uppercase tracking-widest mb-1">Passphrase</p>
          <p className="text-lg font-bold text-white uppercase tracking-wider truncate max-w-full px-2">
            {me.secretWord || '???'}
          </p>
        </div>
      </div>

      <div className="bg-slate-900/80 border-b border-slate-800 h-10 flex items-center px-4 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 animate-pulse" />
        <AnimatePresence mode="wait">
          {latestMessage ? (
            <motion.p
              key={latestMessage.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-[10px] font-mono font-bold uppercase tracking-wider truncate ${
                latestMessage.text.includes('THREAT')
                  ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]'
                  : latestMessage.text.includes('SAFE')
                    ? 'text-emerald-400'
                    : 'text-blue-300'
              }`}
            >
              {`>> ${latestMessage.text}`}
            </motion.p>
          ) : (
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">// SYSTEM MONITORING ACTIVE...</p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-center relative">
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
            const isDisabled = isTargeting ? !isInteractable : !isMe;
            const isDead = p.isEliminated;

            return (
              <button
                key={p.id}
                disabled={isDisabled || isDead}
                onClick={() => handlePlayerTap(p.id)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all duration-300 border ${
                  isDead
                    ? 'opacity-30 border-slate-900 cursor-not-allowed grayscale'
                    : isMe
                      ? 'bg-slate-800 border-slate-600 opacity-100'
                      : isTargeting && isInteractable
                        ? `${cardConfig?.bg}/30 ${cardConfig?.border} shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer animate-pulse scale-95`
                        : 'bg-slate-900/50 border-slate-800 opacity-60'
                }`}
              >
                <span
                  className={`text-xs font-black uppercase truncate w-full text-center tracking-wider ${
                    isTargeting && isInteractable && !isDead ? cardConfig?.color : 'text-slate-300'
                  }`}
                >
                  {p.name}
                </span>
                {isMe && <span className="text-[8px] text-slate-500 mt-1 uppercase">UNIT_SELF</span>}
                {isDead && <span className="text-[8px] text-red-900 mt-1 uppercase font-black">DEAD</span>}

                {isTargeting && isInteractable && !isDead && cardConfig && (
                  <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${cardConfig.color} opacity-80`}>
                    {cardConfig.targetIcon}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
        {cardConfig && (
          <div className="bg-slate-950/50 border border-slate-800 rounded p-2 text-center shadow-inner">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {me.isCardUsed && targetName ? <span className="text-yellow-500">TARGET CONFIRMED: {targetName}</span> : cardConfig.desc}
            </p>
          </div>
        )}

        {cardConfig && (
          <button
            disabled={me.isCardUsed}
            onClick={toggleTargeting}
            className={`w-full h-16 flex items-center justify-between px-4 rounded border transition-all relative overflow-hidden group ${
              me.isCardUsed
                ? 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
                : isTargeting
                  ? `${cardConfig.bg}/20 ${cardConfig.border} shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-3 z-10">
              <div
                className={`p-2 rounded ${
                  me.isCardUsed ? 'text-slate-600 bg-slate-900' : `${cardConfig.color} ${cardConfig.bg}/50 border border-white/10`
                }`}
              >
                {cardConfig.icon}
              </div>
              <div className="flex flex-col items-start">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${me.isCardUsed ? 'text-slate-600' : cardConfig.color}`}>
                  Active Module
                </span>
                <span className={`text-sm font-black uppercase tracking-wider ${me.isCardUsed ? 'text-slate-500 line-through' : 'text-white'}`}>
                  {me.abilityCard}
                </span>
              </div>
            </div>

            <div className="z-10 text-right">
              {me.isCardUsed ? (
                <span className="text-[10px] font-bold text-slate-600 uppercase">DEPLETED</span>
              ) : isTargeting ? (
                <span className={`text-[10px] font-bold ${cardConfig.color} uppercase animate-pulse`}>{cardConfig.label}</span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase">TAP TO ARM</span>
              )}
            </div>

            {!me.isCardUsed && isTargeting && <div className={`absolute inset-0 ${cardConfig.bg}/10 animate-[scan_2s_ease-in-out_infinite]`} />}
          </button>
        )}

        <div className="space-y-2">
          <button
            onClick={onVoteToSkip}
            className={`w-full p-4 rounded-lg font-bold uppercase tracking-[0.2em] text-xs transition-all border ${
              hasVotedToSkip
                ? 'bg-slate-800 border-violet-500 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            {/* FIX: Shorter text to prevent wrapping on mobile */}
            {hasVotedToSkip ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-pulse">●</span>
                <span>CANCEL VOTE</span>
              </span>
            ) : (
              'INITIATE VOTE_SKIP'
            )}
          </button>
          
          {/* FIX: Added helper text */}
          <p className="text-[9px] text-center text-slate-600 uppercase tracking-wider">
            Voting begins automatically when all agents accept.
          </p>
        </div>
      </div>
    </div>
  );
};
