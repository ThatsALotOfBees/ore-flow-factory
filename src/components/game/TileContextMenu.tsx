import React from 'react';
import { useGame } from '@/game/GameContext';
import { Tile, BUILDING_COSTS, UPGRADE_COSTS } from '@/game/types';

interface Props {
  tile: Tile;
  x: number;
  y: number;
  onClose: () => void;
}

export function TileContextMenu({ tile, x, y, onClose }: Props) {
  const { state, dispatch } = useGame();

  const act = (fn: () => void) => {
    fn();
    onClose();
  };

  const menuItems: { label: string; onClick: () => void; disabled?: boolean }[] = [];

  if (!tile.building) {
    // Empty tile
    const minerCost = BUILDING_COSTS.miner[0];
    menuItems.push({
      label: `⛏️ Place Miner ($${minerCost})`,
      onClick: () => act(() => dispatch({ type: 'PLACE_BUILDING', x: tile.x, y: tile.y, buildingType: 'miner' })),
      disabled: state.currency < minerCost,
    });

    const refCost = BUILDING_COSTS.refinery[0];
    menuItems.push({
      label: `🧪 Place Refinery ($${refCost})`,
      onClick: () => act(() => dispatch({ type: 'PLACE_BUILDING', x: tile.x, y: tile.y, buildingType: 'refinery' })),
      disabled: state.currency < refCost,
    });

    const foundCost = BUILDING_COSTS.foundry[0];
    menuItems.push({
      label: `🔥 Place Foundry ($${foundCost})`,
      onClick: () => act(() => dispatch({ type: 'PLACE_BUILDING', x: tile.x, y: tile.y, buildingType: 'foundry' })),
      disabled: state.currency < foundCost,
    });
  } else {
    const b = tile.building;

    if (b.level < 3) {
      const cost = UPGRADE_COSTS[b.type][b.level];
      menuItems.push({
        label: `⬆️ Upgrade to Lv.${b.level + 1} ($${cost})`,
        onClick: () => act(() => dispatch({ type: 'UPGRADE_BUILDING', x: tile.x, y: tile.y })),
        disabled: state.currency < cost,
      });
    }

    if (b.type !== 'miner') {
      menuItems.push({
        label: `🔄 Switch to ${b.oreTarget === 'iron' ? 'Copper' : 'Iron'}`,
        onClick: () => act(() => dispatch({
          type: 'SET_ORE_TARGET', x: tile.x, y: tile.y,
          oreTarget: b.oreTarget === 'iron' ? 'copper' : 'iron',
        })),
      });
    }

    menuItems.push({
      label: b.active ? '⏸️ Pause' : '▶️ Resume',
      onClick: () => act(() => dispatch({ type: 'TOGGLE_BUILDING', x: tile.x, y: tile.y })),
    });

    menuItems.push({
      label: '🗑️ Disassemble',
      onClick: () => act(() => dispatch({ type: 'DISASSEMBLE', x: tile.x, y: tile.y })),
    });
  }

  return (
    <div
      className="fixed z-50 min-w-[180px] rounded-lg shadow-xl border overflow-hidden"
      style={{
        left: x,
        top: y,
        background: 'hsl(220, 25%, 14%)',
        borderColor: 'hsl(220, 15%, 25%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, i) => (
        <button
          key={i}
          className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ color: 'hsl(210, 30%, 90%)' }}
          onClick={item.onClick}
          disabled={item.disabled}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
