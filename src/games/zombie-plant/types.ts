import { Target, Zap, Shield, Snowflake, Flame } from 'lucide-react';

export type PlantType = 'shooter' | 'sunflower' | 'wall' | 'ice-shooter' | 'cherry';
export type ZombieType = 'normal' | 'fast' | 'tank' | 'conehead';

export interface Plant {
  id: string;
  type: PlantType;
  row: number;
  col: number;
  health: number;
  maxHealth: number;
  lastShot?: number;
}

export interface Zombie {
  id: string;
  type: ZombieType;
  row: number;
  x: number;
  health: number;
  maxHealth: number;
  speed: number;
  isEating?: boolean;
  isSlowed?: number;
  lastHit?: number;
}

export interface Projectile {
  id: string;
  type: 'normal' | 'ice';
  row: number;
  x: number;
  damage: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

export interface Sun {
  id: string;
  x: number;
  y: number;
  value: number;
  createdAt: number;
}

export const PLANT_DATA: Record<PlantType, { cost: number; health: number; icon: any; color: string; label: string; description: string }> = {
  'shooter': { cost: 100, health: 100, icon: Target, color: 'bg-emerald-500', label: 'SHOOTER', description: 'Standard defense unit' },
  'sunflower': { cost: 50, health: 80, icon: Zap, color: 'bg-yellow-500', label: 'SUNFLOWER', description: 'Generates energy' },
  'wall': { cost: 50, health: 400, icon: Shield, color: 'bg-zinc-600', label: 'WALL', description: 'High durability' },
  'ice-shooter': { cost: 175, health: 100, icon: Snowflake, color: 'bg-cyan-400', label: 'ICE SHOOTER', description: 'Slows down enemies' },
  'cherry': { cost: 150, health: 50, icon: Flame, color: 'bg-rose-600', label: 'CHERRY BOMB', description: 'Area explosion' },
};
