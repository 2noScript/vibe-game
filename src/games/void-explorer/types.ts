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

export interface Asteroid {
  id: string;
  position: Position;
  scale: number;
  rotation: Position;
  speed: number;
}

export interface Star {
  id: string;
  position: Position;
  size: number;
}
