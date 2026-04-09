export type OreType = 'iron' | 'copper';

export interface Tile {
  x: number;
  y: number;
  oreType: OreType;
  purity: number; // 30-100
  building: Building | null;
}

export type BuildingType = 'miner' | 'refinery' | 'foundry';

export interface Building {
  type: BuildingType;
  level: number; // 1-3
  active: boolean;
  oreTarget?: OreType; // for refinery/foundry: which ore to process
}

export type ResourceKey =
  | 'iron_ore' | 'copper_ore'
  | 'refined_iron' | 'refined_copper'
  | 'iron_ingot' | 'copper_ingot';

export type Inventory = Record<ResourceKey, number>;

export interface GameState {
  grid: Tile[][];
  inventory: Inventory;
  currency: number;
  seed: number;
  tickCount: number;
}

export const GRID_SIZE = 20;

export const BUILDING_COSTS: Record<BuildingType, number[]> = {
  miner:    [50, 150, 400],
  refinery: [100, 300, 700],
  foundry:  [120, 350, 800],
};

export const UPGRADE_COSTS: Record<BuildingType, number[]> = {
  miner:    [0, 150, 400],
  refinery: [0, 300, 700],
  foundry:  [0, 350, 800],
};

export const SELL_PRICES: Partial<Record<ResourceKey, number>> = {
  iron_ore: 1,
  copper_ore: 1,
  refined_iron: 1.2,
  refined_copper: 1.2,
  iron_ingot: 4,
  copper_ingot: 4,
};

export const MINER_BASE_RATE = 10; // per hour
export const REFINERY_MULTIPLIERS = [1.2, 1.4, 1.6];
export const FOUNDRY_INPUT = 10;
export const FOUNDRY_OUTPUT = 5;
export const FOUNDRY_SPEED = [1, 1.5, 2]; // batches per cycle multiplier
