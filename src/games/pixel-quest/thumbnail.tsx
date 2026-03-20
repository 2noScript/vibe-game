import React from 'react';
import PixelArtBase from '../../components/pixel-art-base';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#3f6212';
    ctx.fillRect(0, h - 8, w, 8);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(w / 2 - 4, h - 16, 8, 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(w / 2 - 2, h - 14, 1, 1);
    ctx.fillRect(w / 2 + 1, h - 14, 1, 1);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(w / 2 + 4, h - 14, 6, 2);
  };

  return <PixelArtBase draw={draw} className={className} />;
};

export default Thumbnail;
