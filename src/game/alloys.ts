import { ResourceKey } from './types';

export interface AlloyRecipe {
  id: string;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Ultra-Rare' | 'Extremely Rare' | 'Mythical' | 'Legendary';
  inputs: Partial<Record<string, number>>;
  description: string;
}

export type AlloyType = 'bronzium' | 'alucite' | 'ferronick' | 'plumbite' | 'graphiron' | 'zincter' | 'auricop' | 'silvarin' | 'alubron' | 'plumbrox' | 'lithiron' | 'cryoferr' | 'pyrosteel' | 'ferrivite' | 'titanite' | 'auratium' | 'radionite_steel' | 'cryonick' | 'aluminor' | 'luminite_bronze' | 'pyrofer' | 'cryolume' | 'auraferr' | 'titanfer' | 'xenolith' | 'ferrinox' | 'pyroalum' | 'luminite_iron' | 'cryovite' | 'aurasteel' | 'lithibrass' | 'plumbiron' | 'zynfer' | 'ferralume' | 'cryobron' | 'titanbron' | 'pyrolume' | 'aurivite' | 'radionite_alloy' | 'cryoflux' | 'titanlume' | 'ferronix' | 'pyrocore' | 'alublast' | 'silvarium' | 'lithoferr' | 'cryonite' | 'radivite' | 'luminox' | 'pyrolith' | 'bronzite' | 'titanore' | 'cryovium' | 'aurivium' | 'luminite_steel' | 'ferrivium' | 'pyroclastium' | 'cryoferrite' | 'titanvium' | 'auraflux' | 'luminorite' | 'pyroferium' | 'cryolux' | 'titanlux' | 'aurinox' | 'radivium' | 'cryoplate' | 'pyrocorex' | 'ferrivion' | 'lithovium' | 'titanflare' | 'cryoflare' | 'veinsteel' | 'veinlux' | 'veincore' | 'oblivionite' | 'etherium_alloy' | 'xenolith' | 'veincryst' | 'auraflare' | 'cryolith' | 'pyroclastium_lux' | 'titanflare_lux' | 'radivium_lux' | 'ferrivion_lux' | 'cryoflare_lux' | 'veinflare' | 'veinfury' | 'oblivionflare' | 'etherflare' | 'xenoflux' | 'titanflux' | 'cryoluxite' | 'pyroflux' | 'lithoflux' | 'auraflux' | 'veinflux' | 'oblivionflux' | 'etherflux' | 'xenoflare';

export const ALLOY_RECIPES: AlloyRecipe[] = [
  {
    "id": "bronzium",
    "name": "Bronzium",
    "rarity": "Common",
    "inputs": {
      "copper_ingot": 1,
      "tin_ingot": 1
    },
    "description": "Classic, durable, widely used in machinery."
  },
  {
    "id": "alucite",
    "name": "Alucite",
    "rarity": "Common",
    "inputs": {
      "aluminum_ingot": 1,
      "iron_ingot": 1
    },
    "description": "Lightweight, moderate strength, industrial alloy."
  },
  {
    "id": "ferronick",
    "name": "Ferronick",
    "rarity": "Common",
    "inputs": {
      "iron_ingot": 1,
      "nickel_ingot": 1
    },
    "description": "Rust-resistant, versatile for construction."
  },
  {
    "id": "plumbite",
    "name": "Plumbite",
    "rarity": "Common",
    "inputs": {
      "lead_ingot": 1,
      "tin_ingot": 1
    },
    "description": "Low-melting, easy to mold, industrial fittings."
  },
  {
    "id": "graphiron",
    "name": "Graphiron",
    "rarity": "Common",
    "inputs": {
      "iron_ingot": 1,
      "graphite_ingot": 1
    },
    "description": "Hard, basic industrial alloy, conductive."
  },
  {
    "id": "zincter",
    "name": "Zincter",
    "rarity": "Common",
    "inputs": {
      "zinc_ingot": 1,
      "iron_ingot": 1
    },
    "description": "Corrosion-resistant, structural metal."
  },
  {
    "id": "auricop",
    "name": "Auricop",
    "rarity": "Uncommon",
    "inputs": {
      "gold_ingot": 1,
      "copper_ingot": 1
    },
    "description": "Luxury conductive alloy, decorative plating."
  },
  {
    "id": "silvarin",
    "name": "Silvarin",
    "rarity": "Uncommon",
    "inputs": {
      "silver_ingot": 1,
      "nickel_ingot": 1
    },
    "description": "Conductive, high-tech industrial use."
  },
  {
    "id": "alubron",
    "name": "Alubron",
    "rarity": "Uncommon",
    "inputs": {
      "aluminum_ingot": 1,
      "bronze_ingot": 1
    },
    "description": "Lightweight, corrosion-resistant."
  },
  {
    "id": "plumbrox",
    "name": "Plumbrox",
    "rarity": "Uncommon",
    "inputs": {
      "lead_ingot": 1,
      "bronze_ingot": 1
    },
    "description": "Heavy-duty, radiation-tolerant structures."
  },
  {
    "id": "lithiron",
    "name": "Lithiron",
    "rarity": "Rare",
    "inputs": {
      "iron_ingot": 1,
      "lithium_ingot": 1
    },
    "description": "Energy-reactive, lightweight industrial metal."
  },
  {
    "id": "cryoferr",
    "name": "Cryoferr",
    "rarity": "Rare",
    "inputs": {
      "ferridium_ingot": 1,
      "cryotheum_ingot": 1
    },
    "description": "Ultra-cold resistant, used in cryoweapons."
  },
  {
    "id": "pyrosteel",
    "name": "Pyrosteel",
    "rarity": "Rare",
    "inputs": {
      "steel_ingot": 1,
      "pyroclast_ingot": 1
    },
    "description": "Heat-resistant, industrial/weaponry alloy."
  },
  {
    "id": "ferrivite",
    "name": "Ferrivite",
    "rarity": "Rare",
    "inputs": {
      "ferridium_ingot": 1,
      "nickel_ingot": 1
    },
    "description": "Super-strong, industrial alloy."
  },
  {
    "id": "titanite",
    "name": "Titanite",
    "rarity": "Very Rare",
    "inputs": {
      "titanium_ingot": 1,
      "steel_ingot": 1
    },
    "description": "Armor-grade, ultra-durable alloy."
  },
  {
    "id": "auratium",
    "name": "Auratium",
    "rarity": "Very Rare",
    "inputs": {
      "gold_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Luxury, corrosion-resistant, conductive."
  },
  {
    "id": "radionite_steel",
    "name": "Radionite Steel",
    "rarity": "Very Rare",
    "inputs": {
      "radionite_ingot": 1,
      "steel_ingot": 1
    },
    "description": "Radiation-shielded, reactor-safe alloy."
  },
  {
    "id": "cryonick",
    "name": "Cryonick",
    "rarity": "Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "nickel_ingot": 1
    },
    "description": "Cold-resistant, medium-strength industrial alloy."
  },
  {
    "id": "aluminor",
    "name": "Aluminor",
    "rarity": "Common",
    "inputs": {
      "aluminum_ingot": 1,
      "copper_ingot": 1
    },
    "description": "Lightweight, moderate strength."
  },
  {
    "id": "luminite_bronze",
    "name": "Luminite Bronze",
    "rarity": "Uncommon",
    "inputs": {
      "luminite_ingot": 1,
      "bronze_ingot": 1
    },
    "description": "Faintly glowing, decorative or functional."
  },
  {
    "id": "pyrofer",
    "name": "Pyrofer",
    "rarity": "Rare",
    "inputs": {
      "pyroclast_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Heat-proof industrial alloy."
  },
  {
    "id": "cryolume",
    "name": "Cryolume",
    "rarity": "Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "luminite_ingot": 1
    },
    "description": "Cold-resistant, faintly glowing alloy."
  },
  {
    "id": "auraferr",
    "name": "Auraferr",
    "rarity": "Uncommon",
    "inputs": {
      "aluminum_ingot": 1,
      "silver_ingot": 1
    },
    "description": "Lightweight, conductive alloy."
  },
  {
    "id": "titanfer",
    "name": "Titanfer",
    "rarity": "Very Rare",
    "inputs": {
      "titanium_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Armor-grade, high-strength alloy."
  },
  {
    "id": "xenolith",
    "name": "Xenolith",
    "rarity": "Extremely Rare",
    "inputs": {
      "xenotite_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Alien-grade, extremely high-strength."
  },
  {
    "id": "ferrinox",
    "name": "Ferrinox",
    "rarity": "Common",
    "inputs": {
      "iron_ingot": 1,
      "nickel_ingot": 1,
      "graphite_ingot": 1
    },
    "description": "Basic industrial alloy, high durability."
  },
  {
    "id": "pyroalum",
    "name": "Pyroalum",
    "rarity": "Rare",
    "inputs": {
      "pyroclast_ingot": 1,
      "aluminum_ingot": 1
    },
    "description": "Heat-resistant, lightweight."
  },
  {
    "id": "luminite_iron",
    "name": "Luminite Iron",
    "rarity": "Uncommon",
    "inputs": {
      "luminite_ingot": 1,
      "iron_ingot": 1
    },
    "description": "Faintly glowing structural metal."
  },
  {
    "id": "cryovite",
    "name": "Cryovite",
    "rarity": "Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Ultra-cold resistant, industrial alloy."
  },
  {
    "id": "aurasteel",
    "name": "Aurasteel",
    "rarity": "Very Rare",
    "inputs": {
      "gold_ingot": 1,
      "steel_ingot": 1
    },
    "description": "Luxury armor plating, corrosion-resistant."
  },
  {
    "id": "lithibrass",
    "name": "Lithibrass",
    "rarity": "Rare",
    "inputs": {
      "lithium_ingot": 1,
      "brass_ingot": 1
    },
    "description": "Energy-reactive, lightweight tech alloy."
  },
  {
    "id": "plumbiron",
    "name": "Plumbiron",
    "rarity": "Common",
    "inputs": {
      "lead_ingot": 1,
      "iron_ingot": 1
    },
    "description": "Heavy, industrial alloy."
  },
  {
    "id": "zynfer",
    "name": "Zynfer",
    "rarity": "Common",
    "inputs": {
      "zinc_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Corrosion-resistant, industrial use."
  },
  {
    "id": "ferralume",
    "name": "Ferralume",
    "rarity": "Rare",
    "inputs": {
      "ferridium_ingot": 1,
      "luminite_ingot": 1
    },
    "description": "Glowing, durable alloy."
  },
  {
    "id": "cryobron",
    "name": "Cryobron",
    "rarity": "Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "bronze_ingot": 1
    },
    "description": "Cold-resistant, decorative tech."
  },
  {
    "id": "titanbron",
    "name": "Titanbron",
    "rarity": "Very Rare",
    "inputs": {
      "titanium_ingot": 1,
      "bronze_ingot": 1
    },
    "description": "Ultra-strong, armor or machinery."
  },
  {
    "id": "pyrolume",
    "name": "Pyrolume",
    "rarity": "Rare",
    "inputs": {
      "pyroclast_ingot": 1,
      "luminite_ingot": 1
    },
    "description": "Heat-resistant, faintly glowing."
  },
  {
    "id": "aurivite",
    "name": "Aurivite",
    "rarity": "Very Rare",
    "inputs": {
      "gold_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Luxury-grade armor and tech plating."
  },
  {
    "id": "radionite_alloy",
    "name": "Radionite Alloy",
    "rarity": "Very Rare",
    "inputs": {
      "radionite_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Radiation-shielding, industrial tech."
  },
  {
    "id": "cryoflux",
    "name": "Cryoflux",
    "rarity": "Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "lithium_ingot": 1
    },
    "description": "Cold-resistant, energy-reactive alloy."
  },
  {
    "id": "titanlume",
    "name": "Titanlume",
    "rarity": "Very Rare",
    "inputs": {
      "titanium_ingot": 1,
      "luminite_ingot": 1
    },
    "description": "Glowing armor or decorative panels."
  },
  {
    "id": "ferronix",
    "name": "Ferronix",
    "rarity": "Common",
    "inputs": {
      "ferridium_ingot": 1,
      "iron_ingot": 1
    },
    "description": "Durable, basic industrial alloy."
  },
  {
    "id": "pyrocore",
    "name": "Pyrocore",
    "rarity": "Rare",
    "inputs": {
      "pyroclast_ingot": 1,
      "steel_ingot": 1
    },
    "description": "Heat-resistant structural alloy."
  },
  {
    "id": "alublast",
    "name": "Alublast",
    "rarity": "Common",
    "inputs": {
      "aluminum_ingot": 1,
      "lead_ingot": 1
    },
    "description": "Lightweight, dense alloy, industrial uses."
  },
  {
    "id": "silvarium",
    "name": "Silvarium",
    "rarity": "Uncommon",
    "inputs": {
      "silver_ingot": 1,
      "aluminum_ingot": 1
    },
    "description": "Conductive, lightweight tech alloy."
  },
  {
    "id": "lithoferr",
    "name": "Lithoferr",
    "rarity": "Rare",
    "inputs": {
      "lithium_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Energy-reactive, high-strength."
  },
  {
    "id": "cryonite",
    "name": "Cryonite",
    "rarity": "Very Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Ultra-cold resistant, aerospace-grade."
  },
  {
    "id": "radivite",
    "name": "Radivite",
    "rarity": "Very Rare",
    "inputs": {
      "radionite_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Radiation-shielded, reactor-grade alloy."
  },
  {
    "id": "luminox",
    "name": "Luminox",
    "rarity": "Uncommon",
    "inputs": {
      "luminite_ingot": 1,
      "nickel_ingot": 1
    },
    "description": "Faintly glowing, conductive."
  },
  {
    "id": "pyrolith",
    "name": "Pyrolith",
    "rarity": "Rare",
    "inputs": {
      "pyroclast_ingot": 1,
      "lithium_ingot": 1
    },
    "description": "Heat-resistant, energy-reactive alloy."
  },
  {
    "id": "bronzite",
    "name": "Bronzite",
    "rarity": "Common",
    "inputs": {
      "copper_ingot": 1,
      "tin_ingot": 1,
      "aluminum_ingot": 1
    },
    "description": "Classic industrial alloy, lightweight variant."
  },
  {
    "id": "titanore",
    "name": "Titanore",
    "rarity": "Very Rare",
    "inputs": {
      "titanium_ingot": 1,
      "ferridium_ingot": 1,
      "nickel_ingot": 1
    },
    "description": "Armor-grade, high-strength."
  },
  {
    "id": "cryovium",
    "name": "Cryovium",
    "rarity": "Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "silver_ingot": 1
    },
    "description": "Ultra-cold, conductive alloy."
  },
  {
    "id": "aurivium",
    "name": "Aurivium",
    "rarity": "Very Rare",
    "inputs": {
      "gold_ingot": 1,
      "titanium_ingot": 1,
      "aluminum_ingot": 1
    },
    "description": "Luxury armor-grade alloy."
  },
  {
    "id": "luminite_steel",
    "name": "Luminite Steel",
    "rarity": "Uncommon",
    "inputs": {
      "luminite_ingot": 1,
      "steel_ingot": 1
    },
    "description": "Faintly glowing, industrial alloy."
  },
  {
    "id": "ferrivium",
    "name": "Ferrivium",
    "rarity": "Rare",
    "inputs": {
      "ferridium_ingot": 1,
      "nickel_ingot": 1,
      "copper_ingot": 1
    },
    "description": "High-strength tech alloy."
  },
  {
    "id": "pyroclastium",
    "name": "Pyroclastium",
    "rarity": "Rare",
    "inputs": {
      "pyroclast_ingot": 1,
      "ferridium_ingot": 1,
      "steel_ingot": 1
    },
    "description": "Heat-resistant alloy for machinery."
  },
  {
    "id": "cryoferrite",
    "name": "Cryoferrite",
    "rarity": "Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "ferridium_ingot": 1,
      "nickel_ingot": 1
    },
    "description": "Ultra-cold industrial alloy."
  },
  {
    "id": "titanvium",
    "name": "Titanvium",
    "rarity": "Very Rare",
    "inputs": {
      "titanium_ingot": 1,
      "ferridium_ingot": 1,
      "steel_ingot": 1
    },
    "description": "Armor-grade, super-strong alloy."
  },
  {
    "id": "auraflux",
    "name": "Auraflux",
    "rarity": "Very Rare",
    "inputs": {
      "gold_ingot": 1,
      "ferridium_ingot": 1,
      "cryotheum_ingot": 1
    },
    "description": "Luxury energy-conductive alloy."
  },
  {
    "id": "luminorite",
    "name": "Luminorite",
    "rarity": "Uncommon",
    "inputs": {
      "luminite_ingot": 1,
      "bronze_ingot": 1,
      "aluminum_ingot": 1
    },
    "description": "Faintly glowing decorative alloy."
  },
  {
    "id": "pyroferium",
    "name": "Pyroferium",
    "rarity": "Rare",
    "inputs": {
      "pyroclast_ingot": 1,
      "ferridium_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Heat-resistant armor alloy."
  },
  {
    "id": "cryolux",
    "name": "Cryolux",
    "rarity": "Very Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "luminite_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Cold-resistant, faintly glowing alloy."
  },
  {
    "id": "titanlux",
    "name": "Titanlux",
    "rarity": "Very Rare",
    "inputs": {
      "titanium_ingot": 1,
      "luminite_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Ultra-strong, glowing armor alloy."
  },
  {
    "id": "aurinox",
    "name": "Aurinox",
    "rarity": "Very Rare",
    "inputs": {
      "gold_ingot": 1,
      "nickel_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Luxury high-strength alloy."
  },
  {
    "id": "radivium",
    "name": "Radivium",
    "rarity": "Very Rare",
    "inputs": {
      "radionite_ingot": 1,
      "ferridium_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Radiation-resistant, industrial."
  },
  {
    "id": "cryoplate",
    "name": "Cryoplate",
    "rarity": "Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "steel_ingot": 1,
      "aluminum_ingot": 1
    },
    "description": "Cold-resistant structural alloy."
  },
  {
    "id": "pyrocorex",
    "name": "Pyrocorex",
    "rarity": "Rare",
    "inputs": {
      "pyroclast_ingot": 1,
      "ferridium_ingot": 1,
      "luminite_ingot": 1
    },
    "description": "Heat-resistant, glowing alloy."
  },
  {
    "id": "ferrivion",
    "name": "Ferrivion",
    "rarity": "Rare",
    "inputs": {
      "ferridium_ingot": 1,
      "nickel_ingot": 1,
      "luminite_ingot": 1
    },
    "description": "Durable, faintly glowing alloy."
  },
  {
    "id": "lithovium",
    "name": "Lithovium",
    "rarity": "Rare",
    "inputs": {
      "lithium_ingot": 1,
      "ferridium_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Energy-reactive, strong alloy."
  },
  {
    "id": "titanflare",
    "name": "Titanflare",
    "rarity": "Very Rare",
    "inputs": {
      "titanium_ingot": 1,
      "pyroclast_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Heat-resistant armor-grade alloy."
  },
  {
    "id": "cryoflare",
    "name": "Cryoflare",
    "rarity": "Very Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "pyroclast_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Extreme cold and heat-resistant alloy."
  },
  {
    "id": "veinsteel",
    "name": "Veinsteel",
    "rarity": "Mythical",
    "inputs": {
      "veinite_ingot": 1,
      "steel_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Mutation-resistant, legendary armor."
  },
  {
    "id": "veinlux",
    "name": "Veinlux",
    "rarity": "Mythical",
    "inputs": {
      "veinite_ingot": 1,
      "luminite_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Faintly glowing, mythical defensive alloy."
  },
  {
    "id": "veincore",
    "name": "Veincore",
    "rarity": "Mythical",
    "inputs": {
      "veinite_ingot": 1,
      "ferridium_ingot": 1,
      "pyroclast_ingot": 1
    },
    "description": "Ultra-durable, legendary heat/mutation resistant."
  },
  {
    "id": "oblivionite",
    "name": "Oblivionite",
    "rarity": "Ultra-Rare",
    "inputs": {
      "oblivionite_ingot": 1,
      "ferridium_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Absorbs heat/light, nearly indestructible."
  },
  {
    "id": "etherium_alloy",
    "name": "Etherium Alloy",
    "rarity": "Legendary",
    "inputs": {
      "etherclast_ingot": 1,
      "titanium_ingot": 1,
      "cryotheum_ingot": 1
    },
    "description": "Phased, energy-conductive, experimental."
  },
  {
    "id": "xenolith",
    "name": "Xenolith",
    "rarity": "Extremely Rare",
    "inputs": {
      "xenotite_ingot": 1,
      "titanium_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Alien-grade, extremely high-strength."
  },
  {
    "id": "veincryst",
    "name": "Veincryst",
    "rarity": "Mythical",
    "inputs": {
      "veinite_ingot": 1,
      "luminite_ingot": 1,
      "cryotheum_ingot": 1
    },
    "description": "Faintly glowing, ultra-resistant armor."
  },
  {
    "id": "auraflare",
    "name": "Auraflare",
    "rarity": "Very Rare",
    "inputs": {
      "gold_ingot": 1,
      "pyroclast_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Luxury heat-resistant alloy."
  },
  {
    "id": "cryolith",
    "name": "Cryolith",
    "rarity": "Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "luminite_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Cold-resistant, durable industrial alloy."
  },
  {
    "id": "pyroclastium_lux",
    "name": "Pyroclastium Lux",
    "rarity": "Rare",
    "inputs": {
      "pyroclast_ingot": 1,
      "luminite_ingot": 1,
      "aluminum_ingot": 1
    },
    "description": "Heat-resistant, glowing alloy."
  },
  {
    "id": "titanflare_lux",
    "name": "Titanflare Lux",
    "rarity": "Very Rare",
    "inputs": {
      "titanium_ingot": 1,
      "luminite_ingot": 1,
      "pyroclast_ingot": 1
    },
    "description": "Glowing armor-grade alloy."
  },
  {
    "id": "radivium_lux",
    "name": "Radivium Lux",
    "rarity": "Very Rare",
    "inputs": {
      "radionite_ingot": 1,
      "luminite_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Radiation-resistant, glowing alloy."
  },
  {
    "id": "ferrivion_lux",
    "name": "Ferrivion Lux",
    "rarity": "Rare",
    "inputs": {
      "ferridium_ingot": 1,
      "luminite_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Durable glowing alloy."
  },
  {
    "id": "cryoflare_lux",
    "name": "Cryoflare Lux",
    "rarity": "Very Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "pyroclast_ingot": 1,
      "luminite_ingot": 1
    },
    "description": "Extreme cold/heat, glowing alloy."
  },
  {
    "id": "veinflare",
    "name": "Veinflare",
    "rarity": "Mythical",
    "inputs": {
      "veinite_ingot": 1,
      "pyroclast_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Legendary mutation- and heat-resistant alloy."
  },
  {
    "id": "veinfury",
    "name": "Veinfury",
    "rarity": "Mythical",
    "inputs": {
      "veinite_ingot": 1,
      "pyroclast_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Ultra-resistant, legendary armor alloy."
  },
  {
    "id": "oblivionflare",
    "name": "Oblivionflare",
    "rarity": "Ultra-Rare",
    "inputs": {
      "oblivionite_ingot": 1,
      "pyroclast_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Absorbs heat, high-tech armor."
  },
  {
    "id": "etherflare",
    "name": "Etherflare",
    "rarity": "Legendary",
    "inputs": {
      "etherclast_ingot": 1,
      "pyroclast_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Phased, energy-conductive armor alloy."
  },
  {
    "id": "xenoflux",
    "name": "Xenoflux",
    "rarity": "Extremely Rare",
    "inputs": {
      "xenotite_ingot": 1,
      "luminite_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Alien, glowing, extremely strong."
  },
  {
    "id": "titanflux",
    "name": "Titanflux",
    "rarity": "Very Rare",
    "inputs": {
      "titanium_ingot": 1,
      "etherium_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Ultra-strong energy-conductive alloy."
  },
  {
    "id": "cryoluxite",
    "name": "Cryoluxite",
    "rarity": "Very Rare",
    "inputs": {
      "cryotheum_ingot": 1,
      "luminite_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Cold-resistant, faintly glowing."
  },
  {
    "id": "pyroflux",
    "name": "Pyroflux",
    "rarity": "Rare",
    "inputs": {
      "pyroclast_ingot": 1,
      "ferridium_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Heat-resistant, industrial alloy."
  },
  {
    "id": "lithoflux",
    "name": "Lithoflux",
    "rarity": "Rare",
    "inputs": {
      "lithium_ingot": 1,
      "ferridium_ingot": 1,
      "cryotheum_ingot": 1
    },
    "description": "Energy-reactive, cold-resistant alloy."
  },
  {
    "id": "auraflux",
    "name": "Auraflux",
    "rarity": "Very Rare",
    "inputs": {
      "gold_ingot": 1,
      "cryotheum_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Luxury energy-conductive alloy."
  },
  {
    "id": "veinflux",
    "name": "Veinflux",
    "rarity": "Mythical",
    "inputs": {
      "veinite_ingot": 1,
      "ferridium_ingot": 1,
      "cryotheum_ingot": 1
    },
    "description": "Legendary alloy, mutation- and cold-resistant."
  },
  {
    "id": "oblivionflux",
    "name": "Oblivionflux",
    "rarity": "Ultra-Rare",
    "inputs": {
      "oblivionite_ingot": 1,
      "cryotheum_ingot": 1,
      "titanium_ingot": 1
    },
    "description": "Absorbs heat/light, nearly indestructible."
  },
  {
    "id": "etherflux",
    "name": "Etherflux",
    "rarity": "Legendary",
    "inputs": {
      "etherclast_ingot": 1,
      "cryotheum_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Phased, energy-conductive experimental alloy."
  },
  {
    "id": "xenoflare",
    "name": "Xenoflare",
    "rarity": "Extremely Rare",
    "inputs": {
      "xenotite_ingot": 1,
      "pyroclast_ingot": 1,
      "ferridium_ingot": 1
    },
    "description": "Alien, heat-resistant, ultra-strong alloy."
  }
];
