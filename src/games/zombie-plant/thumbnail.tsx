import React from 'react';
import { cn } from '@/lib/utils';

const ZombiePlantThumbnail: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("relative w-full h-full bg-[#050011] overflow-hidden flex items-center justify-center", className)}>
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#00ff9d 1px, transparent 1px), linear-gradient(90deg, #00ff9d 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      {/* Plant (Green) */}
      <div className="relative z-10 w-16 h-16 bg-[#00ff9d] border-4 border-white shadow-[0_0_20px_rgba(0,255,157,0.5)] flex items-center justify-center">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full" />
        </div>
      </div>

      {/* Zombie (Purple) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#ff00ff] border-4 border-white shadow-[0_0_15px_rgba(255,0,255,0.5)] animate-pulse">
        <div className="flex gap-1 mt-2 justify-center">
          <div className="w-2 h-2 bg-black" />
          <div className="w-2 h-2 bg-black" />
        </div>
      </div>

      {/* Text Overlay */}
      <div className="absolute bottom-4 left-4 font-pixel text-[10px] text-white tracking-widest">
        ZOMBIE <span className="text-[#00ff9d]">PLANT</span>
      </div>
    </div>
  );
};

export default ZombiePlantThumbnail;
