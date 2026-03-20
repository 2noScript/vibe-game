import React from 'react';
import PixelArtBase from '../../components/pixel-art-base';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#818cf8';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, 15, 4, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();
  };

  return <PixelArtBase draw={draw} className={className} />;
};

export default Thumbnail;
