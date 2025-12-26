import React, { useState } from 'react';

interface WelcomeScreenProps {
  onCreate: (name: string) => void;
  onJoin: (code: string, name: string) => void;
  loading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreate, onJoin, loading }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'JOIN' | 'CREATE'>('JOIN');
  
  // Track focus to ensure we only highlight when the user is actually typing
  const [isCodeFocused, setIsCodeFocused] = useState(false);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    setCode(val);
  };

  return (
    <div className="flex flex-col justify-center min-h-full max-w-sm mx-auto w-full animate-in fade-in duration-700 py-6">
      
      {/* 1. BRAND HEADER */}
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-6xl font-black tracking-tighter text-violet-500 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          GENESIS
        </h1>
        <p className="text-slate-600 text-xs tracking-[0.3em] uppercase font-medium">
          Trust No One
        </p>
      </div>

      {/* 2. MAIN FORM CARD */}
      <div className="space-y-6 flex-1 flex flex-col justify-center">
        
        {/* IDENTITY INPUT */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
            Identity
          </label>
          <input
            type="text"
            placeholder="ENTER CODENAME"
            className="w-full bg-slate-900/50 border border-slate-800 text-slate-200 p-4 rounded-lg focus:outline-none focus:border-violet-500 focus:bg-slate-900 transition-all text-center font-bold uppercase tracking-wider placeholder:text-slate-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* MODE SWITCHER */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/50 rounded-lg border border-slate-800/50">
          <button
            onClick={() => setMode('JOIN')}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              mode === 'JOIN' 
                ? 'bg-slate-800 text-violet-400 shadow-sm' 
                : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            Join Mission
          </button>
          <button
            onClick={() => setMode('CREATE')}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              mode === 'CREATE' 
                ? 'bg-slate-800 text-violet-400 shadow-sm' 
                : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            New Mission
          </button>
        </div>

        {/* ACTION AREA */}
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 space-y-4">
          
          {mode === 'JOIN' ? (
            /* JOIN FLOW */
            <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                   Access Code
                 </label>
                 
                 {/* SEGMENTED INPUT CONTAINER */}
                 <div className="relative h-16 w-full group">
                    {/* The Invisible Real Input */}
                    <input
                      type="text"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-transparent z-20"
                      maxLength={4}
                      value={code}
                      onChange={handleCodeChange}
                      onFocus={() => setIsCodeFocused(true)}
                      onBlur={() => setIsCodeFocused(false)}
                      autoComplete="off"
                    />

                    {/* The Visual Slots */}
                    <div className="absolute inset-0 flex justify-between gap-2 z-10 pointer-events-none">
                      {[0, 1, 2, 3].map((index) => {
                        const char = code[index] || "";
                        const isCurrentSlot = code.length === index;
                        const isActive = isCurrentSlot && isCodeFocused;
                        const isFilled = char !== "";

                        return (
                          <div
                            key={index}
                            /* REMOVED scale-105 from the active state below */
                            className={`flex-1 flex items-center justify-center rounded-lg border-2 text-3xl font-mono font-bold transition-all duration-200 ${
                              isActive 
                                ? "border-violet-500 bg-slate-800 shadow-[0_0_15px_rgba(139,92,246,0.2)]" 
                                : isFilled
                                  ? "border-slate-700 bg-slate-900 text-white"
                                  : "border-slate-800 bg-slate-950 text-slate-700"
                            }`}
                          >
                            {char}
                            
                            {/* Placeholder Line */}
                            {!isFilled && !isActive && (
                              <div className="w-4 h-1 bg-slate-800 rounded-full group-hover:bg-slate-700 transition-colors" />
                            )}
                            
                            {/* Blinking Cursor */}
                            {isActive && (
                               <div className="w-0.5 h-8 bg-violet-500 animate-pulse" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                 </div>
              </div>
              
              <button
                disabled={!name || code.length !== 4 || loading}
                onClick={() => onJoin(code, name)}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white p-4 rounded-lg font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(124,58,237,0.1)] hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] active:scale-[0.98]"
              >
                {loading ? 'Decrypting...' : 'Connect'}
              </button>
            </div>
          ) : (
            /* CREATE FLOW */
            <div className="space-y-4 py-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="p-4 border border-violet-900/30 bg-violet-900/10 rounded-lg">
                <p className="text-violet-300 text-xs text-center leading-relaxed">
                  You will be assigned as <strong className="text-white">Host</strong>.
                  <br/>
                  Share the access code with up to 8 other agents.
                </p>
              </div>

              <button
                disabled={!name || loading}
                onClick={() => onCreate(name)}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-500/50 text-violet-400 p-4 rounded-lg font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? 'Initializing...' : 'Generate Protocol'}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 3. FOOTER SIGNATURE */}
      <div className="mt-12 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-500">
         <div className="h-px w-12 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
         <p className="text-[10px] text-slate-500 font-mono tracking-[0.2em] uppercase">
           System Architect <span className="text-violet-400 font-bold">2XE2IPI</span>
         </p>
      </div>
    </div>
  );
};