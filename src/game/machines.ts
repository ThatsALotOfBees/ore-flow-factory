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
  // Early game examples
  { id: 'copper_wire', name: 'Copper Wire', tier: MachineTier.Early, craftedIn: 'Wire Drawer', inputs: { copper_ingot: 1 }, outputAmount: 5 },
  { id: 'iron_plate', name: 'Iron Plate', tier: MachineTier.Early, craftedIn: 'Basic Press', inputs: { iron_ingot: 1 }, outputAmount: 4 },
  { id: 'basic_circuit', name: 'Basic Circuit', tier: MachineTier.Early, craftedIn: 'Manual Assembler', inputs: { copper_wire: 2, tin_plate: 1 }, outputAmount: 1 },
  // Mid game examples (add more as needed)
  { id: 'advanced_circuit', name: 'Advanced Circuit', tier: MachineTier.Mid, craftedIn: 'Circuit Assembler', inputs: { basic_circuit: 2, fine_wire: 1, silvarin_plate: 1 }, outputAmount: 1 },
  { id: 'servo_motor', name: 'Servo Motor', tier: MachineTier.Mid, craftedIn: 'Precision Lathe', inputs: { motor: 1, titanite_rod: 1 }, outputAmount: 1 },
  // ... continue adding all parts from the user's list
];
