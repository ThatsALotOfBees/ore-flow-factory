import React, { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { ResourceKey, SELL_PRICES, BUILDING_COSTS, REFINERY_SPEED, FOUNDRY_SPEED, FOUNDRY_INPUT, ORE_METADATA, ORES, OreType } from '@/game/types';
import { MarketplacePanel } from './MarketplacePanel';
import { AlloySmelterPanel } from './AlloySmelterPanel';
import { MACHINE_RECIPES, ELECTRONICS_RECIPES } from '@/game/machines';
import { ParticleBurst } from './Animations';

type InventoryTab = 'ores' | 'refined' | 'ingots' | 'electronics';

export function Hotbar() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<'inventory' | 'marketplace' | 'crafting' | 'factory' | 'alloys'>('inventory');
  const [expanded, setExpanded] = useState(true);
  const [confirmRebirth, setConfirmRebirth] = useState(false);

  const tabs: { key: typeof tab; icon: string; label: string }[] = [
    { key: 'inventory', icon: '🎒', label: 'Inventory' },
    { key: 'marketplace', icon: '🏪', label: 'Market' },
    { key: 'crafting', icon: '🔨', label: 'Craft' },
    { key: 'alloys', icon: '🌋', label: 'Alloys' },
    { key: 'factory', icon: '🏭', label: 'Factory' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
      {expanded && (
        <div
          className="pointer-events-auto w-full max-w-2xl rounded-t-xl border border-b-0 shadow-2xl overflow-hidden"
          style={{
            background: 'hsl(220, 25%, 12%)',
            borderColor: 'hsl(220, 15%, 22%)',
            color: 'hsl(210, 30%, 90%)',
          }}
        >
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {tab === 'inventory' && <InventoryPanel />}
            {tab === 'marketplace' && <MarketplacePanel />}
            {tab === 'crafting' && <CraftingPanel />}
            {tab === 'alloys' && <AlloySmelterPanel />}
            {tab === 'factory' && <FactoryPanel />}
          </div>
        </div>
      )}

      <div
        className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-t-lg shadow-lg border border-b-0"
        style={{
          background: 'hsl(220, 25%, 10%)',
          borderColor: 'hsl(220, 15%, 22%)',
        }}
      >
        <button
          onClick={() => {
            if (!confirmRebirth) {
              setConfirmRebirth(true);
              setTimeout(() => setConfirmRebirth(false), 3000); // Reset confirm after 3s
            } else {
              dispatch({ type: 'REBIRTH' });
              setConfirmRebirth(false);
            }
          }}
          disabled={state.currency < 1000}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border disabled:opacity-30 mr-2 flex items-center justify-center gap-1 ${
            confirmRebirth 
              ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' 
              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30'
          }`}
          title={`Cost: $1000. Refunds 75% of your plot spending ($${Math.floor((state.totalSpent || 0) * 0.75)}). Keeps your inventory.`}
        >
          {confirmRebirth ? '⚠️ Click again to Confirm' : '🌌 Buy New Space ($1000)'}
        </button>
        
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { if (tab === t.key) setExpanded(!expanded); else { setTab(t.key); setExpanded(true); } }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key && expanded
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InventoryPanel() {
  const { state, dispatch } = useGame();
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('All');

  const rarities = ['All', 'Common', 'Uncommon', 'Rare', 'Very Rare', 'Ultra-Rare', 'Extremely Rare', 'Mythical', 'Legendary', 'Component'];

  const getInventoryItems = () => {
    const items: { key: string, amount: number, label: string, icon: string, color: string, rarity: string }[] = [];
    
    Object.entries(state.inventory).forEach(([key, value]) => {
      const amount = Math.floor(value as number);
      if (amount < 1) return;

      let oreType: OreType | null = null;
      let label = key;
      let icon = '📦';
      let color = '#fff';
      let rarity = 'Component';

      if (key === 'copper_wire') { icon = '➰'; label = 'Copper Wire'; }
      else if (key === 'circuit_board') { icon = '📟'; label = 'Circuit Board'; }
      else {
        // Check if it's a machine
        const machine = MACHINE_RECIPES.find(m => m.id === key);
        if (machine) {
          label = machine.name;
          icon = '⚙️';
          rarity = 'Machine';
          color = '#f59e0b'; // Amber
        } else {
          const match = key.match(/^(refined_)?(.+?)(_ingot|_ore)?$/);
          if (match) {
            oreType = match[2] as OreType;
            const meta = ORE_METADATA[oreType];
            if (meta) {
              color = meta.color;
              rarity = meta.rarity;
              if (key.includes('ore')) { label = meta.name; icon = '🪨'; }
              else if (key.includes('refined')) { label = `Ref. ${meta.name.split(' ')[0]}`; icon = '✨'; }
              else if (key.includes('ingot')) { label = `${meta.name.split(' ')[0]} Ingot`; icon = '🧱'; }
            }
          }
        }
      }

      items.push({ key, amount, label, icon, color, rarity });
    });

    return items
      .filter(item => rarityFilter === 'All' || item.rarity === rarityFilter)
      .filter(item => item.label.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.amount - a.amount);
  };

  const items = getInventoryItems();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <input 
          type="text" 
          placeholder="Search inventory..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-amber-500/50 transition-all font-medium"
        />
      </div>
      
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {rarities.map(r => (
          <button
            key={r}
            onClick={() => setRarityFilter(r)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider transition-all border ${
              rarityFilter === r 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/90 border-white/5'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[300px] overflow-y-auto pr-1">
        {items.map(item => {
          const isMachine = MACHINE_RECIPES.some(m => m.id === item.key);
          const isSelected = state.selectedMachineId === item.key;
          
          return (
            <div 
              key={item.key} 
              onClick={() => {
                if (isMachine) {
                  dispatch({ type: 'SELECT_MACHINE', machineId: isSelected ? null : item.key });
                }
              }}
              className={`flex flex-col items-center p-2 rounded-lg border transition-all relative group cursor-pointer ${
                isSelected 
                  ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-xl" style={{ color: item.color }}>{item.icon}</span>
              <span className="text-[9px] opacity-70 mt-1 truncate w-full text-center">{item.label}</span>
              <span className="text-xs font-bold font-mono text-amber-100">{item.amount.toLocaleString()}</span>
              {isMachine && (
                <div className="absolute -top-1 -right-1 bg-amber-500 text-[8px] font-black px-1 rounded shadow-lg text-black uppercase tracking-tighter">
                  Place
                </div>
              )}
              {item.rarity !== 'Component' && !isMachine && (
                <div 
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full opacity-50 shadow-sm" 
                  style={{ background: item.color, boxShadow: `0 0 5px ${item.color}` }} 
                  title={item.rarity} 
                />
              )}
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs opacity-40 italic flex flex-col items-center gap-2">
            <span className="text-2xl opacity-50">🔍</span>
            No items found matching your filters
          </div>
        )}
      </div>
    </div>
  );
}



function CraftingPanel() {
  const { state, dispatch } = useGame();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'machines' | 'electronics'>('basic');
  const [animations, setAnimations] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const handleCraft = (e: React.MouseEvent, type: any, payload: any, color: string) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setAnimations(prev => [...prev, { id: Date.now(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, color }]);
    dispatch({ type, ...payload });
  };

  const recipes = [
    { name: 'Copper Wire', icon: '➰', input: 'copper_ingot', inputAmount: 1, output: 'copper_wire', outputAmount: 5 },
    { name: 'Circuit Board', icon: '📟', input: 'copper_wire', inputAmount: 10, output: 'circuit_board', outputAmount: 1 },
    ...ORES.map(ore => ({
      name: `${ORE_METADATA[ore].name.split(' ')[0]} Ingot`,
      icon: '🧱',
      input: `refined_${ore}`,
      inputAmount: 10,
      output: `${ore}_ingot`,
      outputAmount: 5
    }))
  ];

  const filteredBasicRecipes = recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.input.toLowerCase().includes(search.toLowerCase()));
  
  // Tier unlock logic: A machine recipe is available if it is the first or if the player owns/has placed the previous machine
  const availableMachines = MACHINE_RECIPES.filter((r: any, index: number) => {
    if (r.name.toLowerCase().includes(search.toLowerCase()) === false) return false;
    if (index === 0) return true;
    const prevMachine = MACHINE_RECIPES[index - 1];
    const ownsPrev = (state.inventory[prevMachine.id as ResourceKey] || 0) > 0;
    const placedPrev = state.activeMachines.some(m => m.id === prevMachine.id);
    return ownsPrev || placedPrev;
  });

  const placedMachineNames = new Set(
    state.activeMachines.map(m => {
      const mr = MACHINE_RECIPES.find(r => r.id === m.id);
      return mr?.name ?? '';
    })
  );
  const availableElectronics = ELECTRONICS_RECIPES.filter((r: any) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {['basic', 'machines', 'electronics'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider transition-all border ${
              activeTab === t
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/90 border-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <input 
          type="text" 
          placeholder="Search recipes..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-500/50 transition-all font-medium"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 scrollbar-thin flex-1 min-h-[250px]">
        {activeTab === 'basic' && filteredBasicRecipes.map(recipe => {
          const canCraft = (state.inventory[recipe.input as ResourceKey] || 0) >= recipe.inputAmount;
          return (
            <div key={recipe.name} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 relative overflow-hidden group">
               <span className="text-2xl">{recipe.icon}</span>
               <div className="flex-1">
                 <div className="text-xs font-bold leading-none">{recipe.name}</div>
                 <div className="text-[9px] opacity-40 mt-1 uppercase">
                   {recipe.inputAmount}x {recipe.input.split('_')[0]} → {recipe.outputAmount}x
                 </div>
               </div>
               <button
                 onClick={(e) => handleCraft(e, 'CRAFT', { inputResource: recipe.input, inputAmount: recipe.inputAmount, outputResource: recipe.output, outputAmount: recipe.outputAmount }, '#34d399')}
                 disabled={!canCraft}
                 className="px-2 py-1.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-10 border border-emerald-500/20 z-10"
               >
                 Craft
               </button>
            </div>
          );
        })}
        {activeTab === 'machines' && availableMachines.map((recipe: any) => {
          const hasMachine = recipe.craftedIn === 'Hand' || placedMachineNames.has(recipe.craftedIn);
          const alreadyOwnsOne =
            recipe.id === 'manual_assembler' &&
            ((state.inventory['manual_assembler' as ResourceKey] || 0) >= 1 ||
              state.activeMachines.some((m: any) => m.id === 'manual_assembler'));
          const hasInputs = Object.entries(recipe.inputs).every(([res, amt]) => (state.inventory[res as ResourceKey] || 0) >= (amt as number));
          const canCraft = hasMachine && !alreadyOwnsOne && hasInputs;
          return (
            <div key={recipe.name} className={`flex items-center gap-3 p-3 rounded-lg border bg-white/5 ${hasMachine ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
              <span className="text-2xl">⚙️</span>
              <div className="flex-1">
                <div className="text-xs font-bold leading-none">{recipe.name} <span className="text-[8px] ml-1 opacity-50 bg-white/10 px-1 py-0.5 rounded uppercase">{recipe.tier}</span></div>
                <div className="text-[9px] mt-0.5">
                  <span className={hasMachine ? 'text-emerald-400/60' : 'text-red-400/60'}>⚙️ {recipe.craftedIn}</span>
                </div>
                <div className="text-[9px] opacity-40 mt-1 flex flex-wrap gap-1">
                  {Object.entries(recipe.inputs).length === 0 && <span>Free</span>}
                  {Object.entries(recipe.inputs).map(([res, amt]) => (
                    <span key={res} className={((state.inventory[res as ResourceKey] || 0) >= (amt as number)) ? 'text-green-400' : 'text-red-400'}>
                      {amt as number}x {res.split('_').join(' ')}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={(e) => handleCraft(e, 'CRAFT_MACHINE', { recipeId: recipe.id }, '#f59e0b')}
                disabled={!canCraft}
                className="px-2 py-1.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-10 border border-indigo-500/20"
              >
                Assemble
              </button>
            </div>
          );
        })}
        {activeTab === 'electronics' && availableElectronics.map((recipe: any) => {
          const hasMachine = recipe.craftedIn === 'Hand' || placedMachineNames.has(recipe.craftedIn);
          const hasInputs = Object.entries(recipe.inputs).every(([res, amt]) => (state.inventory[res as ResourceKey] || 0) >= (amt as number));
          const canCraft = hasMachine && hasInputs;
          return (
            <div key={recipe.id} className={`flex items-center gap-3 p-3 rounded-lg border bg-white/5 relative overflow-hidden group ${hasMachine ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
              <span className="text-2xl">🔌</span>
              <div className="flex-1">
                <div className="text-xs font-bold leading-none">{recipe.name} <span className="text-[8px] ml-1 opacity-50 bg-white/10 px-1 py-0.5 rounded uppercase">{recipe.tier}</span></div>
                <div className="text-[9px] mt-0.5">
                  <span className={hasMachine ? 'text-emerald-400/60' : 'text-red-400/60'}>⚙️ {recipe.craftedIn}</span>
                  {recipe.outputAmount > 1 && <span className="opacity-40 ml-1.5">→ {recipe.outputAmount}x</span>}
                </div>
                <div className="text-[9px] opacity-40 mt-1 flex flex-wrap gap-1">
                  {Object.entries(recipe.inputs).map(([res, amt]) => (
                    <span key={res} className={((state.inventory[res as ResourceKey] || 0) >= (amt as number)) ? 'text-green-400' : 'text-red-400'}>
                      {amt as number}x {res.split('_').join(' ')}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={(e) => handleCraft(e, 'CRAFT_ELECTRONIC', { recipeId: recipe.id }, '#60a5fa')}
                disabled={!canCraft}
                className="px-2 py-1.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-10 border border-emerald-500/20 z-10"
              >
                Craft
              </button>
            </div>
          );
        })}
        
        {((activeTab === 'basic' && filteredBasicRecipes.length === 0) || 
          (activeTab === 'machines' && availableMachines.length === 0) ||
          (activeTab === 'electronics' && availableElectronics.length === 0)) && (
          <div className="col-span-full py-8 text-center text-xs opacity-40 italic">No recipes match your search/tier.</div>
        )}
      </div>

      {animations.map(anim => (
        <ParticleBurst
          key={anim.id}
          x={anim.x}
          y={anim.y}
          color={anim.color}
          onComplete={() => setAnimations(prev => prev.filter(a => a.id !== anim.id))}
        />
      ))}
    </div>
  );
}

function FactoryPanel() {
  const { state, dispatch } = useGame();

  const buildingCounts = state.activeBuildings.reduce((acc, coords) => {
    const tile = state.grid[coords.y][coords.x];
    if (tile.building) {
      acc[tile.building.type] = (acc[tile.building.type] || 0) + 1;
      if (tile.building.type === 'refinery') acc.refining_cap += (REFINERY_SPEED[tile.building.level - 1] * 2);
      else if (tile.building.type === 'foundry') acc.smelting_cap += (FOUNDRY_SPEED[tile.building.level - 1] * 2);
    }
    return acc;
  }, { miner: 0, refinery: 0, foundry: 0, refining_cap: 0, smelting_cap: 0 });

  return (
    <div className="space-y-4 overflow-y-auto pr-1 scrollbar-thin h-full min-h-[250px]">
      <div className="text-xs uppercase tracking-wider opacity-50 text-center">Factory Overview</div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: '⛏️', label: 'Miners', count: buildingCounts.miner },
          { icon: '🏭', label: 'Refineries', count: buildingCounts.refinery },
          { icon: '🔥', label: 'Foundries', count: buildingCounts.foundry },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-lg">{s.icon}</span>
            <span className="text-[9px] opacity-40 uppercase">{s.label}</span>
            <span className="text-sm font-bold font-mono">{s.count}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => dispatch({ type: 'GLOBAL_BATCH_PROCESS', processType: 'refine' })}
          className="py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold hover:bg-cyan-500/30 transition-all text-sm"
        >
          ✨ Refine All
          <div className="text-[9px] font-normal opacity-60 uppercase mt-0.5">Cap: {buildingCounts.refining_cap} ores</div>
        </button>
        <button
          onClick={() => dispatch({ type: 'GLOBAL_BATCH_PROCESS', processType: 'smelt' })}
          className="py-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold hover:bg-amber-500/30 transition-all text-sm"
        >
          🧱 Smelt All
          <div className="text-[9px] font-normal opacity-60 uppercase mt-0.5">Cap: {Math.floor(buildingCounts.smelting_cap / FOUNDRY_INPUT)} batches</div>
        </button>
      </div>
    </div>
  );
}
