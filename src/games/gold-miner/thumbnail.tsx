import React from 'react';
import { cn } from '@/lib/utils';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("relative w-full h-full bg-[#8B4513] overflow-hidden flex items-center justify-center", className)}>
      <div className="absolute top-0 w-full h-1/4 bg-[#D2B48C]"></div>
      <div className="absolute top-1/4 left-1/2 w-1 h-1/2 bg-gray-300 origin-top -rotate-12"></div>
      <div className="absolute top-3/4 left-[45%] w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-600"></div>
      <div className="absolute bottom-4 right-4 w-10 h-10 bg-gray-500 rounded-full border-2 border-gray-700"></div>
      <div className="absolute top-1/3 left-4 w-4 h-4 bg-cyan-300 rotate-45"></div>
    </div>
  );
};

export default Thumbnail;
