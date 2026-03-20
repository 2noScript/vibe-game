import { create } from 'zustand';
import { GameState } from './types';
import { CommandoStrikeEngine } from './core/engine';
import { audio } from './audio';

interface CommandoStrikeStore {
  gameState: GameState;
  engine: CommandoStrikeEngine | null;
  setGameState: (status: GameState['status']) => void;
  startGame: () => void;
  update: (dt: number) => void;
}

export const useGameStore = create<CommandoStrikeStore>((set, get) => ({
  gameState: {
    status: 'START',
    score: 0,
    lives: 3,
  },
  engine: null,

  setGameState: (status) => set((state) => ({ gameState: { ...state.gameState, status } })),

  startGame: () => {
    audio.init();
    const { engine: oldEngine } = get();
    if (oldEngine) oldEngine.destroy();

    const initialGameState: GameState = {
      status: 'PLAYING',
      score: 0,
      lives: 3,
    };
    
    const onScore = (val: number) => set((s) => ({ gameState: { ...s.gameState, score: s.gameState.score + val } }));
    const onStateChange = (status: GameState['status']) => set((s) => ({ gameState: { ...s.gameState, status } }));
    const onLifeLost = () => set((s) => ({ gameState: { ...s.gameState, lives: s.gameState.lives - 1 } }));
    
    const engine = new CommandoStrikeEngine(initialGameState, onScore, onStateChange, onLifeLost);
    engine.init();
    
    set({
      gameState: initialGameState,
      engine,
    });
  },

  update: (dt) => {
    const { engine, gameState } = get();
    if (!engine || gameState.status !== 'PLAYING') return;

    engine.gameState = gameState;
    engine.update(dt);
    
    set({ engine }); 
  },
}));
