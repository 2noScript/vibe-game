import { create } from 'zustand';
import { GameState } from './types';
import { GoldMinerEngine } from './core/engine';
import { audio } from './audio';

interface GoldMinerStore {
  gameState: GameState;
  engine: GoldMinerEngine | null;

  // Actions
  setGameState: (status: GameState['status']) => void;
  startGame: () => void;
  nextLevel: () => void;
  update: (dt: number) => void;
}

export const useGameStore = create<GoldMinerStore>((set, get) => ({
  gameState: {
    status: 'START',
    level: 1,
    score: 0,
    goal: 650,
    time: 60,
  },
  engine: null,

  setGameState: (status) => set((state) => ({ gameState: { ...state.gameState, status } })),

  startGame: () => {
    audio.init();
    const { engine: oldEngine } = get();
    if (oldEngine) oldEngine.destroy();

    const initialGameState: GameState = {
      status: 'PLAYING',
      level: 1,
      score: 0,
      goal: 650,
      time: 60,
    };
    
    const onScore = (val: number) => set((s) => ({ gameState: { ...s.gameState, score: s.gameState.score + val } }));
    const onStateChange = (status: GameState['status']) => set((s) => ({ gameState: { ...s.gameState, status } }));
    
    const engine = new GoldMinerEngine(initialGameState, onScore, onStateChange);
    engine.generateLevel(1);
    
    set({
      gameState: initialGameState,
      engine,
    });
  },

  nextLevel: () => {
    audio.init();
    const { level, goal, score } = get().gameState;
    const { engine: oldEngine } = get();
    if (oldEngine) oldEngine.destroy();

    const nextLvl = level + 1;
    const nextGameState: GameState = {
      status: 'PLAYING',
      level: nextLvl,
      score,
      goal: goal + nextLvl * 500 + 200,
      time: 60,
    };
    
    const onScore = (val: number) => set((s) => ({ gameState: { ...s.gameState, score: s.gameState.score + val } }));
    const onStateChange = (status: GameState['status']) => set((s) => ({ gameState: { ...s.gameState, status } }));
    
    const engine = new GoldMinerEngine(nextGameState, onScore, onStateChange);
    engine.generateLevel(nextLvl);
    
    set({
      gameState: nextGameState,
      engine,
    });
  },

  update: (dt) => {
    const { engine, gameState } = get();
    if (!engine || gameState.status !== 'PLAYING') return;

    engine.gameState = gameState; // Keep engine in sync with store state
    engine.update(dt);
    
    // Trigger re-render by updating engine reference or another state
    set({ engine }); 
  },
}));
