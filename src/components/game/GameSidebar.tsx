import React from 'react';
import { useGame } from '@/game/GameContext';
import { SELL_PRICES, ResourceKey } from '@/game/types';

const RESOURCE_LABELS: Record<ResourceKey, string> = {
  iron_ore: '🪨 Iron Ore',
  copper_ore: '🪨 Copper Ore',
  refined_iron: '✨ Refined Iron',
  refined_copper: '✨ Refined Copper',
  iron_ingot: '🧱 Iron Ingot',
  copper_ingot: '🧱 Copper Ingot',
};

const RESOURCE_ORDER: ResourceKey[] = [
  'iron_ore', 'copper_ore',
  'refined_iron', 'refined_copper',
  'iron_ingot', 'copper_ingot',
];

export function GameSidebar() {
  const { state, dispatch } = useGame();

  const sell = (resource: ResourceKey) => {
    const amount = Math.floor(state.inventory[resource]);
    if (amount > 0) dispatch({ type: 'SELL', resource, amount });
  };

  return (
    <div
      className="w-64 shrink-0 flex flex-col border-r overflow-y-auto"
      style={{
        background: 'hsl(220, 25%, 12%)',
        borderColor: 'hsl(220, 15%, 20%)',
        color: 'hsl(210, 30%, 90%)',
      }}
    >
      {/* Currency */}
      <div className="p-4 border-b" style={{ borderColor: 'hsl(220, 15%, 20%)' }}>
        <div className="text-xs uppercase tracking-wider opacity-60">Currency</div>
        <div className="text-2xl font-bold text-amber-400">${state.currency.toFixed(2)}</div>
      </div>

      {/* Inventory */}
      <div className="p-4 flex-1">
        <div className="text-xs uppercase tracking-wider opacity-60 mb-3">Inventory</div>
        <div className="space-y-2">
          {RESOURCE_ORDER.map(key => {
            const amount = state.inventory[key];
            const price = SELL_PRICES[key] || 0;
            return (
              <div key={key} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate">{RESOURCE_LABELS[key]}</div>
                  <div className="text-sm font-mono font-bold">{amount.toFixed(1)}</div>
                </div>
                <button
                  className="text-[10px] px-2 py-1 rounded border border-amber-500/30 hover:bg-amber-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-amber-400 whitespace-nowrap"
                  disabled={Math.floor(amount) < 1}
                  onClick={() => sell(key)}
                >
                  Sell ${price}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t space-y-2" style={{ borderColor: 'hsl(220, 15%, 20%)' }}>
        <div className="text-xs uppercase tracking-wider opacity-60 mb-2">Controls</div>
        <div className="text-[10px] opacity-50 space-y-1">
          <div>🖱️ Drag to pan</div>
          <div>🔍 Scroll to zoom</div>
          <div>👆 Hover for info</div>
          <div>🖱️ Right-click for actions</div>
        </div>
        <button
          className="w-full mt-3 text-xs px-3 py-2 rounded border border-red-500/30 hover:bg-red-500/20 text-red-400 transition-colors"
          onClick={() => {
            if (confirm('Reset all progress?')) dispatch({ type: 'RESET' });
          }}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
