export enum BlockType {
  EMPTY = 'EMPTY',
  CORRUPTED = 'CORRUPTED', // Dirt
  DATA_PACKET = 'DATA_PACKET', // Common Resource
  ENCRYPTED_FILE = 'ENCRYPTED_FILE', // Rare Resource
  FIREWALL = 'FIREWALL', // Hard Block
  CORE_FRAGMENT = 'CORE_FRAGMENT', // Very Rare
  BEDROCK = 'BEDROCK', // Unbreakable
}

export interface Block {
  type: BlockType;
  durability: number; // Hits required to break
  revealed: boolean;
}

export interface Player {
  x: number;
  y: number;
  energy: number;
  maxEnergy: number;
  credits: number;
  inventory: {
    [key in BlockType]?: number;
  };
}

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  level: number;
  maxLevel: number;
  description: string;
}

export interface GameState {
  grid: Block[][];
  width: number;
  height: number;
  player: Player;
  upgrades: {
    drillPower: Upgrade;
    battery: Upgrade;
    cooling: Upgrade; // Energy efficiency
  };
  depth: number;
  message: string | null;
}
