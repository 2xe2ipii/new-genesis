// src/App.tsx
import { useGame } from './hooks/useGame';
import { Layout } from './components/Layout';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { RevealScreen } from './components/RevealScreen';

function App() {
  const { 
    gameState, 
    playerId, 
    loading, 
    error,
    createRoom, 
    joinRoom, 
    leaveRoom,
    toggleReady 
  } = useGame();

  // Simple handler for starting the game (Placeholder for now)
  const handleStartGame = () => {
    console.log("Starting game... logic comes in Phase 4");
    // We will add the startGame function to useGame hook in the next phase
  };

  return (
    <Layout>
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg text-sm font-bold text-center z-50 animate-bounce">
          {error}
        </div>
      )}

      {!gameState ? (
        <WelcomeScreen 
          onCreate={createRoom} 
          onJoin={joinRoom} 
          loading={loading}
        />
      ) : (
        gameState.phase === 'LOBBY' && (
          <LobbyScreen 
            room={gameState}
            playerId={playerId}
            onToggleReady={toggleReady}
            onStartGame={handleStartGame}
            onLeave={leaveRoom}
          />
        )
      )}
      
      {/* This is where we will add:
        gameState.phase === 'ASSIGNING' && <AnimationScreen />
        gameState.phase === 'REVEAL' && <RevealScreen />
        etc.
      */}
      
    </Layout>
  );
}

export default App;