import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RefreshCw, Trophy, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useGameStore } from '../store';

export const Overlay: React.FC = () => {
  const { gameState, score, startGame } = useGameStore();
  
  if (gameState === 'playing') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className={cn(
            "max-w-md w-full p-12 rounded-3xl border-4 flex flex-col items-center text-center shadow-2xl relative overflow-hidden",
            gameState === 'start' ? "border-emerald-500 bg-emerald-950/40 shadow-emerald-500/20" :
            gameState === 'victory' ? "border-yellow-500 bg-yellow-950/40 shadow-yellow-500/20" :
            "border-rose-500 bg-rose-950/40 shadow-rose-500/20"
          )}
        >
          {/* Background Glow */}
          <div className={cn(
            "absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[100px] opacity-30",
            gameState === 'start' ? "bg-emerald-500" :
            gameState === 'victory' ? "bg-yellow-500" :
            "bg-rose-500"
          )} />

          {gameState === 'start' && (
            <>
              <div className="bg-emerald-500 rounded-full p-6 mb-8 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                <Play size={64} className="text-black fill-current ml-2" />
              </div>
              <h1 className="text-6xl font-black text-white mb-4 tracking-tighter italic transform -skew-x-12">
                ZOMBIE <span className="text-emerald-500">PLANT</span>
              </h1>
              <p className="text-emerald-400/80 mb-12 font-mono tracking-widest uppercase text-sm">
                Defend your garden from the undead horde
              </p>
            </>
          )}

          {gameState === 'gameover' && (
            <>
              <div className="bg-rose-500 rounded-full p-6 mb-8 shadow-[0_0_50px_rgba(244,63,94,0.5)]">
                <Skull size={64} className="text-black" />
              </div>
              <h1 className="text-6xl font-black text-white mb-4 tracking-tighter italic transform -skew-x-12">
                GAME <span className="text-rose-500">OVER</span>
              </h1>
              <p className="text-rose-400/80 mb-4 font-mono tracking-widest uppercase text-sm">
                The zombies reached your house!
              </p>
              <div className="text-4xl font-black text-white mb-12 font-mono">
                SCORE: {score}
              </div>
            </>
          )}

          {gameState === 'victory' && (
            <>
              <div className="bg-yellow-500 rounded-full p-6 mb-8 shadow-[0_0_50px_rgba(234,179,8,0.5)]">
                <Trophy size={64} className="text-black fill-current" />
              </div>
              <h1 className="text-6xl font-black text-white mb-4 tracking-tighter italic transform -skew-x-12">
                VICTORY <span className="text-yellow-500">!</span>
              </h1>
              <p className="text-yellow-400/80 mb-4 font-mono tracking-widest uppercase text-sm">
                You survived the final wave!
              </p>
              <div className="text-4xl font-black text-white mb-12 font-mono">
                SCORE: {score}
              </div>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className={cn(
              "w-full py-6 rounded-2xl text-2xl font-black tracking-widest uppercase italic transition-all duration-300 flex items-center justify-center gap-4",
              gameState === 'start' ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]" :
              gameState === 'victory' ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]" :
              "bg-rose-500 text-black hover:bg-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
            )}
          >
            {gameState === 'start' ? 'PLAY NOW' : 'TRY AGAIN'}
            <RefreshCw size={24} />
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
