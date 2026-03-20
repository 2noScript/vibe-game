import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Sun as SunType } from '../types';

import { useGameStore } from '../store';

interface SunProps {
  sun: SunType;
}

export const Sun: React.FC<SunProps> = ({ sun: s }) => {
  const collectSun = useGameStore(state => state.collectSun);
  
  return (
    <motion.div
      key={s.id}
      initial={{ scale: 0, y: s.y - 100 }}
      animate={{ scale: 1, y: s.y }}
      whileHover={{ scale: 1.2 }}
      onClick={() => collectSun(s.id, s.value, s.x + 100, s.y)}
      className="absolute z-40 cursor-pointer"
      style={{ left: s.x, top: s.y }}
    >
      <div className="relative w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_20px_#facc15] border-4 border-white/50">
        <Zap size={24} className="text-black fill-current animate-pulse" />
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-30" />
      </div>
    </motion.div>
  );
};
