import React from 'react';
import { Zap, Trophy, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

import { useGameStore } from '../store';

export const HUD: React.FC = () => {
  const { sun, score, waveProgress } = useGameStore();
  
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-50">
      {/* Sun Counter */}
      <motion.div 
        key={sun}
        initial={{ scale: 1.2, color: '#facc15' }}
        animate={{ scale: 1, color: '#fff' }}
        className="bg-black/80 border-2 border-yellow-500/50 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.2)]"
      >
        <div className="bg-yellow-500 rounded-full p-1.5 animate-pulse shadow-[0_0_15px_#eab308]">
          <Zap size={20} className="text-black fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-yellow-500 font-bold tracking-widest uppercase">Energy</span>
          <span className="text-2xl font-black font-mono leading-none">{sun}</span>
        </div>
      </motion.div>

      {/* Wave Progress */}
      <div className="flex-1 max-w-md mx-8 mt-2">
        <div className="flex justify-between items-end mb-1 px-1">
          <span className="text-[10px] text-rose-500 font-bold tracking-widest uppercase">Zombie Horde</span>
          <span className="text-[10px] text-white/50 font-mono">{Math.floor(waveProgress)}%</span>
        </div>
        <div className="h-3 bg-black/60 rounded-full border border-white/10 overflow-hidden backdrop-blur-sm">
          <motion.div 
            className="h-full bg-gradient-to-r from-rose-600 to-orange-500 shadow-[0_0_15px_rgba(225,29,72,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${waveProgress}%` }}
          />
        </div>
      </div>

      {/* Score */}
      <div className="bg-black/80 border-2 border-emerald-500/50 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)]">
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">Score</span>
          <span className="text-2xl font-black font-mono leading-none">{score.toString().padStart(6, '0')}</span>
        </div>
        <div className="bg-emerald-500 rounded-full p-1.5 shadow-[0_0_15px_#10b981]">
          <Trophy size={20} className="text-black" />
        </div>
      </div>
    </div>
  );
};
