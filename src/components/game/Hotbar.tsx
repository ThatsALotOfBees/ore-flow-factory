import React, { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { ResourceKey, SELL_PRICES } from '@/game/types';

const RESOURCE_LABELS: Record<ResourceKey, { icon: string; name: string }> = {
  iron_ore: { icon: '🪨', name: 'Iron Ore' },
  copper_ore: { icon: '🟤', name: 'Copper Ore' },
  refined_iron: { icon: '✨', name: 'Ref. Iron' },
  refined_copper: { icon: '💫', name: 'Ref. Copper' },
  iron_ingot: { icon: '🧱', name: 'Iron Ingot' },
  copper_ingot: { icon: '🥉', name: 'Copper Ingot' },
};

const RESOURCE_ORDER: ResourceKey[] = [
  'iron_ore', 'copper_ore', 'refined_iron', 'refined_copper', 'iron_ingot', 'copper_ingot',
];

type HotbarTab = 'inventory' | 'marketplace' | 'crafting';

export function Hotbar() {
  const [tab, setTab] = useState<HotbarTab>('inventory');
  const [expanded, setExpanded] = useState(true);

  const tabs: { key: HotbarTab; icon: string; label: string }[] = [
    { key: 'inventory', icon: '🎒', label: 'Inventory' },
    { key: 'marketplace', icon: '🏪', label: 'Market' },
    { key: 'crafting', icon: '🔨', label: 'Craft' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
      {/* Panel */}
      {expanded && (
        <div
          className="pointer-events-auto w-full max-w-2xl rounded-t-xl border border-b-0 shadow-2xl overflow-hidden"
          style={{
            background: 'hsl(220, 25%, 12%)',
            borderColor: 'hsl(220, 15%, 22%)',
            color: 'hsl(210, 30%, 90%)',
          }}
        >
          <div className="p-4 max-h-64 overflow-y-auto">
            {tab === 'inventory' && <InventoryPanel />}
            {tab === 'marketplace' && <MarketplacePanel />}
            {tab === 'crafting' && <CraftingPanel />}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div
        className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-t-lg shadow-lg border border-b-0"
        style={{
          background: 'hsl(220, 25%, 10%)',
          borderColor: 'hsl(220, 15%, 22%)',
        }}
      >
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
  const { state } = useGame();

  return (
    <div>
      <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Your Resources</div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {RESOURCE_ORDER.map(key => {
          const r = RESOURCE_LABELS[key];
          const amount = state.inventory[key];
          return (
            <div
              key={key}
              className="flex flex-col items-center p-3 rounded-lg border border-white/5 bg-white/5"
            >
              <span className="text-2xl">{r.icon}</span>
              <span className="text-[10px] opacity-60 mt-1">{r.name}</span>
              <span className="text-sm font-bold font-mono">{amount.toFixed(1)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarketplacePanel() {
  const { state, dispatch } = useGame();
  const [sellAmounts, setSellAmounts] = useState<Record<string, number>>({});

  const handleSell = (resource: ResourceKey) => {
    const amount = sellAmounts[resource] || Math.floor(state.inventory[resource]);
    if (amount > 0) {
      dispatch({ type: 'SELL', resource, amount });
      setSellAmounts(prev => ({ ...prev, [resource]: 0 }));
    }
  };

  const sellAll = () => {
    RESOURCE_ORDER.forEach(key => {
      const amount = Math.floor(state.inventory[key]);
      if (amount > 0) dispatch({ type: 'SELL', resource: key, amount });
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wider opacity-50">Marketplace</div>
          <div className="text-lg font-bold text-amber-400">💰 ${state.currency.toFixed(2)}</div>
        </div>
        <button
          onClick={sellAll}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors border border-amber-500/30"
        >
          Sell All
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {RESOURCE_ORDER.map(key => {
          const r = RESOURCE_LABELS[key];
          const amount = state.inventory[key];
          const price = SELL_PRICES[key] || 0;
          return (
            <div
              key={key}
              className="flex items-center gap-3 p-2 rounded-lg border border-white/5 bg-white/5"
            >
              <span className="text-xl">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate">{r.name}</div>
                <div className="text-[10px] opacity-50">${price}/ea • {amount.toFixed(1)} owned</div>
              </div>
              <button
                onClick={() => handleSell(key)}
                disabled={Math.floor(amount) < 1}
                className="px-2 py-1 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Sell
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const RECIPES = [
  { name: 'Iron Ingot', icon: '🧱', input: 'refined_iron' as ResourceKey, inputAmount: 10, output: 'iron_ingot' as ResourceKey, outputAmount: 5 },
  { name: 'Copper Ingot', icon: '🥉', input: 'refined_copper' as ResourceKey, inputAmount: 10, output: 'copper_ingot' as ResourceKey, outputAmount: 5 },
];

function CraftingPanel() {
  const { state, dispatch } = useGame();

  const craft = (recipe: typeof RECIPES[0]) => {
    if (state.inventory[recipe.input] >= recipe.inputAmount) {
      // Manual craft: consume input, produce output
      dispatch({ type: 'SELL', resource: recipe.input, amount: 0 }); // trigger re-render
      // We'll add a CRAFT action
    }
  };

  return (
    <div>
      <div className="text-xs uppercase tracking-wider opacity-50 mb-3">Manual Crafting</div>
      <div className="text-[11px] opacity-40 mb-3">
        💡 Tip: Place Foundries on the grid for automatic crafting!
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {RECIPES.map(recipe => {
          const canCraft = state.inventory[recipe.input] >= recipe.inputAmount;
          return (
            <div
              key={recipe.name}
              className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5"
            >
              <span className="text-2xl">{recipe.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{recipe.name}</div>
                <div className="text-[10px] opacity-50">
                  {recipe.inputAmount}x {RESOURCE_LABELS[recipe.input].name} → {recipe.outputAmount}x
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'CRAFT', inputResource: recipe.input, inputAmount: recipe.inputAmount, outputResource: recipe.output, outputAmount: recipe.outputAmount })}
                disabled={!canCraft}
                className="px-3 py-1.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Craft
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
