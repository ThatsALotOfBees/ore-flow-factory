import { Tile, OreType, GRID_SIZE } from './types';

// Simple seeded PRNG
function mulberry32(a: number) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function generateGrid(seed: number): Tile[][] {
  const rng = mulberry32(seed);
  const grid: Tile[][] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const oreType: OreType = rng() < 0.6 ? 'iron' : 'copper';
      const purity = Math.floor(rng() * 71) + 30; // 30-100
      row.push({ x, y, oreType, purity, building: null });
    }
    grid.push(row);
  }
  return grid;
}
