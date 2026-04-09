import { Tile, OreType, GRID_SIZE, ORE_METADATA, ORES } from './types';

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

  // 1. Initialize with empty space
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ x, y, oreType: null, purity: 0, building: null });
    }
    grid.push(row);
  }

  // 2. Rarity → spawn chance and patch config
  // Each ore independently rolls to even EXIST on this map.
  // Target: 3-5 ore types per map on average.
  const raritySpawnConfig: Record<string, { spawnChance: number; patches: number; radius: number }> = {
    'Common':         { spawnChance: 0.40, patches: 2, radius: 4 },
    'Uncommon':       { spawnChance: 0.15, patches: 1, radius: 3 },
    'Rare':           { spawnChance: 0.08, patches: 1, radius: 2 },
    'Very Rare':      { spawnChance: 0.03, patches: 1, radius: 2 },
    'Ultra-Rare':     { spawnChance: 0.015, patches: 1, radius: 1 },
    'Extremely Rare': { spawnChance: 0.005, patches: 1, radius: 1 },
    'Mythical':       { spawnChance: 0.003, patches: 1, radius: 1 },
    'Legendary':      { spawnChance: 0.001, patches: 1, radius: 1 },
  };

  // 3. For each ore, roll whether it spawns at all
  ORES.forEach(ore => {
    const meta = ORE_METADATA[ore];
    const config = raritySpawnConfig[meta.rarity];

    // Roll: does this ore exist on this map?
    if (rng() > config.spawnChance) return; // Skip — this ore doesn't spawn here

    // It exists! Place patches
    for (let i = 0; i < config.patches; i++) {
      const cx = Math.floor(rng() * GRID_SIZE);
      const cy = Math.floor(rng() * GRID_SIZE);

      for (let y = cy - config.radius; y <= cy + config.radius; y++) {
        for (let x = cx - config.radius; x <= cx + config.radius; x++) {
          if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) continue;

          const dx = x - cx;
          const dy = y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > config.radius) continue;

          // Probability decreases towards edge
          const prob = 1 - (distance / config.radius);
          if (rng() > prob + 0.2) continue;

          const tile = grid[y][x];
          if (!tile.oreType) {
            tile.oreType = ore as OreType;
            const basePurity = 30 + (70 * prob);
            tile.purity = Math.floor(Math.max(30, Math.min(100, basePurity + (rng() * 10 - 5))));
          }
        }
      }
    }
  });

  return grid;
}
