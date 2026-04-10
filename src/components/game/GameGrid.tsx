import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useGame } from '@/game/GameContext';
import { Tile, GRID_SIZE, MINER_BASE_RATE, ORE_METADATA } from '@/game/types';
import { TileContextMenu } from './TileContextMenu';

const TILE_SIZE = 40;

const TileItem = React.memo(({ 
  tile, 
  onHover, 
  onContextMenu,
  onClick,
  isGhost
}: { 
  tile: Tile; 
  onHover: (e: React.MouseEvent, tile: Tile) => void;
  onContextMenu: (e: React.MouseEvent, tile: Tile) => void;
  onClick: (e: React.MouseEvent, tile: Tile) => void;
  isGhost?: boolean;
}) => {
  const getTileColor = (tile: Tile): string => {
    if (tile.building) {
      switch (tile.building.type) {
        case 'miner': return `hsl(45, 80%, ${30 + tile.building.level * 10}%)`;
        case 'refinery': return `hsl(200, 70%, ${30 + tile.building.level * 10}%)`;
        case 'foundry': return `hsl(0, 70%, ${30 + tile.building.level * 10}%)`;
      }
    }
    
    if (tile.oreType) {
      const meta = ORE_METADATA[tile.oreType];
      if (!meta) return '#000';
      
      // If mythical, we use the CSS animation color, but provide a fallback base
      if (meta.rarity === 'Mythical') return '#1a0000';

      return meta.color;
    }

    // Deep, textured dirt
    const noise = (tile.x * 7 + tile.y * 13) % 4;
    return `hsl(220, 15%, ${10 + noise}%)`;
  };

  const getBuildingIcon = (tile: Tile): string => {
    if (!tile.building) return '';
    switch (tile.building.type) {
      case 'miner': return '⛏️';
      case 'refinery': return '🧪';
      case 'foundry': return '🔥';
      case 'machine': return '⚙️';
    }
  };

  return (
    <div
      className={`absolute border border-white/5 flex items-center justify-center text-xs transition-colors ${
        tile.oreType && ORE_METADATA[tile.oreType]?.rarity === 'Mythical' ? 'mythical-ore' : ''
      } ${isGhost ? 'opacity-50 pointer-events-none scale-90' : ''}`}
      style={{
        left: tile.x * TILE_SIZE,
        top: tile.y * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
        backgroundColor: isGhost ? 'rgba(255, 255, 255, 0.2)' : getTileColor(tile),
      }}
      onMouseEnter={(e) => onHover(e, tile)}
      onMouseMove={(e) => onHover(e, tile)}
      onContextMenu={(e) => onContextMenu(e, tile)}
      onClick={(e) => onClick(e, tile)}
    >
      {tile.building && (
        <span className="text-lg leading-none drop-shadow-md pointer-events-none">
          {getBuildingIcon(tile)}
          {tile.building.level > 1 && (
            <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold text-white bg-black/60 rounded px-0.5">
              {tile.building.level}
            </span>
          )}
        </span>
      )}
    </div>
  );
});

TileItem.displayName = 'TileItem';

export function GameGrid() {
  const { state, dispatch } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredTile, setHoveredTile] = useState<Tile | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ tile: Tile; x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Use ResizeObserver for more reliable dimension tracking
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.1, Math.min(3, z - e.deltaY * 0.001)));
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

  const handleTileClick = useCallback((e: React.MouseEvent, tile: Tile) => {
    e.preventDefault();
    if (dragging) return;
    
    // Check if we have a machine selected to place
    if (state.selectedMachineId) {
      if (!tile.building && !state.activeMachines.some(m => m.x === tile.x && m.y === tile.y)) {
        dispatch({ type: 'PLACE_MACHINE', x: tile.x, y: tile.y, machineId: state.selectedMachineId });
      }
    }
  }, [dragging, state.selectedMachineId, state.activeMachines, dispatch]);

  const handleContextMenu = useCallback((e: React.MouseEvent, tile: Tile) => {
    e.preventDefault();
    setContextMenu({ tile, x: e.clientX, y: e.clientY });
  }, []);

  const gridWidth = GRID_SIZE * TILE_SIZE;
  const gridHeight = GRID_SIZE * TILE_SIZE;

  // Viewport calculation
  const visibleTiles = useMemo(() => {
    // Fallback to window dimensions if container not yet measured
    const width = dimensions.width || (typeof window !== 'undefined' ? window.innerWidth : 1000);
    const height = dimensions.height || (typeof window !== 'undefined' ? window.innerHeight : 800);

    if (!state.grid || !state.grid[0]) return [];

    const centerX = width / 2;
    const centerY = height / 2;
    
    // The screen position of the grid's (0,0) corner
    const screenX0 = centerX - gridWidth / 2 + pan.x;
    const screenY0 = centerY - gridHeight / 2 + pan.y;

    // Inverse transform of screen corners back to grid indices
    // x = (screenX - screenX0) / (TILE_SIZE * zoom)
    const x0 = Math.floor(-screenX0 / (TILE_SIZE * zoom));
    const y0 = Math.floor(-screenY0 / (TILE_SIZE * zoom));
    const x1 = Math.ceil((width - screenX0) / (TILE_SIZE * zoom));
    const y1 = Math.ceil((height - screenY0) / (TILE_SIZE * zoom));

    const minX = Math.max(0, x0);
    const maxX = Math.min(GRID_SIZE - 1, x1);
    const minY = Math.max(0, y0);
    const maxY = Math.min(GRID_SIZE - 1, y1);

    const tiles: Tile[] = [];
    for (let y = minY; y <= maxY; y++) {
      const row = state.grid[y];
      if (!row) continue;
      for (let x = minX; x <= maxX; x++) {
        const tile = row[x];
        if (tile) {
          tiles.push(tile);
        }
      }
    }
    return tiles;
  }, [state.grid, dimensions, pan, zoom, gridWidth, gridHeight]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative select-none"
      style={{ background: 'hsl(220, 20%, 8%)' }}
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
        {visibleTiles.map((tile) => {
          const isGhost = hoveredTile?.x === tile.x && hoveredTile?.y === tile.y && state.selectedMachineId !== null && !tile.building;
          
          return (
            <React.Fragment key={`${tile.x}-${tile.y}`}>
              <TileItem
                tile={tile}
                onHover={handleTileHover}
                onContextMenu={handleContextMenu}
                onClick={handleTileClick}
              />
              {isGhost && (
                 <TileItem
                  tile={{ ...tile, building: { type: 'machine', level: 1, active: true } as any }}
                  isGhost={true}
                  onHover={() => {}}
                  onContextMenu={() => {}}
                  onClick={() => {}}
                 />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredTile && !contextMenu && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg text-xs shadow-lg border backdrop-blur-md"
          style={{
            left: tooltipPos.x + 16,
            top: tooltipPos.y + 16,
            background: 'hsla(220, 25%, 14%, 0.9)',
            borderColor: 'hsl(220, 15%, 25%)',
            color: 'hsl(210, 30%, 90%)',
          }}
        >
          {hoveredTile.oreType ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="font-bold flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: ORE_METADATA[hoveredTile.oreType].color }} />
                  {ORE_METADATA[hoveredTile.oreType].name}
                </div>
                <div className="text-[10px] opacity-60 font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase tracking-tighter">
                  {ORE_METADATA[hoveredTile.oreType].rarity}
                </div>
              </div>
              <div className="text-[10px] opacity-40 mt-1 italic max-w-[180px]">
                "{ORE_METADATA[hoveredTile.oreType].description}"
              </div>
              <div className="mt-2 text-[11px] flex items-center justify-between">
                <span className="opacity-50 text-[10px]">Purity</span>
                <span className="font-mono font-bold text-amber-400">{hoveredTile.purity}%</span>
              </div>
              <div className="text-[11px] flex items-center justify-between">
                <span className="opacity-50 text-[10px]">Yield</span>
                <span className="font-mono">{((MINER_BASE_RATE * hoveredTile.purity) / 100).toFixed(1)}/hr</span>
              </div>
            </>
          ) : (
            <div className="font-bold text-white/40 italic">Empty Space</div>
          )}
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
