import { create } from 'zustand';

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  BOSS_FIGHT = 'BOSS_FIGHT',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  level: number;
  weaponLevel: number;
  bossHealth: number;
  maxBossHealth: number;
  
  startGame: () => void;
  restartGame: () => void;
  addScore: (amount: number) => void;
  takeDamage: () => void;
  setStatus: (status: GameStatus) => void;
  nextLevel: () => void;
  upgradeWeapon: () => void;
  setBossHealth: (hp: number, maxHp?: number) => void;
}

export const useStore = create<GameState>((set) => ({
  status: GameStatus.MENU,
  score: 0,
  lives: 3,
  level: 1,
  weaponLevel: 1,
  bossHealth: 0,
  maxBossHealth: 100,

  startGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 3, 
    level: 1, 
    weaponLevel: 1,
    bossHealth: 0 
  }),
  
  restartGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 3, 
    level: 1, 
    weaponLevel: 1,
    bossHealth: 0 
  }),
  
  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  
  takeDamage: () => set((state) => {
    const newLives = state.lives - 1;
    if (newLives <= 0) {
      return { lives: 0, status: GameStatus.GAME_OVER };
    }
    return { lives: newLives };
  }),

  setStatus: (status) => set({ status }),
  
  nextLevel: () => set((state) => ({ 
    level: state.level + 1, 
    status: GameStatus.PLAYING 
  })),

  upgradeWeapon: () => set((state) => ({ 
    weaponLevel: Math.min(state.weaponLevel + 1, 3) 
  })),

  setBossHealth: (hp, maxHp) => set((state) => ({ 
    bossHealth: hp,
    maxBossHealth: maxHp !== undefined ? maxHp : state.maxBossHealth
  })),
}));
