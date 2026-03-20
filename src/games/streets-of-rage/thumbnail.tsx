import React from 'react';
import { cn } from '@/lib/utils';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("relative w-full h-full bg-gray-900 overflow-hidden flex items-center justify-center", className)}>
      {/* City Skyline */}
      <div className="absolute top-0 w-full h-1/2 flex items-end opacity-30">
        <div className="w-1/4 h-3/4 bg-indigo-900 mx-1"></div>
        <div className="w-1/3 h-full bg-indigo-800 mx-1"></div>
        <div className="w-1/5 h-1/2 bg-indigo-950 mx-1"></div>
        <div className="w-1/4 h-4/5 bg-indigo-900 mx-1"></div>
      </div>
      
      {/* Street */}
      <div className="absolute bottom-0 w-full h-1/2 bg-gray-800 border-t-4 border-gray-700">
        <div className="w-full h-1 bg-yellow-500/30 mt-4 border-dashed border-t-2 border-yellow-500/50"></div>
      </div>

      {/* Characters */}
      <div className="absolute bottom-1/4 left-1/3 w-6 h-12 bg-blue-500 rounded-sm border-2 border-black -translate-x-1/2 shadow-[-4px_4px_0_rgba(0,0,0,0.5)]">
        <div className="absolute top-2 -right-3 w-4 h-3 bg-blue-400 border-2 border-black"></div>
      </div>
      
      <div className="absolute bottom-1/4 right-1/3 w-6 h-12 bg-red-500 rounded-sm border-2 border-black translate-x-1/2 shadow-[-4px_4px_0_rgba(0,0,0,0.5)]">
        <div className="absolute top-2 -left-3 w-4 h-3 bg-red-400 border-2 border-black"></div>
      </div>
      
      {/* Action impact */}
      <div className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-yellow-400 rotate-45 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="w-6 h-6 bg-orange-500 rotate-12"></div>
      </div>
    </div>
  );
};

export default Thumbnail;
