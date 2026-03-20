export interface GameState {
  status: 'START' | 'PLAYING' | 'GAME_OVER' | 'WIN';
  score: number;
  lives: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
