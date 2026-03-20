import { create } from 'zustand';
import { BlockType, Block, GameState, Player, Upgrade } from './types';
import { audio } from './audio';

const WIDTH = 12;
const HEIGHT = 20;
const INITIAL_ENERGY = 100;
const INITIAL_CREDITS = 0;

const generateBlock = (depth: number): Block => {
  const rand = Math.random();
  let type = BlockType.CORRUPTED;
  let durability = 1;

  if (depth > 15) {
    if (rand < 0.1) type = BlockType.CORE_FRAGMENT;
    else if (rand < 0.3) type = BlockType.ENCRYPTED_FILE;
    else if (rand < 0.6) type = BlockType.FIREWALL;
  } else if (depth > 5) {
    if (rand < 0.1) type = BlockType.ENCRYPTED_FILE;
    else if (rand < 0.4) type = BlockType.FIREWALL;
    else if (rand < 0.7) type = BlockType.DATA_PACKET;
  } else {
    if (rand < 0.1) type = BlockType.DATA_PACKET;
    else if (rand < 0.2) type = BlockType.FIREWALL;
  }

  if (type === BlockType.FIREWALL) durability = 3;
  if (type === BlockType.CORE_FRAGMENT) durability = 5;
  if (type === BlockType.ENCRYPTED_FILE) durability = 2;
  if (type === BlockType.CORRUPTED) durability = 1;
  if (type === BlockType.DATA_PACKET) durability = 1;

  return { type, durability, revealed: false };
};

const generateGrid = (width: number, height: number): Block[][] => {
  const grid: Block[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Block[] = [];
    for (let x = 0; x < width; x++) {
      if (y === 0) {
        row.push({ type: BlockType.EMPTY, durability: 0, revealed: true });
      } else if (y === height - 1) {
        row.push({ type: BlockType.BEDROCK, durability: 999, revealed: true });
      } else {
        row.push(generateBlock(y));
      }
    }
    grid.push(row);
  }
  return grid;
};

interface Store extends GameState {
  initGame: () => void;
  move: (dx: number, dy: number) => void;
  mine: (x: number, y: number) => void;
  sellResources: () => void;
  buyUpgrade: (upgradeId: keyof GameState['upgrades']) => void;
  recharge: () => void;
}

export const useStore = create<Store>((set, get) => ({
  grid: [],
  width: WIDTH,
  height: HEIGHT,
  depth: 0,
  message: null,
  player: {
    x: Math.floor(WIDTH / 2),
    y: 0,
    energy: INITIAL_ENERGY,
    maxEnergy: INITIAL_ENERGY,
    credits: INITIAL_CREDITS,
    inventory: {},
  },
  upgrades: {
    drillPower: { id: 'drillPower', name: 'DRILL BIT', cost: 50, level: 1, maxLevel: 5, description: 'Mine harder blocks faster.' },
    battery: { id: 'battery', name: 'BATTERY', cost: 100, level: 1, maxLevel: 5, description: 'Increase max energy.' },
    cooling: { id: 'cooling', name: 'COOLING', cost: 75, level: 1, maxLevel: 5, description: 'Reduce energy cost.' },
  },

  initGame: () => {
    set({
      grid: generateGrid(WIDTH, HEIGHT),
      player: {
        x: Math.floor(WIDTH / 2),
        y: 0,
        energy: INITIAL_ENERGY,
        maxEnergy: INITIAL_ENERGY,
        credits: INITIAL_CREDITS,
        inventory: {},
      },
      depth: 0,
      message: 'SYSTEM ONLINE. BEGIN EXTRACTION.',
    });
  },

  move: (dx, dy) => {
    const { player, grid, width, height } = get();
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX < 0 || newX >= width || newY < 0 || newY >= height) return;

    const targetBlock = grid[newY][newX];

    // If empty, move
    if (targetBlock.type === BlockType.EMPTY) {
      if (player.energy < 1) {
        audio.playError();
        set({ message: 'ENERGY DEPLETED. RETURN TO SURFACE.' });
        return;
      }
      
      audio.playMove();
      // Reveal adjacent blocks
      const newGrid = [...grid.map(row => [...row])];
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      directions.forEach(([ax, ay]) => {
        const axPos = newX + ax;
        const ayPos = newY + ay;
        if (axPos >= 0 && axPos < width && ayPos >= 0 && ayPos < height) {
          newGrid[ayPos][axPos] = { ...newGrid[ayPos][axPos], revealed: true };
        }
      });

      set({
        player: { ...player, x: newX, y: newY, energy: player.energy - 0.5 },
        grid: newGrid,
        depth: newY,
        message: null,
      });
    } else {
      // Mine block
      get().mine(newX, newY);
    }
  },

  mine: (x, y) => {
    const { player, grid, upgrades } = get();
    const block = grid[y][x];

    if (block.type === BlockType.BEDROCK) {
      audio.playError();
      set({ message: 'CANNOT MINE BEDROCK.' });
      return;
    }

    const energyCost = Math.max(1, 5 - upgrades.cooling.level);
    if (player.energy < energyCost) {
      audio.playError();
      set({ message: 'NOT ENOUGH ENERGY.' });
      return;
    }

    const damage = upgrades.drillPower.level;
    const newDurability = block.durability - damage;

    const newGrid = [...grid.map(row => [...row])];
    
    if (newDurability <= 0) {
      audio.playBreak();
      // Block destroyed
      newGrid[y][x] = { ...block, type: BlockType.EMPTY, durability: 0, revealed: true };
      
      // Add to inventory
      const newInventory = { ...player.inventory };
      // @ts-ignore
      newInventory[block.type] = (newInventory[block.type] || 0) + 1;

      // Reveal adjacent blocks
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      directions.forEach(([ax, ay]) => {
        const axPos = x + ax;
        const ayPos = y + ay;
        if (axPos >= 0 && axPos < get().width && ayPos >= 0 && ayPos < get().height) {
          newGrid[ayPos][axPos] = { ...newGrid[ayPos][axPos], revealed: true };
        }
      });

      set({
        grid: newGrid,
        player: { ...player, energy: player.energy - energyCost, inventory: newInventory },
        message: `MINED ${block.type}`,
      });
    } else {
      audio.playHit();
      // Block damaged
      newGrid[y][x] = { ...block, durability: newDurability };
      set({
        grid: newGrid,
        player: { ...player, energy: player.energy - energyCost },
        message: 'MINING...',
      });
    }
  },

  sellResources: () => {
    const { player } = get();
    let totalValue = 0;
    const prices: Record<string, number> = {
      [BlockType.CORRUPTED]: 1,
      [BlockType.DATA_PACKET]: 10,
      [BlockType.FIREWALL]: 5,
      [BlockType.ENCRYPTED_FILE]: 50,
      [BlockType.CORE_FRAGMENT]: 200,
    };

    Object.entries(player.inventory).forEach(([type, count]) => {
      // @ts-ignore
      if (prices[type]) {
        // @ts-ignore
        totalValue += prices[type] * (count || 0);
      }
    });

    if (totalValue > 0) {
      audio.playSell();
      set({
        player: { ...player, credits: player.credits + totalValue, inventory: {}, energy: player.maxEnergy },
        message: `SOLD RESOURCES FOR ${totalValue} CREDITS. ENERGY RECHARGED.`,
      });
    } else {
      audio.playMove();
      set({
        player: { ...player, energy: player.maxEnergy },
        message: 'ENERGY RECHARGED.',
      });
    }
  },

  buyUpgrade: (upgradeId) => {
    const { player, upgrades } = get();
    const upgrade = upgrades[upgradeId];

    if (!upgrade) return;
    if (upgrade.level >= upgrade.maxLevel) {
      audio.playError();
      set({ message: 'MAX LEVEL REACHED.' });
      return;
    }
    if (player.credits < upgrade.cost) {
      audio.playError();
      set({ message: 'INSUFFICIENT CREDITS.' });
      return;
    }

    audio.playUpgrade();
    const newLevel = upgrade.level + 1;
    const newCost = Math.floor(upgrade.cost * 1.5);
    
    let newMaxEnergy = player.maxEnergy;
    if (upgradeId === 'battery') {
      newMaxEnergy += 50;
    }

    set({
      player: { ...player, credits: player.credits - upgrade.cost, maxEnergy: newMaxEnergy },
      upgrades: {
        ...upgrades,
        [upgradeId]: { ...upgrade, level: newLevel, cost: newCost },
      },
      message: `UPGRADED ${upgrade.name} TO LEVEL ${newLevel}`,
    });
  },

  recharge: () => {
    const { player } = get();
    set({ player: { ...player, energy: player.maxEnergy }, message: 'ENERGY RECHARGED.' });
  }
}));
