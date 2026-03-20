import React from 'react';
import PixelArtBase from '../../components/pixel-art-base';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 10); ctx.lineTo(30, 10); ctx.lineTo(30, 25); ctx.lineTo(50, 25);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(8, 8, 4, 4); ctx.fillRect(28, 23, 4, 4); ctx.fillRect(48, 23, 4, 4);
    ctx.font = '8px monospace';
    ctx.fillText('101', 10, 30); ctx.fillText('010', 40, 15);
  };

  return <PixelArtBase draw={draw} className={className} />;
};

export default Thumbnail;
