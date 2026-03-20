import { Rect } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const SPEED = 4;
export const BULLET_SPEED = 10;
export const LEVEL_LENGTH = 4000;

export const PLATFORMS: Rect[] = [
  { x: 0, y: 500, w: 1000, h: 100 },
  { x: 1200, y: 500, w: 800, h: 100 },
  { x: 2200, y: 500, w: 2000, h: 100 },
  // Floating platforms
  { x: 400, y: 350, w: 200, h: 20 },
  { x: 700, y: 250, w: 200, h: 20 },
  { x: 1000, y: 350, w: 200, h: 20 },
  { x: 1500, y: 350, w: 200, h: 20 },
  { x: 1800, y: 250, w: 300, h: 20 },
  { x: 2400, y: 350, w: 200, h: 20 },
  { x: 2800, y: 250, w: 200, h: 20 },
  { x: 3200, y: 350, w: 400, h: 20 },
];

export const checkCollision = (r1: Rect, r2: Rect) => {
  return r1.x < r2.x + r2.w &&
         r1.x + r1.w > r2.x &&
         r1.y < r2.y + r2.h &&
         r1.y + r1.h > r2.y;
};
