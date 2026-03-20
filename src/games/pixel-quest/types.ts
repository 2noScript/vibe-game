export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Position;
  width: number;
  height: number;
  type: 'PLAYER' | 'PLATFORM' | 'COIN' | 'ENEMY' | 'EXIT';
  velocity?: Position;
}

export interface Level {
  id: number;
  entities: Entity[];
  spawnPoint: Position;
  width: number;
  height: number;
}
