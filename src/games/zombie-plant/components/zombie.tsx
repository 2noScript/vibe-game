import React from 'react';
import { motion } from 'framer-motion';
import { Skull, Target, Shield, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Zombie as ZombieType } from '../types';

interface ZombieProps {
  zombie: ZombieType;
}

export const Zombie: React.FC<ZombieProps> = ({ zombie: z }) => {
  const isSlowed = z.isSlowed && Date.now() < z.isSlowed;

  return (
    <motion.div
      key={z.id}
      initial={{ x: 800, opacity: 0 }}
      animate={{ 
        x: z.x, 
        opacity: 1,
        filter: isSlowed ? 'hue-rotate(180deg) brightness(1.2)' : 'hue-rotate(0deg) brightness(1)',
        scale: z.isEating ? [1, 1.1, 1] : 1
      }}
      transition={{ 
        x: { duration: 0.1, ease: "linear" },
        filter: { duration: 0.3 },
        scale: { repeat: Infinity, duration: 0.5 }
      }}
      className="absolute z-30"
      style={{ top: z.row * 80 + 10 }}
    >
      <div className={cn(
        "relative w-16 h-16 border-4 border-white/30 flex flex-col items-center justify-center transition-all duration-300 rounded-2xl",
        z.type === 'tank' ? "bg-purple-600 scale-125 shadow-[0_0_30px_rgba(147,51,234,0.4)]" : 
        z.type === 'conehead' ? "bg-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.4)]" :
        z.type === 'fast' ? "bg-orange-500 scale-90" : "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]",
        "shadow-[0_0_20px_rgba(0,0,0,0.5)]",
        isSlowed && "border-cyan-300 shadow-[0_0_25px_#06b6d4]"
      )}>
        <div className="absolute inset-0 bg-black/10 rounded-xl" />
        
        {z.type === 'tank' ? <Shield size={32} className="text-black/50 relative z-10" /> : 
         z.type === 'conehead' ? <Target size={32} className="text-black/50 relative z-10" /> :
         <Skull size={32} className="text-black/50 relative z-10" />}
        
        {/* Health Bar Container */}
        <div className="absolute -bottom-4 left-0 right-0 h-2 bg-black/60 border border-white/10 overflow-hidden rounded-full shadow-lg">
          <motion.div 
            className="absolute inset-0 bg-rose-500 shadow-[0_0_10px_#f43f5e]" 
            initial={{ width: '100%' }}
            animate={{ width: `${(z.health / z.maxHealth) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Slow Effect Icon */}
        {isSlowed && (
          <div className="absolute -top-6 text-cyan-400 animate-bounce">
            <Snowflake size={16} />
          </div>
        )}

        {/* Eating Indicator */}
        {z.isEating && (
          <motion.div 
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 0.3 }}
            className="absolute -right-2 top-1/2 -translate-y-1/2 text-rose-400"
          >
            <Skull size={12} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
