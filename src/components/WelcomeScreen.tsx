// src/components/WelcomeScreen.tsx
import React, { useState } from 'react';

interface WelcomeScreenProps {
  onCreate: (name: string) => void;
  onJoin: (code: string, name: string) => void;
  loading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreate, onJoin, loading }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  return (
    <div className="flex flex-col justify-center h-full space-y-8 animate-in fade-in zoom-in duration-500">
      
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
          NEW GENESIS
        </h1>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Trust No One.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Codename</label>
          <input
            type="text"
            placeholder="Enter your name..."
            className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-lg font-bold placeholder:font-normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="relative">
           <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Mission Select</span>
          </div>
        </div>

        <button
          disabled={!name || loading}
          onClick={() => onCreate(name)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Initializing...' : 'Create New Mission'}
        </button>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Room Code"
            className="w-24 bg-slate-800 border border-slate-700 text-center text-white p-4 rounded-xl font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <button
            disabled={!name || code.length !== 4 || loading}
            onClick={() => onJoin(code, name)}
            className="flex-1 bg-slate-800 border-2 border-slate-700 p-4 rounded-xl font-bold text-slate-300 hover:border-slate-500 hover:text-white active:scale-95 transition-all disabled:opacity-50"
          >
            Join Mission
          </button>
        </div>
      </div>
    </div>
  );
};