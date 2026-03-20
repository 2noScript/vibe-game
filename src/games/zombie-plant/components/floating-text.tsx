import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FloatingText as FloatingTextType } from '../types';

import { useGameStore } from '../store';

export const FloatingText: React.FC = () => {
  const { floatingTexts } = useGameStore();
  
  return (
    <AnimatePresence>
      {floatingTexts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 1, y: t.y }}
          animate={{ opacity: 0, y: t.y - 50 }}
          className={cn("absolute z-[60] pointer-events-none text-xs font-black italic transform -skew-x-12", t.color)}
          style={{ left: t.x }}
        >
          {t.text}
        </motion.div>
      ))}
    </AnimatePresence>
  );
};
