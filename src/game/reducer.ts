import {
  GameState, BuildingType, ResourceKey, Inventory,
  BUILDING_COSTS, UPGRADE_COSTS, SELL_PRICES,
  MINER_BASE_RATE, REFINERY_MULTIPLIERS,
  FOUNDRY_INPUT, FOUNDRY_OUTPUT, FOUNDRY_SPEED,
} from './types';
import { generateGrid } from './grid';

export type GameAction =
  | { type: 'PLACE_BUILDING'; x: number; y: number; buildingType: BuildingType }
  | { type: 'UPGRADE_BUILDING'; x: number; y: number }
  | { type: 'DISASSEMBLE'; x: number; y: number }
  | { type: 'TOGGLE_BUILDING'; x: number; y: number }
  | { type: 'SET_ORE_TARGET'; x: number; y: number; oreTarget: 'iron' | 'copper' }
  | { type: 'SELL'; resource: ResourceKey; amount: number }
  | { type: 'CRAFT'; inputResource: ResourceKey; inputAmount: number; outputResource: ResourceKey; outputAmount: number }
  | { type: 'TICK' }
  | { type: 'LOAD'; state: GameState }
  | { type: 'RESET' };

export function createInitialState(): GameState {
  const seed = Date.now();
  return {
    grid: generateGrid(seed),
    inventory: {
      iron_ore: 0, copper_ore: 0,
      refined_iron: 0, refined_copper: 0,
      iron_ingot: 0, copper_ingot: 0,
    },
    currency: 200,
    seed,
    tickCount: 0,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_BUILDING': {
      const { x, y, buildingType } = action;
      const tile = state.grid[y][x];
      if (tile.building) return state;
      if (buildingType === 'miner' && !tile.oreType) return state;

      const cost = BUILDING_COSTS[buildingType][0];
      if (state.currency < cost) return state;

      const newGrid = state.grid.map(r => r.map(t => ({ ...t })));
      newGrid[y][x] = {
        ...newGrid[y][x],
        building: {
          type: buildingType,
          level: 1,
          active: true,
          oreTarget: buildingType !== 'miner' ? tile.oreType : undefined,
        },
      };
      return { ...state, grid: newGrid, currency: state.currency - cost };
    }

    case 'UPGRADE_BUILDING': {
      const { x, y } = action;
      const tile = state.grid[y][x];
      if (!tile.building || tile.building.level >= 3) return state;

      const nextLevel = tile.building.level;
      const cost = UPGRADE_COSTS[tile.building.type][nextLevel];
      if (state.currency < cost) return state;

      const newGrid = state.grid.map(r => r.map(t => ({ ...t })));
      newGrid[y][x] = {
        ...newGrid[y][x],
        building: { ...tile.building, level: tile.building.level + 1 },
      };
      return { ...state, grid: newGrid, currency: state.currency - cost };
    }

    case 'DISASSEMBLE': {
      const { x, y } = action;
      const tile = state.grid[y][x];
      if (!tile.building) return state;
      const refund = Math.floor(BUILDING_COSTS[tile.building.type][0] * 0.5);
      const newGrid = state.grid.map(r => r.map(t => ({ ...t })));
      newGrid[y][x] = { ...newGrid[y][x], building: null };
      return { ...state, grid: newGrid, currency: state.currency + refund };
    }

    case 'TOGGLE_BUILDING': {
      const { x, y } = action;
      const tile = state.grid[y][x];
      if (!tile.building) return state;
      const newGrid = state.grid.map(r => r.map(t => ({ ...t })));
      newGrid[y][x] = {
        ...newGrid[y][x],
        building: { ...tile.building, active: !tile.building.active },
      };
      return { ...state, grid: newGrid };
    }

    case 'SET_ORE_TARGET': {
      const { x, y, oreTarget } = action;
      const tile = state.grid[y][x];
      if (!tile.building) return state;
      const newGrid = state.grid.map(r => r.map(t => ({ ...t })));
      newGrid[y][x] = {
        ...newGrid[y][x],
        building: { ...tile.building, oreTarget },
      };
      return { ...state, grid: newGrid };
    }

    case 'SELL': {
      const { resource, amount } = action;
      const available = state.inventory[resource];
      const sellAmount = Math.min(amount, available);
      if (sellAmount <= 0) return state;
      const price = SELL_PRICES[resource] || 0;
      return {
        ...state,
        inventory: { ...state.inventory, [resource]: available - sellAmount },
        currency: state.currency + sellAmount * price,
      };
    }

    case 'CRAFT': {
      const { inputResource, inputAmount, outputResource, outputAmount } = action;
      if (state.inventory[inputResource] < inputAmount) return state;
      return {
        ...state,
        inventory: {
          ...state.inventory,
          [inputResource]: state.inventory[inputResource] - inputAmount,
          [outputResource]: state.inventory[outputResource] + outputAmount,
        },
      };
    }

    case 'TICK': {
      const inv: Inventory = { ...state.inventory };
      const ticksPerHour = 3600;

      for (const row of state.grid) {
        for (const tile of row) {
          if (tile.building?.type === 'miner' && tile.building.active) {
            const rate = (MINER_BASE_RATE * tile.building.level * (tile.purity / 100)) / ticksPerHour;
            const key: ResourceKey = `${tile.oreType}_ore` as ResourceKey;
            inv[key] += rate;
          }
        }
      }

      for (const row of state.grid) {
        for (const tile of row) {
          if (tile.building?.type === 'refinery' && tile.building.active) {
            const ore = tile.building.oreTarget || 'iron';
            const rawKey: ResourceKey = `${ore}_ore` as ResourceKey;
            const refKey: ResourceKey = `refined_${ore}` as ResourceKey;
            const mult = REFINERY_MULTIPLIERS[tile.building.level - 1];
            const processRate = (10 * tile.building.level) / ticksPerHour;
            const consumed = Math.min(inv[rawKey], processRate);
            if (consumed > 0) {
              inv[rawKey] -= consumed;
              inv[refKey] += consumed * mult;
            }
          }
        }
      }

      for (const row of state.grid) {
        for (const tile of row) {
          if (tile.building?.type === 'foundry' && tile.building.active) {
            const ore = tile.building.oreTarget || 'iron';
            const refKey: ResourceKey = `refined_${ore}` as ResourceKey;
            const ingotKey: ResourceKey = `${ore}_ingot` as ResourceKey;
            const speed = FOUNDRY_SPEED[tile.building.level - 1];
            const batchesPerTick = speed / ticksPerHour;
            const neededInput = FOUNDRY_INPUT * batchesPerTick;
            const consumed = Math.min(inv[refKey], neededInput);
            if (consumed > 0) {
              const ratio = consumed / neededInput;
              inv[refKey] -= consumed;
              inv[ingotKey] += FOUNDRY_OUTPUT * batchesPerTick * ratio;
            }
          }
        }
      }

      return { ...state, inventory: inv, tickCount: state.tickCount + 1 };
    }

    case 'LOAD':
      return action.state;

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}
