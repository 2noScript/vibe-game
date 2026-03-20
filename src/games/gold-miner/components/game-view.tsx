import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { CANVAS_WIDTH, CANVAS_HEIGHT, ORIGIN_X, ORIGIN_Y } from '../constants';

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
    let lastTime = performance.now();

    const loop = () => {
      // Update game state with fixed dt
      update(0.016);

      // Draw
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
    <div className="relative group">
      <div className="absolute -inset-4 border-4 border-[#5c3a21] rounded-2xl pointer-events-none" />
      <div className="absolute -inset-1 border border-white/10 rounded-lg pointer-events-none" />
      
      <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block bg-[#5c3a21] cursor-crosshair"
        />
      </div>
    </div>
  );
};
