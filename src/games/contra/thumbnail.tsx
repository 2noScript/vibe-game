import React from 'react';
import { cn } from '@/lib/utils';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("relative w-full h-full bg-green-900 overflow-hidden flex items-center justify-center", className)}>
      {/* Jungle Background */}
      <div className="absolute top-0 w-full h-full opacity-40">
        <div className="absolute top-10 left-10 w-20 h-40 bg-green-800 rounded-full blur-md"></div>
        <div className="absolute top-20 right-20 w-32 h-48 bg-green-950 rounded-full blur-md"></div>
        <div className="absolute bottom-0 left-1/4 w-40 h-32 bg-green-800 rounded-t-full blur-md"></div>
      </div>
      
      {/* Ground */}
      <div className="absolute bottom-0 w-full h-1/4 bg-green-950 border-t-4 border-green-800">
        <div className="w-full h-2 bg-green-700/30 mt-2 border-dashed border-t-2 border-green-600/50"></div>
      </div>

      {/* Player Character */}
      <div className="absolute bottom-1/4 left-1/4 w-6 h-12 bg-blue-600 rounded-sm border-2 border-black shadow-[-4px_4px_0_rgba(0,0,0,0.5)]">
        {/* Bandana */}
        <div className="absolute -top-1 -left-1 w-8 h-3 bg-red-500 border-2 border-black"></div>
        {/* Gun */}
        <div className="absolute top-4 left-4 w-10 h-3 bg-gray-400 border-2 border-black"></div>
      </div>
      
      {/* Bullets */}
      <div className="absolute bottom-[35%] left-1/2 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-[0_0_10px_#fff]"></div>
      <div className="absolute bottom-[35%] left-[60%] w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-[0_0_10px_#fff]"></div>
      
      {/* Enemy */}
      <div className="absolute bottom-1/4 right-1/4 w-6 h-12 bg-red-600 rounded-sm border-2 border-black shadow-[-4px_4px_0_rgba(0,0,0,0.5)]">
        <div className="absolute top-2 -left-2 w-4 h-3 bg-red-400 border-2 border-black"></div>
      </div>
    </div>
  );
};

export default Thumbnail;
