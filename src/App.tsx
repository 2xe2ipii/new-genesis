// src/App.tsx
import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { Layout } from './components/Layout';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { DiscussionScreen } from './components/DiscussionScreen';
import { VotingScreen } from './components/VotingScreen';
import { ResultsScreen } from './components/ResultsScreen';

// Simple Modal Component for Card Results (Internal Component)
const CardResultModal = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 animate-in fade-in duration-200">
    <div className="bg-slate-800 border-2 border-purple-500 w-full max-w-sm p-6 rounded-2xl shadow-2xl shadow-purple-900/50">
      <h3 className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-2">System Alert</h3>
      <p className="text-xl font-bold text-white mb-6 font-mono leading-relaxed">{message}</p>
      <button 
        onClick={onClose}
        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-wider"
      >
        Acknowledge
      </button>
    </div>
  </div>
);

function App() {
  const { 
    gameState, 
    playerId, 
    loading, 
    error,
    createRoom, 
    joinRoom, 
    leaveRoom, 
    toggleReady, 
    startGame,
    useCard, 
    voteToSkip,
    castVote,
    checkVotingComplete,
    returnToLobby
  } = useGame();

  const [cardResult, setCardResult] = useState<string | null>(null);

  // Wrapper to handle async card result and show modal
  const handleUseCard = async (targetId: string) => {
    const result = await useCard(targetId);
    if (result) setCardResult(result);
  };

  return (
    <Layout>
      {/* 1. Global Error Toast */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg text-sm font-bold text-center z-50 animate-bounce shadow-lg">
          {error}
        </div>
      )}

      {/* 2. Global Card Result Modal */}
      {cardResult && (
        <CardResultModal message={cardResult} onClose={() => setCardResult(null)} />
      )}

      {/* 3. Main Routing Logic */}
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

          {/* Reveal is technically part of Discussion flow now, handled inside DiscussionScreen */}
          {(gameState.phase === 'DISCUSSION' || gameState.phase === 'REVEAL') && (
            <DiscussionScreen 
               room={gameState}
               playerId={playerId}
               onUseCard={handleUseCard}
               onVoteToSkip={voteToSkip}
            />
          )}
          
          {gameState.phase === 'VOTING' && (
             <VotingScreen 
               room={gameState}
               playerId={playerId}
               onVote={castVote}
               onCheckCompletion={checkVotingComplete}
             />
          )}

          {(gameState.phase === 'SUSPENSE' || gameState.phase === 'RESULTS') && (
             <ResultsScreen 
               room={gameState}
               onReturnToLobby={returnToLobby}
             />
          )}
        </>
      )}
    </Layout>
  );
}

export default App;