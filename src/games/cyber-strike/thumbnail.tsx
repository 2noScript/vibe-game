import React from 'react';
import PixelArtBase from '../../components/pixel-art-base';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(w / 2 - 10, h / 2, 20, 1);
    ctx.fillRect(w / 2, h / 2 - 10, 1, 20);
    ctx.strokeStyle = '#ef4444';
    ctx.strokeRect(w / 2 - 5, h / 2 - 5, 10, 10);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(w / 2 + 8, h / 2 - 8, 4, 2);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(w / 2 - 12, h / 2 + 6, 6, 1);
  };

  return <PixelArtBase draw={draw} className={className} />;
};

export default Thumbnail;
