import React, { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { Tile, BUILDING_COSTS, UPGRADE_COSTS, Cost, ResourceKey, ORE_METADATA, ORES, OreType } from '@/game/types';

interface Props {
  tile: Tile;
  x: number;
  y: number;
  onClose: () => void;
}

export function TileContextMenu({ tile, x, y, onClose }: Props) {
  const { state, dispatch } = useGame();
  const [showOreSelection, setShowOreSelection] = useState(false);

  const act = (fn: () => void) => {
    fn();
    onClose();
  };

  const canAfford = (cost: Cost) => {
    if (state.currency < cost.currency) return false;
    if (cost.resources) {
      for (const [res, amt] of Object.entries(cost.resources)) {
        if ((state.inventory[res as ResourceKey] || 0) < (amt as number)) return false;
      }
    }
    return true;
  };

  const formatCost = (cost: Cost) => {
    let label = `$${cost.currency}`;
    if (cost.resources) {
      for (const [res, amt] of Object.entries(cost.resources)) {
        const name = res.split('_')[0];
        label += ` + ${amt}x ${name}`;
      }
    }
    return label;
  };

  if (showOreSelection) {
    return (
      <div
        className="fixed z-50 p-2 rounded-xl shadow-2xl border overflow-hidden max-w-[300px]"
        style={{
          left: x,
          top: y,
          background: 'hsl(220, 25%, 12%)',
          borderColor: 'hsl(220, 15%, 30%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[10px] uppercase font-bold opacity-40 mb-2 px-2 flex items-center justify-between">
          <span>Select Target Ore</span>
          <button onClick={() => setShowOreSelection(false)} className="hover:text-white">✕</button>
        </div>
        <div className="grid grid-cols-5 gap-1.5 max-h-[250px] overflow-y-auto pr-2">
          {ORES.map(ore => {
            const meta = ORE_METADATA[ore];
            const isSelected = tile.building?.oreTarget === ore;
            return (
              <button
                key={ore}
                onClick={() => act(() => dispatch({ type: 'SET_ORE_TARGET', x: tile.x, y: tile.y, oreTarget: ore }))}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border ${
                  isSelected ? 'border-white bg-white/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
                }`}
                title={meta.name}
              >
                <div className="w-4 h-4 rounded-full" style={{ background: meta.color }} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const menuItems: { label: string; onClick: () => void; disabled?: boolean; secondary?: boolean }[] = [];

  if (!tile.building) {
    const minerCost = BUILDING_COSTS.miner[0];
    const canPlaceMiner = tile.oreType !== null;
    menuItems.push({
      label: canPlaceMiner ? `⛏️ Place Miner (${formatCost(minerCost)})` : '⛏️ Needs Ore Vein',
      onClick: () => act(() => dispatch({ type: 'PLACE_BUILDING', x: tile.x, y: tile.y, buildingType: 'miner' })),
      disabled: !canAfford(minerCost) || !canPlaceMiner,
    });

    const refCost = BUILDING_COSTS.refinery[0];
    menuItems.push({
      label: `🧪 Place Refinery (${formatCost(refCost)})`,
      onClick: () => act(() => dispatch({ type: 'PLACE_BUILDING', x: tile.x, y: tile.y, buildingType: 'refinery' })),
      disabled: !canAfford(refCost),
    });

    const foundCost = BUILDING_COSTS.foundry[0];
    menuItems.push({
      label: `🔥 Place Foundry (${formatCost(foundCost)})`,
      onClick: () => act(() => dispatch({ type: 'PLACE_BUILDING', x: tile.x, y: tile.y, buildingType: 'foundry' })),
      disabled: !canAfford(foundCost),
    });
  } else {
    const b = tile.building;

    if (b.level < 3) {
      const cost = UPGRADE_COSTS[b.type][b.level];
      menuItems.push({
        label: `⬆️ Upgrade to Lv.${b.level + 1} (${formatCost(cost)})`,
        onClick: () => act(() => dispatch({ type: 'UPGRADE_BUILDING', x: tile.x, y: tile.y })),
        disabled: !canAfford(cost),
      });
    }

    if (b.type !== 'miner') {
      const currentTarget = b.oreTarget ? ORE_METADATA[b.oreTarget as OreType].name : 'None';
      menuItems.push({
        label: `🔄 Target: ${currentTarget}`,
        onClick: () => setShowOreSelection(true),
      });
    }

    menuItems.push({
      label: b.active ? '⏸️ Pause' : '▶️ Resume',
      onClick: () => act(() => dispatch({ type: 'TOGGLE_BUILDING', x: tile.x, y: tile.y })),
      secondary: true,
    });

    menuItems.push({
      label: '🗑️ Disassemble',
      onClick: () => act(() => dispatch({ type: 'DISASSEMBLE', x: tile.x, y: tile.y })),
      secondary: true,
    });
  }

  return (
    <div
      className="fixed z-50 min-w-[220px] rounded-xl shadow-2xl border overflow-hidden p-1"
      style={{
        left: x,
        top: y,
        background: 'hsl(220, 25%, 12%)',
        borderColor: 'hsl(220, 15%, 25%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, i) => (
        <button
          key={i}
          className={`w-full text-left px-3 py-2.5 text-xs font-medium rounded-lg transition-all mb-0.5 last:mb-0 flex items-center justify-between ${
            item.secondary ? 'opacity-60 hover:opacity-100 hover:bg-white/5' : 'hover:bg-white/10'
          } disabled:opacity-20 disabled:cursor-not-allowed`}
          style={{ color: 'hsl(210, 30%, 90%)' }}
          onClick={item.onClick}
          disabled={item.disabled}
        >
          {item.label}
          {!item.secondary && !item.disabled && <span className="opacity-30">›</span>}
        </button>
      ))}
    </div>
  );
}
