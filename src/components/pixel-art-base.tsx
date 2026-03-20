import React, { useEffect, useRef } from 'react';

interface PixelArtBaseProps {
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  className?: string;
}

const PixelArtBase: React.FC<PixelArtBaseProps> = ({ draw, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 64;
    const height = 36;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    draw(ctx, width, height);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: 'pixelated', width: '100%', height: '100%' }}
    />
  );
};

export default PixelArtBase;
