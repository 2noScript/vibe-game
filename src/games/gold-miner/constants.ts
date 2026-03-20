export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const ORIGIN_X = CANVAS_WIDTH / 2;
export const ORIGIN_Y = 80;
export const CLAW_SPEED = 12;
export const SWING_SPEED = 0.035;
export const MAX_ANGLE = Math.PI / 2.2;

import { Item, ItemType } from './types';

export const ITEM_DEFS: Record<ItemType, Omit<Item, 'id' | 'x' | 'y' | 'rotation' | 'points'>> = {
  gold_large: { type: 'gold_large', radius: 45, value: 500, weight: 0.25, color: '#FFD700' },
  gold_medium: { type: 'gold_medium', radius: 28, value: 250, weight: 0.45, color: '#FFD700' },
  gold_small: { type: 'gold_small', radius: 16, value: 50, weight: 0.85, color: '#FFD700' },
  rock_large: { type: 'rock_large', radius: 50, value: 20, weight: 0.12, color: '#8B7D7B' },
  rock_small: { type: 'rock_small', radius: 26, value: 11, weight: 0.35, color: '#8B7D7B' },
  diamond: { type: 'diamond', radius: 12, value: 600, weight: 1.0, color: '#E0FFFF' },
  mystery: { type: 'mystery', radius: 20, value: 0, weight: 0.6, color: '#9370DB' },
};
