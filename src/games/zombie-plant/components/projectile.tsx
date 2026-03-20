import React from 'react';
import { cn } from '@/lib/utils';
import { Projectile as ProjectileType } from '../types';

interface ProjectileProps {
  projectile: ProjectileType;
}

export const Projectile: React.FC<ProjectileProps> = ({ projectile: p }) => {
  return (
    <div
      key={p.id}
      className="absolute z-25"
      style={{ left: p.x, top: p.row * 80 + 80 / 2 - 12 }}
    >
      {/* Trail Effect */}
      <div className={cn(
        "absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-2 opacity-30 blur-sm",
        p.type === 'ice' ? "bg-cyan-400" : "bg-emerald-400"
      )} />
      
      <div className={cn(
        "w-6 h-6 rounded-full border-4 border-white shadow-lg",
        p.type === 'ice' ? "bg-cyan-400 shadow-[0_0_15px_#06b6d4]" : "bg-emerald-400 shadow-[0_0_15px_#10b981]"
      )}>
        <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
      </div>
    </div>
  );
};
