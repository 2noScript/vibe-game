import React from 'react';
import { Skull, Target } from 'lucide-react';
import { useGameStore } from '../store';

export const Overlays: React.FC = () => {
  const { status, score } = useGameStore((state) => state.gameState);
  const startGame = useGameStore((state) => state.startGame);

  if (status === 'PLAYING') return null;

  return (
    <div className="absolute inset-0 z-20">
      {status === 'START' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
          <h1 className="text-6xl font-bold text-red-600 mb-2 drop-shadow-[4px_4px_0_#000] tracking-widest">COMMANDO</h1>
          <h2 className="text-4xl font-bold text-blue-500 mb-8 drop-shadow-[2px_2px_0_#000]">STRIKE</h2>
          
          <div className="flex gap-8 mb-8 text-gray-300 text-sm bg-gray-900/80 p-6 border-2 border-gray-700 rounded">
            <div className="flex flex-col gap-2">
              <span className="text-yellow-400">MOVEMENT</span>
              <span>← → : RUN</span>
              <span>↓ : DUCK</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-yellow-400">ACTION</span>
              <span>Z : JUMP</span>
              <span>X : SHOOT</span>
              <span>ARROWS + X : AIM</span>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-4 bg-red-600 text-white font-bold text-2xl hover:bg-red-500 hover:scale-105 transition-all border-4 border-red-800 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
          >
            START MISSION
          </button>
        </div>
      )}

      {status === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center">
          <Skull size={64} className="text-black mb-4 animate-pulse" />
          <h2 className="text-6xl font-bold text-black mb-4 drop-shadow-[2px_2px_0_#ef4444]">MISSION FAILED</h2>
          <p className="text-white mb-8 text-2xl">FINAL SCORE: {score}</p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-black text-red-500 font-bold text-2xl hover:bg-gray-900 hover:scale-105 transition-all border-2 border-red-500"
          >
            CONTINUE?
          </button>
        </div>
      )}

      {status === 'WIN' && (
        <div className="absolute inset-0 bg-blue-900/90 flex flex-col items-center justify-center">
          <Target size={64} className="text-yellow-400 mb-4" />
          <h2 className="text-6xl font-bold text-yellow-400 mb-4 drop-shadow-[2px_2px_0_#000]">MISSION ACCOMPLISHED</h2>
          <p className="text-white mb-2 text-2xl">FINAL SCORE: {score}</p>
          <p className="text-blue-300 mb-8 text-xl">THE ALIEN BASE IS DESTROYED.</p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-yellow-500 text-black font-bold text-2xl hover:bg-yellow-400 hover:scale-105 transition-all border-4 border-yellow-700"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};
