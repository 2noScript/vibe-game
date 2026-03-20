import React from 'react';
import { cn } from '@/lib/utils';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("relative w-full h-full bg-sky-400 overflow-hidden flex items-center justify-center", className)}>
      {/* Clouds */}
      <div className="absolute top-4 left-4 w-12 h-6 bg-white rounded-full opacity-60"></div>
      <div className="absolute top-10 right-8 w-16 h-8 bg-white rounded-full opacity-60"></div>
      <div className="absolute top-20 left-1/2 w-10 h-5 bg-white rounded-full opacity-60"></div>
      
      {/* Ground */}
      <div className="absolute bottom-0 w-full h-1/4 bg-green-500 border-t-4 border-green-600"></div>
      
      {/* Character */}
      <div className="absolute bottom-1/4 left-1/2 w-8 h-8 bg-red-500 rounded-md border-2 border-black -translate-x-1/2 shadow-[-4px_4px_0_rgba(0,0,0,0.5)]">
        <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
      </div>
      
      {/* Platforms */}
      <div className="absolute bottom-1/2 left-1/4 w-12 h-4 bg-amber-700 border-2 border-black"></div>
      <div className="absolute bottom-2/3 right-1/4 w-12 h-4 bg-amber-700 border-2 border-black"></div>
      
      {/* Coin */}
      <div className="absolute bottom-1/2 left-1/4 -translate-y-6 w-4 h-4 bg-yellow-400 rounded-full border-2 border-black animate-bounce"></div>
    </div>
  );
};

export default Thumbnail;
