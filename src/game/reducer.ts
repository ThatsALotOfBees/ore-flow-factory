import {
  GameState, BuildingType, ResourceKey, Inventory, GRID_SIZE,
  BUILDING_COSTS, UPGRADE_COSTS, SELL_PRICES, ORES,
  MINER_BASE_RATE, REFINERY_MULTIPLIERS, REFINERY_SPEED,
  FOUNDRY_INPUT, FOUNDRY_OUTPUT, FOUNDRY_SPEED,
} from './types';
import { generateGrid } from './grid';
import { MACHINE_RECIPES, ELECTRONICS_RECIPES } from './machines';

function hasMachinePlaced(state: GameState, machineName: string): boolean {
  if (machineName === 'Hand') return true;
  const recipe = MACHINE_RECIPES.find(r => r.name === machineName);
  if (!recipe) return false;
  return state.activeMachines.some(m => m.id === recipe.id);
}

export type GameAction =
  | { type: 'PLACE_BUILDING'; x: number; y: number; buildingType: BuildingType }
  | { type: 'UPGRADE_BUILDING'; x: number; y: number }
  | { type: 'DISASSEMBLE'; x: number; y: number }
  | { type: 'TOGGLE_BUILDING'; x: number; y: number }
  | { type: 'SET_ORE_TARGET'; x: number; y: number; oreTarget: string }
  | { type: 'SELL'; resource: string; amount: number }
  | { type: 'CRAFT'; inputResource: string; inputAmount: number; outputResource: string; outputAmount: number }
  | { type: 'TICK' }
  | { type: 'GLOBAL_BATCH_PROCESS'; processType: 'refine' | 'smelt' }
  | { type: 'LOAD'; state: GameState }
  | { type: 'RESET' }
  | { type: 'REBIRTH' }
  | { type: 'MARKET_SELL'; resource: string; amount: number }
  | { type: 'MARKET_BUY'; resource: string; amount: number; totalCost: number }
  | { type: 'MARKET_CLAIM_CASH'; amount: number }
  | { type: 'SMELT_ALLOY'; inputs: Record<string, number>; output: string; outputAmount: number }
  | { type: 'SELECT_MACHINE'; machineId: string | null }
  | { type: 'CRAFT_MACHINE'; recipeId: string }
  | { type: 'CRAFT_ELECTRONIC'; recipeId: string }
  | { type: 'PLACE_MACHINE'; x: number; y: number; machineId: string };

export function createInitialState(): GameState {
  const seed = Date.now();
  return {
    grid: generateGrid(seed),
    inventory: {},
    currency: 200,
    seed,
    tickCount: 0,
    activeBuildings: [],
    activeMachines: [],
    selectedMachineId: null,
    totalSpent: 0,
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
      if (state.currency < cost.currency) return state;
      
      // Check material costs
      if (cost.resources) {
        for (const [res, amt] of Object.entries(cost.resources)) {
          if ((state.inventory[res as ResourceKey] || 0) < (amt as number)) return state;
        }
      }

      const newGrid = [...state.grid];
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = {
        ...newGrid[y][x],
        building: {
          type: buildingType,
          level: 1,
          active: true,
          oreTarget: buildingType !== 'miner' ? tile.oreType || 'iron' : undefined,
        },
      };

      const newInventory = { ...state.inventory };
      if (cost.resources) {
        for (const [res, amt] of Object.entries(cost.resources)) {
          newInventory[res as ResourceKey] = (newInventory[res as ResourceKey] || 0) - (amt as number);
        }
      }

      return {
        ...state,
        grid: newGrid,
        inventory: newInventory,
        currency: state.currency - cost.currency,
        totalSpent: (state.totalSpent || 0) + cost.currency,
        activeBuildings: [...state.activeBuildings, { x, y }],
      };
    }

    case 'UPGRADE_BUILDING': {
      const { x, y } = action;
      const tile = state.grid[y][x];
      if (!tile.building || tile.building.level >= 3) return state;

      const nextLevel = tile.building.level;
      const cost = UPGRADE_COSTS[tile.building.type][nextLevel];
      if (state.currency < cost.currency) return state;
      
      if (cost.resources) {
        for (const [res, amt] of Object.entries(cost.resources)) {
          if ((state.inventory[res as ResourceKey] || 0) < (amt as number)) return state;
        }
      }

      const newGrid = [...state.grid];
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = {
        ...newGrid[y][x],
        building: { ...tile.building, level: tile.building.level + 1 },
      };

      const newInventory = { ...state.inventory };
      if (cost.resources) {
        for (const [res, amt] of Object.entries(cost.resources)) {
          newInventory[res as ResourceKey] = (newInventory[res as ResourceKey] || 0) - (amt as number);
        }
      }

      return { 
        ...state, 
        grid: newGrid, 
        inventory: newInventory, 
        currency: state.currency - cost.currency,
        totalSpent: (state.totalSpent || 0) + cost.currency
      };
    }

    case 'DISASSEMBLE': {
      const { x, y } = action;
      const tile = state.grid[y][x];
      if (!tile.building) return state;
      const refund = Math.floor(BUILDING_COSTS[tile.building.type][0].currency * 0.5);

      const newGrid = [...state.grid];
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = { ...newGrid[y][x], building: null };

      return {
        ...state,
        grid: newGrid,
        currency: state.currency + refund,
        activeBuildings: state.activeBuildings.filter(b => b.x !== x || b.y !== y),
      };
    }

    case 'TOGGLE_BUILDING': {
      const { x, y } = action;
      const tile = state.grid[y][x];
      if (!tile.building) return state;

      const newGrid = [...state.grid];
      newGrid[y] = [...newGrid[y]];
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

      const newGrid = [...state.grid];
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = {
        ...newGrid[y][x],
        building: { ...tile.building, oreTarget: oreTarget as any },
      };
      return { ...state, grid: newGrid };
    }

    case 'SELL': {
      const { resource, amount } = action;
      const available = state.inventory[resource as ResourceKey] || 0;
      const sellAmount = Math.min(amount, available);
      if (sellAmount <= 0) return state;
      const price = SELL_PRICES[resource as ResourceKey] || 0;
      return {
        ...state,
        inventory: { ...state.inventory, [resource]: available - sellAmount },
        currency: state.currency + sellAmount * price,
      };
    }

    case 'CRAFT': {
      const { inputResource, inputAmount, outputResource, outputAmount } = action;
      if ((state.inventory[inputResource as ResourceKey] || 0) < inputAmount) return state;
      return {
        ...state,
        inventory: {
          ...state.inventory,
          [inputResource]: (state.inventory[inputResource as ResourceKey] || 0) - inputAmount,
          [outputResource]: (state.inventory[outputResource as ResourceKey] || 0) + outputAmount,
        },
      };
    }

    case 'SMELT_ALLOY': {
      const { inputs, output, outputAmount } = action;
      // Verification: Ensure player has all inputs
      let canSmelt = true;
      for (const [res, amt] of Object.entries(inputs)) {
        if ((state.inventory[res as ResourceKey] || 0) < amt) {
          canSmelt = false;
          break;
        }
      }
      if (!canSmelt) return state;

      const newInv = { ...state.inventory };
      for (const [res, amt] of Object.entries(inputs)) {
        newInv[res as keyof typeof newInv] = (newInv[res as keyof typeof newInv] || 0) - amt;
      }
      newInv[output as keyof typeof newInv] = (newInv[output as keyof typeof newInv] || 0) + outputAmount;

      return {
        ...state,
        inventory: newInv,
      };
    }

    case 'TICK': {
      const inv: Inventory = { ...state.inventory };
      const ticksPerHour = 3600;

      for (const coords of state.activeBuildings) {
        const tile = state.grid[coords.y][coords.x];
        const b = tile.building;
        if (!b || !b.active) continue;

        if (b.type === 'miner') {
          const rate = (MINER_BASE_RATE * b.level * (tile.purity / 100)) / ticksPerHour;
          const key: ResourceKey = `${tile.oreType}_ore` as ResourceKey;
          inv[key] = (inv[key] || 0) + rate;
        } else if (b.type === 'refinery') {
          const ore = b.oreTarget || 'iron';
          const rawKey: ResourceKey = `${ore}_ore` as ResourceKey;
          const refKey: ResourceKey = `refined_${ore}` as ResourceKey;
          const mult = REFINERY_MULTIPLIERS[b.level - 1];
          const processRate = (REFINERY_SPEED[b.level - 1]) / ticksPerHour;
          const consumed = Math.min(inv[rawKey] || 0, processRate);
          if (consumed > 0) {
            inv[rawKey] = (inv[rawKey] || 0) - consumed;
            inv[refKey] = (inv[refKey] || 0) + consumed * mult;
          }
        } else if (b.type === 'foundry') {
          const ore = b.oreTarget || 'iron';
          const refKey: ResourceKey = `refined_${ore}` as ResourceKey;
          const ingotKey: ResourceKey = `${ore}_ingot` as ResourceKey;
          const speed = FOUNDRY_SPEED[b.level - 1];
          const batchesPerTick = speed / ticksPerHour;
          const neededInput = FOUNDRY_INPUT * batchesPerTick;
          const consumed = Math.min(inv[refKey] || 0, neededInput);
          if (consumed > 0) {
            const ratio = consumed / neededInput;
            inv[refKey] = (inv[refKey] || 0) - consumed;
            inv[ingotKey] = (inv[ingotKey] || 0) + (FOUNDRY_OUTPUT * batchesPerTick * ratio);
          }
        }
      }

      return { ...state, inventory: inv, tickCount: state.tickCount + 1 };
    }

    case 'GLOBAL_BATCH_PROCESS': {
      const { processType } = action;
      const inv = { ...state.inventory };
      let capacity = 0;

      for (const coords of state.activeBuildings) {
        const tile = state.grid[coords.y][coords.x];
        const b = tile.building;
        if (!b || !b.active) continue;

        if (processType === 'refine' && b.type === 'refinery') {
          capacity += REFINERY_SPEED[b.level - 1] * 2;
        } else if (processType === 'smelt' && b.type === 'foundry') {
          capacity += FOUNDRY_SPEED[b.level - 1] * 2;
        }
      }

      if (capacity <= 0) return state;

      const perOreCapacity = capacity / ORES.length;

      if (processType === 'refine') {
        ORES.forEach(ore => {
          const rawKey = `${ore}_ore` as ResourceKey;
          const refKey = `refined_${ore}` as ResourceKey;
          const toProcess = Math.min(inv[rawKey] || 0, perOreCapacity);
          if (toProcess > 0) {
            inv[rawKey] = (inv[rawKey] || 0) - toProcess;
            inv[refKey] = (inv[refKey] || 0) + toProcess * 1.5;
          }
        });
      } else {
        ORES.forEach(ore => {
          const refKey = `refined_${ore}` as ResourceKey;
          const ingotKey = `${ore}_ingot` as ResourceKey;
          const toProcess = Math.min(inv[refKey] || 0, perOreCapacity);
          if (toProcess >= 10) {
            const batches = Math.floor(toProcess / 10);
            inv[refKey] = (inv[refKey] || 0) - (batches * 10);
            inv[ingotKey] = (inv[ingotKey] || 0) + (batches * 5);
          }
        });
      }

      return { ...state, inventory: inv };
    }

    case 'LOAD': {
      const initial = createInitialState();
      const loadedState = { ...initial, ...action.state };
      
      if (!loadedState.grid || loadedState.grid.length !== GRID_SIZE) {
        loadedState.grid = initial.grid;
      }

      if (!loadedState.inventory) {
        loadedState.inventory = {};
      }

      const activeBuildings: { x: number; y: number }[] = [];
      loadedState.grid.forEach((row, y) => {
        row.forEach((tile, x) => {
          if (tile.building) activeBuildings.push({ x, y });
        });
      });
      loadedState.activeBuildings = activeBuildings;
      loadedState.totalSpent = loadedState.totalSpent || 0;

      return loadedState;
    }

    case 'RESET':
      return createInitialState();

    case 'REBIRTH': {
      if (state.currency < 1000) return state;
      const refund = Math.floor((state.totalSpent || 0) * 0.75);
      const newSeed = Date.now();
      return {
        ...state,
        grid: generateGrid(newSeed),
        seed: newSeed,
        currency: state.currency - 1000 + refund,
        totalSpent: 0,
        activeBuildings: [],
        activeMachines: [],
        selectedMachineId: null,
        inventory: state.inventory, // Keep inventory when buying a new plot
      };
    }

    case 'MARKET_SELL': {
      const { resource, amount } = action;
      const current = state.inventory[resource as ResourceKey] || 0;
      if (current < amount) return state;
      return {
        ...state,
        inventory: { ...state.inventory, [resource]: current - amount },
      };
    }

    case 'MARKET_BUY': {
      const { resource, amount, totalCost } = action;
      return {
        ...state,
        currency: state.currency - totalCost,
        inventory: { 
          ...state.inventory, 
          [resource]: (state.inventory[resource as ResourceKey] || 0) + amount 
        },
      };
    }

    case 'SELECT_MACHINE': {
      return { ...state, selectedMachineId: action.machineId };
    }

    case 'CRAFT_MACHINE': {
      const recipe = MACHINE_RECIPES.find(r => r.id === action.recipeId);
      if (!recipe) return state;

      if (!hasMachinePlaced(state, recipe.craftedIn)) return state;

      const recipeIndex = MACHINE_RECIPES.indexOf(recipe);
      if (recipeIndex > 0) {
        const prevMachine = MACHINE_RECIPES[recipeIndex - 1];
        const hasPrevInInventory = (state.inventory[prevMachine.id as ResourceKey] || 0) > 0;
        const hasPrevPlaced = state.activeMachines.some(m => m.id === prevMachine.id);
        if (!hasPrevInInventory && !hasPrevPlaced) return state;
      }

      for (const [res, amt] of Object.entries(recipe.inputs)) {
        if ((state.inventory[res as ResourceKey] || 0) < amt) return state;
      }

      const newInv = { ...state.inventory };
      for (const [res, amt] of Object.entries(recipe.inputs)) {
        newInv[res as ResourceKey] = (newInv[res as ResourceKey] || 0) - amt;
      }
      newInv[recipe.id as ResourceKey] = (newInv[recipe.id as ResourceKey] || 0) + (recipe.outputAmount || 1);

      return {
        ...state,
        inventory: newInv,
      };
    }

    case 'CRAFT_ELECTRONIC': {
      const recipe = ELECTRONICS_RECIPES.find(r => r.id === action.recipeId);
      if (!recipe) return state;

      if (!hasMachinePlaced(state, recipe.craftedIn)) return state;

      for (const [res, amt] of Object.entries(recipe.inputs)) {
        if ((state.inventory[res as ResourceKey] || 0) < amt) return state;
      }

      const newInv = { ...state.inventory };
      for (const [res, amt] of Object.entries(recipe.inputs)) {
        newInv[res as ResourceKey] = (newInv[res as ResourceKey] || 0) - amt;
      }
      newInv[recipe.id as ResourceKey] = (newInv[recipe.id as ResourceKey] || 0) + (recipe.outputAmount || 1);

      return {
        ...state,
        inventory: newInv,
      };
    }

    case 'PLACE_MACHINE': {
      const { x, y, machineId } = action;
      const tile = state.grid[y][x];
      
      // Ensure tile is empty and valid
      if (tile.building || state.activeMachines.some(m => m.x === x && m.y === y)) return state;
      
      // Check if player has the machine in inventory
      if ((state.inventory[machineId as ResourceKey] || 0) < 1) return state;

      const newInv = { ...state.inventory };
      newInv[machineId as ResourceKey] = (newInv[machineId as ResourceKey] || 0) - 1;

      const newActiveMachines = [...state.activeMachines, { id: machineId, x, y }];
      
      const newGrid = [...state.grid];
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = {
        ...newGrid[y][x],
        building: {
          type: 'machine',
          level: 1,
          active: true,
          machineId: machineId, // Added machineId specifically for building state
        } as any, // Cast to any because building type is extended but TS might be picky
      };

      return {
        ...state,
        grid: newGrid,
        inventory: newInv,
        activeMachines: newActiveMachines,
        selectedMachineId: null, // Reset selection after placement
      };
    }

    default:
      return state;
  }
}
