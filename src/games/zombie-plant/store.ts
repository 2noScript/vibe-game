import { create } from 'zustand';
import { PlantType, ZombieType, Plant, Zombie, Projectile, FloatingText, Sun, PLANT_DATA } from './types';
import { INITIAL_SUN, GRID_ROWS, GRID_COLS, CELL_SIZE } from './constants';

interface GameState {
  gameState: 'start' | 'playing' | 'gameover' | 'victory';
  sun: number;
  score: number;
  plants: Plant[];
  zombies: Zombie[];
  projectiles: Projectile[];
  suns: Sun[];
  floatingTexts: FloatingText[];
  selectedPlant: PlantType | null;
  isShovelSelected: boolean;
  waveProgress: number;
  screenShake: boolean;

  // Actions
  setGameState: (state: 'start' | 'playing' | 'gameover' | 'victory') => void;
  setSun: (amount: number | ((prev: number) => number)) => void;
  setScore: (amount: number | ((prev: number) => number)) => void;
  setPlants: (plants: Plant[] | ((prev: Plant[]) => Plant[])) => void;
  setZombies: (zombies: Zombie[] | ((prev: Zombie[]) => Zombie[])) => void;
  setProjectiles: (projectiles: Projectile[] | ((prev: Projectile[]) => Projectile[])) => void;
  setSuns: (suns: Sun[] | ((prev: Sun[]) => Sun[])) => void;
  setFloatingTexts: (texts: FloatingText[] | ((prev: FloatingText[]) => FloatingText[])) => void;
  setSelectedPlant: (type: PlantType | null) => void;
  setIsShovelSelected: (selected: boolean) => void;
  setWaveProgress: (progress: number) => void;
  triggerShake: () => void;
  
  // Game Logic Actions
  startGame: () => void;
  spawnZombie: () => void;
  spawnSun: () => void;
  addFloatingText: (x: number, y: number, text: string, color: string) => void;
  collectSun: (id: string, value: number, x: number, y: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gameState: 'start',
  sun: INITIAL_SUN,
  score: 0,
  plants: [],
  zombies: [],
  projectiles: [],
  suns: [],
  floatingTexts: [],
  selectedPlant: null,
  isShovelSelected: false,
  waveProgress: 0,
  screenShake: false,

  setGameState: (state) => set({ gameState: state }),
  setSun: (amount) => set((state) => ({ sun: typeof amount === 'function' ? amount(state.sun) : amount })),
  setScore: (amount) => set((state) => ({ score: typeof amount === 'function' ? amount(state.score) : amount })),
  setPlants: (plants) => set((state) => ({ plants: typeof plants === 'function' ? plants(state.plants) : plants })),
  setZombies: (zombies) => set((state) => ({ zombies: typeof zombies === 'function' ? zombies(state.zombies) : zombies })),
  setProjectiles: (projectiles) => set((state) => ({ projectiles: typeof projectiles === 'function' ? projectiles(state.projectiles) : projectiles })),
  setSuns: (suns) => set((state) => ({ suns: typeof suns === 'function' ? suns(state.suns) : suns })),
  setFloatingTexts: (texts) => set((state) => ({ floatingTexts: typeof texts === 'function' ? texts(state.floatingTexts) : texts })),
  setSelectedPlant: (type) => set({ selectedPlant: type, isShovelSelected: false }),
  setIsShovelSelected: (selected) => set({ isShovelSelected: selected, selectedPlant: null }),
  setWaveProgress: (progress) => set({ waveProgress: progress }),
  
  triggerShake: () => {
    set({ screenShake: true });
    setTimeout(() => set({ screenShake: false }), 200);
  },

  startGame: () => set({
    gameState: 'playing',
    sun: INITIAL_SUN,
    score: 0,
    plants: [],
    zombies: [],
    projectiles: [],
    suns: [],
    floatingTexts: [],
    selectedPlant: null,
    isShovelSelected: false,
    waveProgress: 0,
  }),

  spawnZombie: () => {
    const row = Math.floor(Math.random() * GRID_ROWS);
    const rand = Math.random();
    let type: ZombieType = 'normal';
    let health = 100;
    let speed = 0.5 + Math.random() * 0.3;

    if (rand > 0.9) {
      type = 'tank';
      health = 400;
      speed = 0.25;
    } else if (rand > 0.75) {
      type = 'conehead';
      health = 200;
      speed = 0.5;
    } else if (rand > 0.6) {
      type = 'fast';
      health = 60;
      speed = 1.2;
    }

    const newZombie: Zombie = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      row,
      x: GRID_COLS * CELL_SIZE + 80,
      health,
      maxHealth: health,
      speed,
    };
    set((state) => ({ zombies: [...state.zombies, newZombie] }));
  },

  spawnSun: () => {
    const newSun: Sun = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (GRID_COLS * CELL_SIZE - 50),
      y: -50,
      value: 25,
      createdAt: Date.now(),
    };
    set((state) => ({ suns: [...state.suns, newSun] }));
  },

  addFloatingText: (x, y, text, color) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      floatingTexts: [...state.floatingTexts, { id, x, y, text, color }]
    }));
    setTimeout(() => {
      set((state) => ({
        floatingTexts: state.floatingTexts.filter(t => t.id !== id)
      }));
    }, 1000);
  },

  collectSun: (id, value, x, y) => {
    const { addFloatingText } = get();
    set((state) => ({
      sun: state.sun + value,
      suns: state.suns.filter(s => s.id !== id)
    }));
    addFloatingText(x, y, `+${value}`, 'text-yellow-400');
  },
}));
