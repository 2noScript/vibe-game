import React from 'react';
import PixelArtBase from '../../components/pixel-art-base';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 5, 0); ctx.lineTo(w / 2 + 5, 0); ctx.lineTo(w, h); ctx.lineTo(0, h);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(w / 2 - 4, h - 12, 8, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(w / 2 - 5, h - 11, 2, 2);
    ctx.fillRect(w / 2 + 3, h - 11, 2, 2);
  };

  return <PixelArtBase draw={draw} className={className} />;
};

export default Thumbnail;
