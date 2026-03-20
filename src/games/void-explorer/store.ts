import { create } from 'zustand';
import { GameStatus } from './types';

interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  speed: number;
  health: number;
  multiplier: number;
  shield: number;
  isBoosting: boolean;
  
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  addScore: (points: number) => void;
  takeDamage: (amount: number) => void;
  increaseSpeed: (amount: number) => void;
  setBoosting: (isBoosting: boolean) => void;
  addShield: (amount: number) => void;
  repair: (amount: number) => void;
}

export const useStore = create<GameState>((set) => ({
  status: GameStatus.MENU,
  score: 0,
  highScore: 0,
  speed: 20,
  health: 100,
  multiplier: 1,
  shield: 0,
  isBoosting: false,

  startGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    health: 100, 
    speed: 20, 
    multiplier: 1, 
    shield: 0,
    isBoosting: false 
  }),
  endGame: () => set((state) => ({ 
    status: GameStatus.GAME_OVER,
    highScore: Math.max(state.score, state.highScore)
  })),
  resetGame: () => set({ 
    status: GameStatus.MENU, 
    score: 0, 
    health: 100, 
    speed: 20, 
    multiplier: 1, 
    shield: 0,
    isBoosting: false 
  }),
  addScore: (points) => set((state) => ({ 
    score: state.score + points * state.multiplier,
    multiplier: Math.min(10, state.multiplier + 0.1)
  })),
  takeDamage: (amount) => set((state) => {
    if (state.shield > 0) {
      const newShield = Math.max(0, state.shield - amount);
      return { shield: newShield, multiplier: 1 };
    }
    const newHealth = Math.max(0, state.health - amount);
    if (newHealth <= 0) {
      return { health: 0, status: GameStatus.GAME_OVER, highScore: Math.max(state.score, state.highScore) };
    }
    return { health: newHealth, multiplier: 1 };
  }),
  increaseSpeed: (amount) => set((state) => ({ speed: state.speed + amount })),
  setBoosting: (isBoosting) => set({ isBoosting }),
  addShield: (amount) => set((state) => ({ shield: Math.min(100, state.shield + amount) })),
  repair: (amount) => set((state) => ({ health: Math.min(100, state.health + amount) })),
}));
