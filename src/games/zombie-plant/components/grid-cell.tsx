import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plant, PLANT_DATA } from '../types';

import { useGameStore } from '../store';

interface GridCellProps {
  row: number;
  col: number;
  onClick: () => void;
}

export const GridCell: React.FC<GridCellProps> = ({ row, col, onClick }) => {
  const { plants, selectedPlant, isShovelSelected, sun } = useGameStore();
  const plant = plants.find(p => p.row === row && p.col === col);
  const isSelected = !!selectedPlant;
  const canPlace = selectedPlant ? sun >= PLANT_DATA[selectedPlant].cost : false;

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-20 h-20 border border-white/5 flex items-center justify-center transition-all duration-200 relative group cursor-pointer",
        (row + col) % 2 === 0 ? "bg-emerald-900/10" : "bg-emerald-900/20",
        isSelected && canPlace && !plant && "bg-emerald-400/20 ring-4 ring-emerald-400/50 z-10",
        isShovelSelected && plant && "bg-rose-400/20 ring-4 ring-rose-400/50 z-10"
      )}
    >
      {/* Cell Hover Indicator */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/5 transition-opacity pointer-events-none" />

      <AnimatePresence mode="wait">
        {plant && (
          <motion.div
            key={plant.id}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 20 }}
            className={cn(
              "relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-4 transition-all duration-300",
              PLANT_DATA[plant.type].color,
              "border-white/30 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
            )}
          >
            <div className="absolute inset-0 bg-black/10 rounded-xl" />
            {React.createElement(PLANT_DATA[plant.type].icon, { size: 32, className: "text-white relative z-10" })}
            
            {/* Health Bar */}
            <div className="absolute -bottom-3 left-0 right-0 h-1.5 bg-black/60 border border-white/10 overflow-hidden rounded-full shadow-lg">
              <motion.div 
                className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]" 
                initial={{ width: '100%' }}
                animate={{ width: `${(plant.health / plant.maxHealth) * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
