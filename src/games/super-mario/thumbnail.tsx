import React from 'react';
import { cn } from '@/lib/utils';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("relative w-full h-full bg-sky-400 overflow-hidden flex items-end justify-center", className)}>
      <div className="absolute bottom-0 w-full h-1/4 bg-green-500 border-t-4 border-green-600"></div>
      <div className="absolute bottom-1/4 left-1/4 w-8 h-8 bg-red-500 rounded-t-lg border-2 border-black"></div>
      <div className="absolute top-1/4 right-1/4 w-12 h-4 bg-white rounded-full opacity-80"></div>
      <div className="absolute top-1/3 left-1/3 w-8 h-8 bg-yellow-400 border-2 border-orange-500 flex items-center justify-center font-bold text-orange-600">?</div>
    </div>
  );
};

export default Thumbnail;
