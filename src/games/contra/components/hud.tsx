import React from 'react';
import { Heart } from 'lucide-react';
import { useGameStore } from '../store';

export const HUD: React.FC = () => {
  const { score, lives } = useGameStore((state) => state.gameState);

  return (
    <>
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 px-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xl text-blue-400 font-bold">
            1P
          </div>
          <div className="flex gap-2">
            {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
              <Heart key={i} size={20} className="text-red-500 fill-red-500" />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-2xl text-yellow-400 font-bold drop-shadow-[2px_2px_0_#000]">
            SCORE: {score.toString().padStart(6, '0')}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-xs text-gray-500 flex gap-4">
        <span>ARROWS: Move/Aim</span>
        <span>Z: Jump</span>
        <span>X: Shoot</span>
      </div>
    </>
  );
};
