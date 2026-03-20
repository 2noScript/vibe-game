import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

export const GameView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { engine, gameState, update } = useGameStore();

  useEffect(() => {
    if (gameState.status !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const loop = () => {
      update(0.016);

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      if (engine) {
        engine.draw(ctx);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState.status, engine, update]);

  return (
    <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-gray-800 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block bg-black"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
