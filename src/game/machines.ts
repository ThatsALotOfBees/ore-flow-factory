// src/game/machines.ts

export enum MachineTier {
  Early = 'Early',
  Mid = 'Mid',
  Late = 'Late',
  Endgame = 'Endgame',
}

export interface MachineRecipe {
  id: string; // resource key used in inventory
  name: string;
  tier: MachineTier;
  craftedIn: string; // e.g., 'Hand', 'Manual Assembler', etc.
  // inputs: resource key -> amount
  inputs: Record<string, number>;
  // optional output amount (usually 1)
  outputAmount?: number;
}

export const MACHINE_RECIPES: MachineRecipe[] = [
  {
    id: 'manual_assembler',
    name: 'Manual Assembler',
    tier: MachineTier.Early,
    craftedIn: 'Hand',
    inputs: {},
    outputAmount: 1,
  },
  {
    id: 'basic_press',
    name: 'Basic Press',
    tier: MachineTier.Early,
    craftedIn: 'Manual Assembler',
    inputs: { iron_plate: 6, bronzium_gear: 2 },
  },
  {
    id: 'wire_drawer',
    name: 'Wire Drawer',
    tier: MachineTier.Early,
    craftedIn: 'Manual Assembler',
    inputs: { iron_casing: 1, copper_wire: 4 },
  },
  {
    id: 'alloy_smelter',
    name: 'Alloy Smelter',
    tier: MachineTier.Early,
    craftedIn: 'Manual Assembler',
    inputs: { iron_casing: 1, heating_coil: 1 },
  },
  {
    id: 'circuit_assembler',
    name: 'Circuit Assembler',
    tier: MachineTier.Mid,
    craftedIn: 'Manual Assembler',
    inputs: { steel_casing: 1, basic_circuit: 3 },
  },
  {
    id: 'precision_lathe',
    name: 'Precision Lathe',
    tier: MachineTier.Mid,
    craftedIn: 'Manual Assembler',
    inputs: { steel_casing: 1, motor: 1, basic_circuit: 1 },
  },
  {
    id: 'chemical_processor',
    name: 'Chemical Processor',
    tier: MachineTier.Mid,
    craftedIn: 'Manual Assembler',
    inputs: { steel_casing: 1, pipe: 1, basic_circuit: 2 },
  },
  {
    id: 'nano_assembler',
    name: 'Nano Assembler',
    tier: MachineTier.Late,
    craftedIn: 'Circuit Assembler',
    inputs: { titanite_casing: 1, advanced_circuit: 2, servo_motor: 1 },
  },
  {
    id: 'quantum_fabricator',
    name: 'Quantum Fabricator',
    tier: MachineTier.Endgame,
    craftedIn: 'Nano Assembler',
    inputs: { xenolith_frame: 1, advanced_circuit: 3, energy_cell: 1 },
  },
  {
    id: 'singularity_forge',
    name: 'Singularity Forge',
    tier: MachineTier.Endgame,
    craftedIn: 'Quantum Fabricator',
    inputs: { oblivionite_frame: 1, quantum_processor: 1, veinite_core: 1 },
  },
];

// Electronics recipes (partial list – full list can be expanded)
export interface ElectronicsRecipe {
  id: string; // resource key
  name: string;
  tier: MachineTier;
  craftedIn: string;
  inputs: Record<string, number>;
  outputAmount?: number;
}

export const ELECTRONICS_RECIPES: ElectronicsRecipe[] = [
  // ===== Tier 1: Raw stock from ingots =====
  { id: 'iron_plate', name: 'Iron Plate', tier: MachineTier.Early, craftedIn: 'Basic Press', inputs: { iron_ingot: 1 }, outputAmount: 4 },
  { id: 'tin_plate', name: 'Tin Plate', tier: MachineTier.Early, craftedIn: 'Basic Press', inputs: { tin_ingot: 1 }, outputAmount: 4 },
  { id: 'copper_wire', name: 'Copper Wire', tier: MachineTier.Early, craftedIn: 'Wire Drawer', inputs: { copper_ingot: 1 }, outputAmount: 5 },
  { id: 'iron_casing', name: 'Iron Casing', tier: MachineTier.Early, craftedIn: 'Manual Assembler', inputs: { iron_plate: 3 }, outputAmount: 1 },
  { id: 'bronzium_gear', name: 'Bronzium Gear', tier: MachineTier.Early, craftedIn: 'Manual Assembler', inputs: { copper_ingot: 2, tin_ingot: 1 }, outputAmount: 2 },
  { id: 'heating_coil', name: 'Heating Coil', tier: MachineTier.Early, craftedIn: 'Manual Assembler', inputs: { copper_wire: 4, iron_plate: 1 }, outputAmount: 1 },

  // ===== Tier 2: Industrial =====
  { id: 'steel_plate', name: 'Steel Plate', tier: MachineTier.Mid, craftedIn: 'Basic Press', inputs: { iron_ingot: 2, graphite_ingot: 1 }, outputAmount: 3 },
  { id: 'steel_casing', name: 'Steel Casing', tier: MachineTier.Mid, craftedIn: 'Basic Press', inputs: { steel_plate: 3 }, outputAmount: 1 },
  { id: 'basic_circuit', name: 'Basic Circuit', tier: MachineTier.Mid, craftedIn: 'Manual Assembler', inputs: { copper_wire: 2, tin_plate: 1 }, outputAmount: 1 },
  { id: 'pipe', name: 'Pipe', tier: MachineTier.Mid, craftedIn: 'Basic Press', inputs: { tin_plate: 2, iron_plate: 1 }, outputAmount: 2 },
  { id: 'motor', name: 'Motor', tier: MachineTier.Mid, craftedIn: 'Manual Assembler', inputs: { iron_casing: 1, copper_wire: 6, bronzium_gear: 2 }, outputAmount: 1 },

  // ===== Tier 3: Advanced =====
  { id: 'fine_wire', name: 'Fine Wire', tier: MachineTier.Late, craftedIn: 'Wire Drawer', inputs: { copper_wire: 3, silver_ingot: 1 }, outputAmount: 2 },
  { id: 'silvarin_plate', name: 'Silvarin Plate', tier: MachineTier.Late, craftedIn: 'Basic Press', inputs: { silver_ingot: 2, aluminum_ingot: 1 }, outputAmount: 2 },
  { id: 'titanite_rod', name: 'Titanite Rod', tier: MachineTier.Late, craftedIn: 'Precision Lathe', inputs: { titanium_ingot: 2, chromium_ingot: 1 }, outputAmount: 2 },
  { id: 'titanite_casing', name: 'Titanite Casing', tier: MachineTier.Late, craftedIn: 'Basic Press', inputs: { titanite_rod: 2, steel_plate: 2 }, outputAmount: 1 },
  { id: 'advanced_circuit', name: 'Advanced Circuit', tier: MachineTier.Late, craftedIn: 'Circuit Assembler', inputs: { basic_circuit: 2, fine_wire: 1, silvarin_plate: 1 }, outputAmount: 1 },
  { id: 'servo_motor', name: 'Servo Motor', tier: MachineTier.Late, craftedIn: 'Precision Lathe', inputs: { motor: 1, titanite_rod: 1 }, outputAmount: 1 },

  // ===== Tier 4: Endgame =====
  { id: 'xenolith_frame', name: 'Xenolith Frame', tier: MachineTier.Endgame, craftedIn: 'Nano Assembler', inputs: { titanite_casing: 2, aetherium_ingot: 1 }, outputAmount: 1 },
  { id: 'energy_cell', name: 'Energy Cell', tier: MachineTier.Endgame, craftedIn: 'Nano Assembler', inputs: { lithium_ingot: 2, fine_wire: 3, aetherium_ingot: 1 }, outputAmount: 1 },
  { id: 'quantum_processor', name: 'Quantum Processor', tier: MachineTier.Endgame, craftedIn: 'Nano Assembler', inputs: { advanced_circuit: 3, xenotite_ingot: 1, fine_wire: 2 }, outputAmount: 1 },
  { id: 'veinite_core', name: 'Veinite Core', tier: MachineTier.Endgame, craftedIn: 'Quantum Fabricator', inputs: { veinite_ingot: 1, advanced_circuit: 2 }, outputAmount: 1 },
  { id: 'oblivionite_frame', name: 'Oblivionite Frame', tier: MachineTier.Endgame, craftedIn: 'Quantum Fabricator', inputs: { oblivionite_ingot: 2, titanite_casing: 3 }, outputAmount: 1 },
];
