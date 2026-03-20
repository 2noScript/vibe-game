import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PlantType, PLANT_DATA } from '../types';

import { useGameStore } from '../store';

interface PlantCardProps {
  type: PlantType;
}

export const PlantCard: React.FC<PlantCardProps> = ({ type }) => {
  const { sun, selectedPlant, setSelectedPlant, isShovelSelected, setIsShovelSelected } = useGameStore();
  const data = PLANT_DATA[type];
  const selected = selectedPlant === type;
  const canAfford = sun >= data.cost;

  const handleClick = () => {
    if (canAfford) {
      setSelectedPlant(type);
      setIsShovelSelected(false);
    }
  };

  return (
    <motion.button
      whileHover={canAfford ? { scale: 1.05, y: -5 } : {}}
      whileTap={canAfford ? { scale: 0.95 } : {}}
      onClick={handleClick}
      disabled={!canAfford}
      className={cn(
        "relative w-24 h-32 rounded-2xl flex flex-col items-center justify-between p-3 transition-all duration-300 border-4 overflow-hidden",
        selected 
          ? "border-emerald-400 bg-emerald-900/40 shadow-[0_0_30px_rgba(52,211,153,0.4)]" 
          : "border-white/10 bg-black/60 backdrop-blur-md",
        !canAfford && "opacity-40 grayscale cursor-not-allowed"
      )}
    >
      {/* Cost Badge */}
      <div className={cn(
        "absolute top-0 right-0 px-2 py-1 rounded-bl-xl text-[10px] font-black font-mono",
        canAfford ? "bg-yellow-500 text-black" : "bg-zinc-700 text-zinc-400"
      )}>
        {data.cost}
      </div>

      {/* Icon Container */}
      <div className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center shadow-inner",
        data.color,
        "shadow-[inset_0_0_15px_rgba(0,0,0,0.3)]"
      )}>
        <data.icon size={28} className="text-white" />
      </div>

      {/* Label */}
      <div className="text-center">
        <div className="text-[10px] font-black tracking-tighter text-white/90 uppercase leading-none mb-1">
          {data.label}
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div className={cn("h-full bg-white/40", selected && "bg-emerald-400")} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Selected Glow */}
      {selected && (
        <motion.div 
          layoutId="plant-glow"
          className="absolute inset-0 border-2 border-emerald-400/50 rounded-2xl animate-pulse pointer-events-none"
        />
      )}
    </motion.button>
  );
};
