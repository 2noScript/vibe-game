import { create } from 'zustand';
import { GameStatus, Entity, Position } from './types';

interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  level: number;
  lives: number;
  
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  addScore: (points: number) => void;
  loseLife: () => void;
  nextLevel: () => void;
  completeLevel: () => void;
}

export const useStore = create<GameState>((set) => ({
  status: GameStatus.MENU,
  score: 0,
  highScore: 0,
  level: 1,
  lives: 3,

  startGame: () => set({ status: GameStatus.PLAYING, score: 0, lives: 3, level: 1 }),
  endGame: () => set((state) => ({ 
    status: GameStatus.GAME_OVER,
    highScore: Math.max(state.score, state.highScore)
  })),
  resetGame: () => set({ status: GameStatus.MENU, score: 0, lives: 3, level: 1 }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  loseLife: () => set((state) => {
    const newLives = state.lives - 1;
    if (newLives <= 0) {
      return { lives: 0, status: GameStatus.GAME_OVER, highScore: Math.max(state.score, state.highScore) };
    }
    return { lives: newLives };
  }),
  nextLevel: () => set((state) => ({ level: state.level + 1, status: GameStatus.PLAYING })),
  completeLevel: () => set({ status: GameStatus.LEVEL_COMPLETE }),
}));
