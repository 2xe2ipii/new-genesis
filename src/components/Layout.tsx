import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      <div className="mx-auto max-w-md min-h-screen flex flex-col p-6 relative overflow-hidden shadow-2xl bg-slate-900 border-x border-slate-800">
        
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Main Content */}
        <main className="relative z-10 flex-1 flex flex-col">
          {children}
        </main>
        
      </div>
    </div>
  );
};