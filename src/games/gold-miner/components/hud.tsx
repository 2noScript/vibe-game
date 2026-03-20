import React from 'react';
import { Trophy, Clock, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { cn } from '../../../lib/utils';

export const HUD: React.FC = () => {
  const { score, goal, level, time } = useGameStore(state => state.gameState);

  return (
    <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10 pointer-events-none">
      <div className="flex flex-col gap-3">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-4 border-2 border-yellow-500/30 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.1)]"
        >
          <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/40">
            <Trophy className="text-yellow-400" size={24} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">CURRENT SCORE</p>
            <p className="text-2xl font-bold text-yellow-400 tracking-tighter">${score}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-3 border-2 border-emerald-500/30 rounded-xl"
        >
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/40">
            <Target className="text-emerald-400" size={20} />
          </div>
          <div>
            <p className="text-[8px] text-zinc-500 uppercase tracking-widest">GOAL</p>
            <p className="text-lg font-bold text-emerald-400 tracking-tighter">${goal}</p>
          </div>
        </motion.div>
      </div>
      
      <div className="flex flex-col items-end gap-3">
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-4 border-2 border-white/10 rounded-xl"
        >
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">LEVEL</p>
            <p className="text-2xl font-bold text-white tracking-tighter">{level.toString().padStart(2, '0')}</p>
          </div>
          <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
            <Zap className="text-white" size={24} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "flex items-center gap-4 bg-black/60 backdrop-blur-md p-3 border-2 rounded-xl transition-colors duration-300",
            time <= 10 ? "border-red-500/50 animate-pulse" : "border-blue-500/30"
          )}
        >
          <div className="text-right">
            <p className="text-[8px] text-zinc-500 uppercase tracking-widest">TIME LEFT</p>
            <p className={cn("text-lg font-bold tracking-tighter", time <= 10 ? "text-red-500" : "text-blue-400")}>
              {time}S
            </p>
          </div>
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", time <= 10 ? "bg-red-500/20 border-red-500/40" : "bg-blue-500/20 border-blue-500/40")}>
            <Clock size={20} className={time <= 10 ? "text-red-500" : "text-blue-400"} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
