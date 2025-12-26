import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { Layout } from './components/Layout';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { DiscussionScreen } from './components/DiscussionScreen';

// Simple Modal Component for Card Results
const CardResultModal = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 animate-in fade-in duration-200">
    <div className="bg-slate-800 border-2 border-purple-500 w-full max-w-sm p-6 rounded-2xl shadow-2xl shadow-purple-900/50">
      <h3 className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-2">System Alert</h3>
      <p className="text-xl font-bold text-white mb-6 font-mono">{message}</p>
      <button 
        onClick={onClose}
        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
      >
        ACKNOWLEDGE
      </button>
    </div>
  </div>
);

function App() {
  const { 
    gameState, playerId, loading, error,
    createRoom, joinRoom, leaveRoom, toggleReady, startGame,
    useCard, voteToSkip 
  } = useGame();

  const [cardResult, setCardResult] = useState<string | null>(null);

  const handleUseCard = async (targetId: string) => {
    const result = await useCard(targetId);
    if (result) setCardResult(result);
  };

  return (
    <Layout>
      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg text-sm font-bold text-center z-50 animate-bounce shadow-lg">
          {error}
        </div>
      )}

      {/* Card Result Modal */}
      {cardResult && (
        <CardResultModal message={cardResult} onClose={() => setCardResult(null)} />
      )}

      {/* ROUTING LOGIC */}
      {!gameState ? (
        <WelcomeScreen 
          onCreate={createRoom} 
          onJoin={joinRoom} 
          loading={loading}
        />
      ) : (
        <>
          {gameState.phase === 'LOBBY' && (
            <LobbyScreen 
              room={gameState}
              playerId={playerId}
              onToggleReady={toggleReady}
              onStartGame={startGame}
              onLeave={leaveRoom}
            />
          )}

          {(gameState.phase === 'DISCUSSION' || gameState.phase === 'REVEAL') && (
            <DiscussionScreen 
               room={gameState}
               playerId={playerId}
               onUseCard={handleUseCard}
               onVoteToSkip={voteToSkip}
            />
          )}
          
          {gameState.phase === 'VOTING' && (
             <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
               <h1 className="text-3xl font-black text-red-500 uppercase tracking-widest animate-pulse">Voting Phase</h1>
               <p className="text-slate-400">Lock in your votes...</p>
               {/* Voting Screen Component will go here next phase */}
             </div>
          )}
        </>
      )}
    </Layout>
  );
}

export default App;