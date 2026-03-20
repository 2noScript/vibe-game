export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Obstacle {
  id: string;
  position: Position;
  type: 'CAR' | 'BARRIER';
  speed: number;
  lane: number; // -1, 0, 1
}

export interface GameState {
  status: GameStatus;
  score: number;
  speed: number;
  distance: number;
  lane: number; // -1 (Left), 0 (Center), 1 (Right)
}
