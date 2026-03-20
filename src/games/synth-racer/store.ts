import { create } from 'zustand';
import { GameStatus } from './types';

interface State {
  status: GameStatus;
  score: number;
  speed: number;
  distance: number;
  lane: number; // -1, 0, 1
  highScore: number;

  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  setLane: (lane: number) => void;
  updateGame: (delta: number) => void;
  addScore: (points: number) => void;
}

export const useStore = create<State>((set) => ({
  status: GameStatus.MENU,
  score: 0,
  speed: 0,
  distance: 0,
  lane: 0,
  highScore: 0,

  startGame: () => set({ status: GameStatus.PLAYING, score: 0, speed: 20, distance: 0, lane: 0 }),
  endGame: () => set((state) => ({ 
    status: GameStatus.GAME_OVER, 
    speed: 0,
    highScore: Math.max(state.score, state.highScore)
  })),
  resetGame: () => set({ status: GameStatus.MENU, score: 0, speed: 0, distance: 0, lane: 0 }),
  setLane: (lane) => set({ lane: Math.max(-1, Math.min(1, lane)) }),
  updateGame: (delta) => set((state) => {
    if (state.status !== GameStatus.PLAYING) return {};
    const newSpeed = Math.min(state.speed + delta * 0.5, 60); // Accelerate
    return {
      speed: newSpeed,
      distance: state.distance + newSpeed * delta,
      score: state.score + Math.floor(newSpeed * delta * 10)
    };
  }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
}));
