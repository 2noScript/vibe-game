import React from 'react';
import { Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';

export const Overlay: React.FC = () => {
  const { status, score, goal } = useGameStore(state => state.gameState);
  const { startGame, nextLevel } = useGameStore();

  return (
    <AnimatePresence>
      {status === 'START' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md z-50"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Star size={80} className="text-yellow-500 animate-[spin_10s_linear_infinite]" />
                <Trophy size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-200" />
              </div>
            </div>
            <h1 className="text-7xl font-black text-yellow-500 mb-2 tracking-tighter italic">GOLD MINER</h1>
            <p className="text-zinc-500 mb-12 text-sm tracking-[0.3em] font-bold">DEEP EARTH EXPEDITION</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-8 text-xs text-zinc-400 mb-8">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-white">SPACE</kbd>
                  <span>SHOOT CLAW</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-white">↓</kbd>
                  <span>GRAB ITEM</span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="group relative px-12 py-5 bg-yellow-500 text-black font-black text-2xl hover:bg-yellow-400 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                <span className="relative">START MINING</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {status === 'GAME_OVER' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center backdrop-blur-xl z-50"
        >
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <h2 className="text-7xl font-black text-white mb-4 tracking-tighter">GAME OVER</h2>
            <div className="bg-black/40 p-8 rounded-2xl border-2 border-white/10 mb-12">
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2">FINAL EARNINGS</p>
              <p className="text-5xl font-bold text-yellow-500 mb-4">${score}</p>
              <p className="text-zinc-500 text-[10px] uppercase">MISSED GOAL BY ${goal - score}</p>
            </div>
            <button
              onClick={startGame}
              className="px-12 py-5 bg-white text-black font-black text-2xl hover:bg-zinc-200 transition-all"
            >
              TRY AGAIN
            </button>
          </motion.div>
        </motion.div>
      )}

      {status === 'LEVEL_CLEAR' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center backdrop-blur-xl z-50"
        >
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <h2 className="text-7xl font-black text-white mb-4 tracking-tighter">LEVEL CLEAR</h2>
            <div className="bg-black/40 p-8 rounded-2xl border-2 border-white/10 mb-12">
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2">CURRENT EARNINGS</p>
              <p className="text-5xl font-bold text-yellow-500 mb-4">${score}</p>
              <p className="text-emerald-500 text-[10px] uppercase tracking-widest">GOAL REACHED!</p>
            </div>
            <button
              onClick={nextLevel}
              className="px-12 py-5 bg-emerald-500 text-black font-black text-2xl hover:bg-emerald-400 transition-all"
            >
              NEXT LEVEL
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
