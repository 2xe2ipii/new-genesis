// src/App.tsx
import { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { Layout } from './components/Layout';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { DiscussionScreen } from './components/DiscussionScreen';
import { VotingScreen } from './components/VotingScreen';
import { ResultsScreen } from './components/ResultsScreen';

// Internal Component: System Alert Toast
const SystemAlert = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => (
  <div 
    onClick={onDismiss}
    className="fixed top-6 left-1/2 -translate-x-1/2 z-50 cursor-pointer animate-in slide-in-from-top-4 fade-in duration-300 w-full max-w-sm px-4"
  >
    <div className="flex items-center gap-4 bg-slate-900/95 border border-red-500/30 text-red-100 px-6 py-4 rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.25)] backdrop-blur-md hover:bg-slate-900 transition-colors group">
      {/* Icon */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 group-hover:bg-red-500/20 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* Text */}
      <div className="flex-1">
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-0.5">System Error</p>
        <p className="text-sm font-medium text-red-100">{message}</p>
      </div>

      {/* Dismiss Hint */}
      <div className="h-full w-px bg-red-500/20 mx-2" />
      <span className="text-xs font-bold text-red-500 opacity-50 group-hover:opacity-100">X</span>
    </div>
  </div>
);

// Internal Component: Card Result Modal
const CardResultModal = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 animate-in fade-in duration-200">
    <div className="bg-slate-800 border-2 border-violet-500 w-full max-w-sm p-6 rounded-2xl shadow-2xl shadow-violet-900/50">
      <h3 className="text-violet-400 font-bold uppercase tracking-widest text-xs mb-2">System Alert</h3>
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
    returnToLobby,
    startNextRound, 
    forceVotingPhase, // <--- NEW: Import the force function
    clearError
  } = useGame();

  const [localResultsDismissed, setLocalResultsDismissed] = useState(true);
  const [resultsSnapshot, setResultsSnapshot] = useState<any>(null);

  // Update snapshot only while we are in the actual results/suspense phase
  useEffect(() => {
    if (gameState?.phase === 'SUSPENSE' || gameState?.phase === 'RESULTS') {
      setResultsSnapshot(gameState);
    }
  }, [gameState]);

  // Reset the dismissal when the game actually hits the results phase
  useEffect(() => {
    if (gameState?.phase === 'RESULTS') {
      setLocalResultsDismissed(false);
    }
  }, [gameState?.phase]);

  // Handler: Only trigger the DB update if the phase is strictly RESULTS.
  // If the phase is already DISCUSSION (because someone else clicked), just dismiss the local view.
  const handleProceedToRound2 = () => {
    if (gameState?.phase === 'RESULTS') {
      startNextRound();
    }
    setLocalResultsDismissed(true);
  };

  const handleReturnToLobby = () => {
    // Attempt to reset global state (will be ignored by hook if already done)
    returnToLobby();
    // Dismiss the local results view to reveal the Lobby
    setLocalResultsDismissed(true);
  };

  const [cardResult, setCardResult] = useState<string | null>(null);
  const [displayedError, setDisplayedError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setDisplayedError(error);
      clearError();
      const timer = setTimeout(() => {
        setDisplayedError(null);
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleUseCard = async (targetId: string) => {
    await useCard(targetId);
  };

  return (
    <Layout>
      {displayedError && (
        <SystemAlert 
          message={displayedError} 
          onDismiss={() => setDisplayedError(null)} 
        />
      )}

      {cardResult && (
        <CardResultModal message={cardResult} onClose={() => setCardResult(null)} />
      )}

      {!gameState ? (
        <WelcomeScreen 
          onCreate={createRoom} 
          onJoin={joinRoom} 
          loading={loading}
        />
      ) : (
        <>
          {/* LOGIC: Show Lobby only if we aren't holding the final results screen open */}
          {gameState.phase === 'LOBBY' && (localResultsDismissed || !resultsSnapshot) && (
            <LobbyScreen 
              room={gameState}
              playerId={playerId}
              onToggleReady={toggleReady}
              onStartGame={startGame}
              onLeave={leaveRoom}
            />
          )}

          {/* LOGIC: Show Discussion if phase is correct. If Round > 1, wait for dismissal. Round 1 always shows. */}
          {(gameState.phase === 'DISCUSSION' || gameState.phase === 'REVEAL') && (gameState.round === 1 || localResultsDismissed) && (
            <DiscussionScreen 
               room={gameState}
               playerId={playerId}
               onUseCard={handleUseCard}
               onVoteToSkip={voteToSkip}
               onTimeout={forceVotingPhase} // <--- NEW: Pass the handler
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

          {/* LOGIC: Show Results if phase is Results, OR if we are in Round 2 overlay, OR if we are in Lobby overlay */}
          {(
            gameState.phase === 'SUSPENSE' || 
            gameState.phase === 'RESULTS' || 
            (gameState.phase === 'DISCUSSION' && gameState.round > 1 && !localResultsDismissed) ||
            (gameState.phase === 'LOBBY' && !localResultsDismissed && resultsSnapshot)
          ) && (
             <ResultsScreen 
               // FIX: Use snapshot if we are in an overlay state (Discussion or Lobby)
               room={((gameState.phase === 'DISCUSSION' || gameState.phase === 'LOBBY') && resultsSnapshot) ? resultsSnapshot : gameState}
               playerId={playerId} 
               onReturnToLobby={handleReturnToLobby} // Use new handler
               onStartNextRound={handleProceedToRound2} 
             />
          )}
        </>
      )}
    </Layout>
  );
}

export default App;