import React, { useEffect } from 'react';
import { GameView } from './components/game-view';
import { HUD } from './components/hud';
import { Overlays } from './components/overlays';
import { useGameStore } from './store';

const CommandoStrike: React.FC = () => {
  const { engine } = useGameStore();

  useEffect(() => {
    return () => {
      if (engine) {
        engine.destroy();
      }
    };
  }, [engine]);

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center font-pixel text-white select-none">
      <HUD />
      <div className="relative">
        <GameView />
        <Overlays />
      </div>
    </div>
  );
};

export default CommandoStrike;
