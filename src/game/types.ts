export const ORES = [
  'iron', 'copper', 'aluminum', 'gold', 'silver', 'nickel', 'lead', 'tin',
  'titanium', 'uranium', 'cobalt', 'graphite', 'chromium', 'manganese', 'lithium',
  'veinite', 'cryotheum', 'pyroclast', 'aetherium', 'oblivionite', 'xenotite',
  'luminite', 'ferridium', 'radionite', 'etherclast'
] as const;

import { AlloyType, ALLOY_RECIPES } from './alloys';
import { ELECTRONICS_RECIPES } from './machines';

export type OreType = typeof ORES[number];

export interface OreInfo {
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Ultra-Rare' | 'Extremely Rare' | 'Mythical' | 'Legendary';
  type: 'Real' | 'Sci-Fi';
  color: string;
  value: number;
  description: string;
}

export const ORE_METADATA: Record<OreType, OreInfo> = {
  iron: { name: 'Iron Ore', rarity: 'Common', type: 'Real', color: '#8c8c8c', value: 1, description: 'Standard industrial metal.' },
  copper: { name: 'Copper Ore', rarity: 'Common', type: 'Real', color: '#b87333', value: 1.2, description: 'Conductive, easy to refine.' },
  aluminum: { name: 'Aluminum Ore', rarity: 'Common', type: 'Real', color: '#d1d1d1', value: 1.5, description: 'Lightweight alloys, aerospace.' },
  gold: { name: 'Gold Ore', rarity: 'Rare', type: 'Real', color: '#ffd700', value: 25, description: 'Electronics, currency, tech plating.' },
  silver: { name: 'Silver Ore', rarity: 'Uncommon', type: 'Real', color: '#c0c0c0', value: 8, description: 'Conductive components, mirrors.' },
  nickel: { name: 'Nickel Ore', rarity: 'Uncommon', type: 'Real', color: '#a5a58d', value: 6, description: 'Alloys, batteries, armor.' },
  lead: { name: 'Lead Ore', rarity: 'Common', type: 'Real', color: '#4b4b4b', value: 2, description: 'Batteries, radiation shielding.' },
  tin: { name: 'Tin Ore', rarity: 'Common', type: 'Real', color: '#d3cfad', value: 1.8, description: 'Solder, alloys.' },
  titanium: { name: 'Titanium Ore', rarity: 'Rare', type: 'Real', color: '#7a7a7a', value: 30, description: 'Armor, spacecraft frames.' },
  uranium: { name: 'Uranium Ore', rarity: 'Very Rare', type: 'Real', color: '#39ff14', value: 150, description: 'Radioactive; heavily regulated.' },
  cobalt: { name: 'Cobalt Ore', rarity: 'Uncommon', type: 'Real', color: '#0047ab', value: 12, description: 'High-end batteries, superalloys.' },
  graphite: { name: 'Graphite Ore', rarity: 'Common', type: 'Real', color: '#2b2b2b', value: 2.5, description: 'Lubrication, electrodes.' },
  chromium: { name: 'Chromium Ore', rarity: 'Uncommon', type: 'Real', color: '#e8e8e8', value: 10, description: 'Plating, corrosion-resistant alloys.' },
  manganese: { name: 'Manganese Ore', rarity: 'Common', type: 'Real', color: '#9b7653', value: 3, description: 'Steel hardening.' },
  lithium: { name: 'Lithium Ore', rarity: 'Rare', type: 'Real', color: '#e0b0ff', value: 40, description: 'Batteries, energy storage.' },
  veinite: { name: 'Veinite Ore', rarity: 'Mythical', type: 'Sci-Fi', color: '#ff0000', value: 1000, description: 'DNA experiments, Biotech weapons. Emits a red pulse.' },
  cryotheum: { name: 'Cryotheum Ore', rarity: 'Rare', type: 'Sci-Fi', color: '#00ffff', value: 50, description: 'Cooling systems, cryoweapons.' },
  pyroclast: { name: 'Pyroclast Ore', rarity: 'Uncommon', type: 'Sci-Fi', color: '#ff4500', value: 15, description: 'Plasma weapons, explosives.' },
  aetherium: { name: 'Aetherium Ore', rarity: 'Very Rare', type: 'Sci-Fi', color: '#00d2ff', value: 200, description: 'Energy conduction, advanced tech.' },
  oblivionite: { name: 'Oblivionite Ore', rarity: 'Ultra-Rare', type: 'Sci-Fi', color: '#1a1a1a', value: 500, description: 'Absorbs light and heat, extremely dense.' },
  xenotite: { name: 'Xenotite Ore', rarity: 'Extremely Rare', type: 'Sci-Fi', color: '#ff00ff', value: 750, description: 'Unstable, origin unknown, highly coveted.' },
  luminite: { name: 'Luminite Ore', rarity: 'Uncommon', type: 'Sci-Fi', color: '#ffff33', value: 10, description: 'Lighting tech, signage.' },
  ferridium: { name: 'Ferridium Ore', rarity: 'Rare', type: 'Sci-Fi', color: '#800000', value: 80, description: 'Hyper-dense iron variant, almost unbreakable.' },
  radionite: { name: 'Radionite Ore', rarity: 'Very Rare', type: 'Sci-Fi', color: '#ccff00', value: 250, description: 'Reactor fuel, experimental tech.' },
  etherclast: { name: 'Etherclast Ore', rarity: 'Legendary', type: 'Sci-Fi', color: '#f0f8ff', value: 2000, description: 'Phased mineral, shifts unpredictably.' },
};

export interface Tile {
  x: number;
  y: number;
  oreType: OreType | null;
  purity: number; // 0 for null, 30-100 for resources
  building: Building | null;
}

export type BuildingType = 'miner' | 'refinery' | 'foundry' | 'machine';

export interface Building {
  type: BuildingType;
  level: number; // 1-3 for miners/refineries/foundries, ignored for machines
  active: boolean;
  oreTarget?: OreType;
  // For machines
  machineId?: string;
}

// Generate resource keys for all 25 ores
export type ResourceKey =
  | `${OreType}_ore`
  | `refined_${OreType}`
  | `${OreType}_ingot`
  | AlloyType
  | 'circuit_board'
  // Electronics / components
  | 'iron_plate'
  | 'tin_plate'
  | 'copper_wire'
  | 'iron_casing'
  | 'bronzium_gear'
  | 'heating_coil'
  | 'steel_plate'
  | 'steel_casing'
  | 'basic_circuit'
  | 'pipe'
  | 'motor'
  | 'fine_wire'
  | 'silvarin_plate'
  | 'titanite_rod'
  | 'titanite_casing'
  | 'advanced_circuit'
  | 'servo_motor'
  | 'xenolith_frame'
  | 'energy_cell'
  | 'quantum_processor'
  | 'veinite_core'
  | 'oblivionite_frame'
  // Machines
  | 'manual_assembler'
  | 'basic_press'
  | 'wire_drawer'
  | 'alloy_smelter'
  | 'circuit_assembler'
  | 'precision_lathe'
  | 'chemical_processor'
  | 'nano_assembler'
  | 'quantum_fabricator'
  | 'singularity_forge';

export type Inventory = Partial<Record<ResourceKey, number>>;

export interface GameState {
  grid: Tile[][];
  inventory: Inventory;
  currency: number;
  seed: number;
  tickCount: number;
  activeBuildings: { x: number; y: number }[];
  // Track placed machines separately
  activeMachines: { id: string; x: number; y: number }[];
  // Currently selected machine for placement (null if none)
  selectedMachineId: string | null;
  totalSpent: number; // Tracks all currency spent on buildings/upgrades for rebirth refund
}

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  seller_email: string;
  resource: ResourceKey;
  amount: number;
  price_per_unit: number;
  created_at: string;
}

export const GRID_SIZE = 64;

export interface Cost {
  currency: number;
  resources?: Partial<Record<string, number>>;
}

export const BUILDING_COSTS: Record<BuildingType, Cost[]> = {
  miner:    [
    { currency: 50 },
    { currency: 150, resources: { iron_ingot: 10 } },
    { currency: 400, resources: { iron_ingot: 25, copper_wire: 15 } }
  ],
  refinery: [
    { currency: 250 },
    { currency: 350 },
    { currency: 500 }
  ],
  foundry: [
    { currency: 250 },
    { currency: 350 },
    { currency: 500 }
  ],
  machine: []
};

export const UPGRADE_COSTS: Record<BuildingType, Cost[]> = {
  miner:    [
    { currency: 0 },
    { currency: 150, resources: { iron_ingot: 10 } },
    { currency: 400, resources: { iron_ingot: 25, copper_wire: 15 } }
  ],
  refinery: [
    { currency: 250 },
    { currency: 350 },
    { currency: 500 }
  ],
  foundry: [
    { currency: 250 },
    { currency: 350 },
    { currency: 500 }
  ],
  machine: []
};

// Simplified price generation: BaseValue * TierMultiplier
const tierMultipliers: Record<string, number> = {
  'Common': 1,
  'Uncommon': 2,
  'Rare': 5,
  'Very Rare': 10,
  'Ultra-Rare': 20,
  'Extremely Rare': 50,
  'Mythical': 100,
  'Legendary': 250,
};

export const SELL_PRICES: Partial<Record<string, number>> = {};
ORES.forEach(ore => {
  const meta = ORE_METADATA[ore];
  SELL_PRICES[`${ore}_ore`] = meta.value;
  SELL_PRICES[`refined_${ore}`] = meta.value * 1.5;
  SELL_PRICES[`${ore}_ingot`] = meta.value * 5;
});
SELL_PRICES['circuit_board'] = 25;

// Alloy dynamic pricing
ALLOY_RECIPES.forEach(recipe => {
  let baseValue = 0;
  for (const [ingredient, qty] of Object.entries(recipe.inputs)) {
    const ingredientValue = SELL_PRICES[ingredient] || 0;
    baseValue += (ingredientValue * (qty as number));
  }
  // Price depends on the rarity of the alloy: Base cost to produce * rarity markup
  SELL_PRICES[recipe.id] = baseValue * (tierMultipliers[recipe.rarity] || 1.5);
});

// Electronics / component dynamic pricing (input cost x markup, per output unit)
const componentTierMarkup: Record<string, number> = {
  Early: 2,
  Mid: 3,
  Late: 5,
  Endgame: 10,
};
ELECTRONICS_RECIPES.forEach(recipe => {
  let baseValue = 0;
  for (const [ingredient, qty] of Object.entries(recipe.inputs)) {
    const ingredientValue = SELL_PRICES[ingredient] || 0;
    baseValue += ingredientValue * (qty as number);
  }
  const perUnit = baseValue / (recipe.outputAmount || 1);
  SELL_PRICES[recipe.id] = perUnit * (componentTierMarkup[recipe.tier] || 2);
});

export const MINER_BASE_RATE = 720;
export const REFINERY_MULTIPLIERS = [1.2, 1.5, 2.0];
export const REFINERY_SPEED = [60, 120, 240];
export const FOUNDRY_INPUT = 10;
export const FOUNDRY_OUTPUT = 5;
export const FOUNDRY_SPEED = [60, 120, 240];
