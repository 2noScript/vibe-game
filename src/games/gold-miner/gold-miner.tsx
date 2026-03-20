import React, { useEffect } from 'react';
import { useGameStore } from './store';
import { HUD } from './components/hud';
import { Overlay } from './components/overlay';
import { GameView } from './components/game-view';
import { audio } from './audio';

const GoldMiner = () => {
  const { gameState, setGameState } = useGameStore();

  useEffect(() => {
    if (gameState.status !== 'PLAYING') return;

    const timer = setInterval(() => {
      const state = useGameStore.getState();
      if (state.gameState.time <= 1) {
        clearInterval(timer);
        if (state.gameState.score >= state.gameState.goal) {
          audio.playLevelClear();
          setGameState('LEVEL_CLEAR');
        } else {
          audio.playGameOver();
          setGameState('GAME_OVER');
        }
      } else {
        useGameStore.setState(s => ({
          gameState: { ...s.gameState, time: s.gameState.time - 1 }
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.status, setGameState]);

  return (
    <div className="relative w-full h-screen bg-[#050011] flex items-center justify-center font-pixel text-white overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#8B4513_0%,_transparent_70%)]" />
      </div>

      <HUD />
      <GameView />
      <Overlay />
    </div>
  );
};

export default GoldMiner;
