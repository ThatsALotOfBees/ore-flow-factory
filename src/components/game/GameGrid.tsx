import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useGame } from '@/game/GameContext';
import { Tile, GRID_SIZE, MINER_BASE_RATE } from '@/game/types';
import { TileContextMenu } from './TileContextMenu';

const TILE_SIZE = 40;

export function GameGrid() {
  const { state } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredTile, setHoveredTile] = useState<Tile | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ tile: Tile; x: number; y: number } | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setPanStart(pan);
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      setPan({
        x: panStart.x + (e.clientX - dragStart.x),
        y: panStart.y + (e.clientY - dragStart.y),
      });
    }
  }, [dragging, dragStart, panStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const handleTileHover = useCallback((e: React.MouseEvent, tile: Tile) => {
    setHoveredTile(tile);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, tile: Tile) => {
    e.preventDefault();
    setContextMenu({ tile, x: e.clientX, y: e.clientY });
  }, []);

  const getTileColor = (tile: Tile): string => {
    if (tile.building) {
      switch (tile.building.type) {
        case 'miner': return `hsl(45, 80%, ${30 + tile.building.level * 10}%)`;
        case 'refinery': return `hsl(200, 70%, ${30 + tile.building.level * 10}%)`;
        case 'foundry': return `hsl(0, 70%, ${30 + tile.building.level * 10}%)`;
      }
    }
    if (tile.oreType === 'iron') {
      return `hsl(25, ${40 + tile.purity * 0.4}%, ${20 + tile.purity * 0.25}%)`;
    }
    return `hsl(30, ${50 + tile.purity * 0.4}%, ${25 + tile.purity * 0.3}%)`;
  };

  const getBuildingIcon = (tile: Tile): string => {
    if (!tile.building) return '';
    switch (tile.building.type) {
      case 'miner': return '⛏️';
      case 'refinery': return '🧪';
      case 'foundry': return '🔥';
    }
  };

  const gridWidth = GRID_SIZE * TILE_SIZE;
  const gridHeight = GRID_SIZE * TILE_SIZE;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative select-none"
      style={{ background: 'hsl(220, 20%, 10%)' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { setDragging(false); setHoveredTile(null); }}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: gridWidth,
          height: gridHeight,
          position: 'absolute',
          left: '50%',
          top: '50%',
          marginLeft: -gridWidth / 2,
          marginTop: -gridHeight / 2,
        }}
      >
        {state.grid.map((row, y) =>
          row.map((tile, x) => (
            <div
              key={`${x}-${y}`}
              className="absolute border border-white/10 flex items-center justify-center text-xs transition-colors"
              style={{
                left: x * TILE_SIZE,
                top: y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                backgroundColor: getTileColor(tile),
              }}
              onMouseEnter={(e) => handleTileHover(e, tile)}
              onMouseMove={(e) => handleTileHover(e, tile)}
              onMouseLeave={() => setHoveredTile(null)}
              onContextMenu={(e) => handleContextMenu(e, tile)}
            >
              {tile.building && (
                <span className="text-lg leading-none drop-shadow-md">
                  {getBuildingIcon(tile)}
                  {tile.building.level > 1 && (
                    <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold text-white bg-black/60 rounded px-0.5">
                      {tile.building.level}
                    </span>
                  )}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Tooltip */}
      {hoveredTile && !contextMenu && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg text-xs shadow-lg border"
          style={{
            left: tooltipPos.x + 16,
            top: tooltipPos.y + 16,
            background: 'hsl(220, 25%, 14%)',
            borderColor: 'hsl(220, 15%, 25%)',
            color: 'hsl(210, 30%, 90%)',
          }}
        >
          <div className="font-bold capitalize">{hoveredTile.oreType} Ore</div>
          <div>Purity: {hoveredTile.purity}%</div>
          <div>Est. yield: {((MINER_BASE_RATE * hoveredTile.purity) / 100).toFixed(1)}/hr</div>
          {hoveredTile.building && (
            <div className="mt-1 pt-1 border-t border-white/10">
              <span className="capitalize">{hoveredTile.building.type}</span> Lv.{hoveredTile.building.level}
              {!hoveredTile.building.active && <span className="text-red-400 ml-1">(OFF)</span>}
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <TileContextMenu
          tile={contextMenu.tile}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
