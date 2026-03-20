export type ItemType = 'gold_large' | 'gold_medium' | 'gold_small' | 'rock_large' | 'rock_small' | 'diamond' | 'mystery';

export interface Item {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  radius: number;
  value: number;
  weight: number;
  color: string;
  rotation: number;
  points: { x: number; y: number }[];
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

export interface GameState {
  status: 'START' | 'PLAYING' | 'LEVEL_CLEAR' | 'GAME_OVER' | 'WIN';
  level: number;
  score: number;
  goal: number;
  time: number;
}
