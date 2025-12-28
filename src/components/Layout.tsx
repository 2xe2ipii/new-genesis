// src/components/Layout.tsx
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// --- UPDATED MANUAL DATA ---
const MANUAL_DATA = {
  overview: [
    {
      title: 'OBJECTIVE',
      content: 'A social deduction game of deception and detection. Players are assigned a Role, a Secret Word, and sometimes an Item.'
    },
    {
      title: 'CATEGORIES',
      content: 'SAFE = [ Locals ] ----- \nTHREAT = [ Spy, Joker, Tourist ]'
    },
    {
      title: 'WINNING',
      content: 'Survival is key. If you are eliminated (executed), you lose the game immediately, even if your team eventually wins.'
    }
  ],
  roles: [
    { 
      title: 'LOCAL', 
      type: 'Safe', 
      goal: 'Vote out the Spy.',
      info: 'Receives the Majority Word. Wins if the Spy is executed.' 
    },
    { 
      title: 'SPY', 
      type: 'Threat', 
      goal: 'Survive',
      info: 'Receives the Imposter Word. Wins if they survive to the end. EXCEPT if JOKER wins.' 
    },
    { 
      title: 'JOKER', 
      type: 'Threat', 
      goal: 'Get Executed.',
      info: 'Receives the Majority Word (same as Locals). Wins immediately if voted out.' 
    },
    { 
      title: 'TOURIST', 
      type: 'Threat', 
      goal: 'Survive & Help Locals.',
      info: 'Receives NO Word. Wins if the Locals win, but must remain alive.' 
    }
  ],
  items: [
    { 
      title: 'RADAR', 
      desc: 'Reveals if a player is SAFE or THREAT.', 
      note: 'Can be fooled if the target has used Spoof.' 
    },
    { 
      title: 'SPOOF', 
      desc: 'Disguises a player\'s signature.', 
      note: 'If scanned by Radar, a SAFE player appears as THREAT, and a THREAT appears as SAFE.' 
    },
    { 
      title: 'SILENCER', 
      desc: 'Disable a player\'s voting power.', 
      note: 'The target is still allowed to talk, but their vote will count as 0 for the entire game (Round 1 & 2).' 
    }
  ],
  rules: [
    {
      title: 'GAME FLOW',
      content: 'The game consists of up to two Rounds. Each round lasts 7 minutes. Players can vote to end the round early.'
    },
    {
      title: 'VOTING',
      content: 'The player with the most votes is executed. If the Spy or Joker is executed, the game ends immediately. Otherwise, play proceeds to Round 2.'
    },
    {
      title: 'TIES',
      content: 'Round 1 Tie: No one dies. Proceed to Round 2.\nRound 2 Tie: The Spy wins. Since the nobody dies in a tie, Spy survived.'
    },
    {
      title: 'ITEM USAGE',
      content: 'Items are single-use. They do not reload in Round 2. Silenced status persists permanently.'
    }
  ]
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'items' | 'rules'>('overview');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      <div className="mx-auto max-w-md min-h-screen flex flex-col p-6 relative overflow-hidden shadow-2xl bg-slate-900 border-x border-slate-800">
        
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Global Manual Trigger - TOP LEFT */}
        <button
          onClick={() => setIsManualOpen(true)}
          className="absolute top-4 left-4 z-50 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-violet-500 hover:bg-violet-500/10 transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] group"
          title="Field Manual"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </button>

        {/* Main Content */}
        <main className="relative z-10 flex-1 flex flex-col">
          {children}
        </main>

        {/* --- GLOBAL MANUAL MODAL --- */}
        <AnimatePresence>
          {isManualOpen && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.98 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.98 }}
               transition={{ duration: 0.2 }}
               className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-6"
             >
               <div className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                 
                 {/* Header */}
                 <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
                   <div>
                      <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white">Field Manual</h2>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Clearance Level 5</p>
                   </div>
                   <button 
                     onClick={() => setIsManualOpen(false)} 
                     className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-rose-500 hover:bg-rose-500/10 transition-all"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
                 
                 {/* Tabs */}
                 <div className="flex p-2 gap-2 bg-slate-950/30 border-b border-slate-800 overflow-x-auto">
                   {(['overview', 'roles', 'items', 'rules'] as const).map((tab) => (
                     <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${
                         activeTab === tab 
                           ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50' 
                           : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                       }`}
                     >
                       {tab}
                     </button>
                   ))}
                 </div>

                 {/* Content Area */}
                 <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-900">
                   
                   {activeTab === 'overview' && (
                     <div className="space-y-6">
                       {MANUAL_DATA.overview.map((item, i) => (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}>
                           <h3 className="text-violet-400 font-bold uppercase tracking-wider text-xs mb-2">{item.title}</h3>
                           <p className="text-sm text-slate-300 leading-relaxed">{item.content}</p>
                         </motion.div>
                       ))}
                     </div>
                   )}

                   {activeTab === 'roles' && (
                     <div className="space-y-4">
                       {MANUAL_DATA.roles.map((role, i) => (
                         <motion.div 
                           initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                           key={role.title} 
                           className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl"
                         >
                           <div className="flex justify-between items-start mb-2">
                             <h3 className="text-lg font-black text-white uppercase tracking-wider">{role.title}</h3>
                             <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded border ${
                               role.type === 'Safe' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30' : 'bg-rose-950/30 text-rose-400 border-rose-500/30'
                             }`}>{role.type}</span>
                           </div>
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Goal: <span className="text-slate-300">{role.goal}</span></p>
                           <p className="text-xs text-slate-400 leading-relaxed">{role.info}</p>
                         </motion.div>
                       ))}
                     </div>
                   )}

                   {activeTab === 'items' && (
                     <div className="space-y-4">
                       {MANUAL_DATA.items.map((item, i) => (
                         <motion.div 
                           initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                           key={item.title} 
                           className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl border-l-4 border-l-amber-500"
                         >
                           <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">{item.title}</h3>
                           <p className="text-sm text-slate-300 mb-2">{item.desc}</p>
                           <p className="text-xs text-slate-500 italic border-t border-slate-800 pt-2 mt-2">{item.note}</p>
                         </motion.div>
                       ))}
                     </div>
                   )}

                   {activeTab === 'rules' && (
                     <div className="space-y-6">
                        {MANUAL_DATA.rules.map((rule, i) => (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}>
                           <h3 className="text-rose-400 font-bold uppercase tracking-wider text-xs mb-2 border-b border-rose-900/30 pb-1">{rule.title}</h3>
                           <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{rule.content}</p>
                         </motion.div>
                       ))}
                     </div>
                   )}

                 </div>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
};