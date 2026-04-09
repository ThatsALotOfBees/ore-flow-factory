

## Grid Mining & Processing Game MVP

### Core Architecture
A single-page React game with a tick-based game loop (1s interval), all state managed via React context/useReducer. No backend needed — everything runs client-side with localStorage save/load.

### What We'll Build

**1. Game Grid (20×20)**
- Seed-based random ore distribution (iron/copper) with purity 30-100%
- Canvas-based or div-based grid with color-coded tiles (brown=iron, orange=copper, intensity=purity)
- Pan & zoom via mouse wheel + drag, scaling the world not the UI

**2. Tile Interaction**
- Hover tooltip showing ore type, purity %, estimated yield/hr
- Right-click context menu with actions based on tile contents (empty ore tile → Place Miner, building tile → Upgrade/Disassemble/Stats, etc.)

**3. Buildings (3 types)**
- **Miner**: Placed on ore tiles, produces raw ore at `10 × (purity/100)` per hour, levels 1-3
- **Refinery**: Placed on any empty tile, auto-processes raw ore → refined ore at 1.2x/1.4x/1.6x multiplier per level
- **Foundry**: Placed on any empty tile, converts 10 refined ore → 5 ingots, speed scales with level

**4. Inventory & Economy**
- Global inventory panel (always visible) showing all 6 resource types
- Currency counter at top
- Sell panel with fixed prices (ore $1, refined $1.2, ingot $4)
- Building costs deducted from currency

**5. Game Loop**
- 1-second tick updates all building production
- Miners deposit raw ore → Refineries auto-process → Foundries auto-convert
- Real-time inventory updates

**6. UI Layout**
- Left: Fixed sidebar with inventory, currency, sell buttons
- Center: Zoomable/pannable game grid
- Floating: Hover tooltip, right-click context menu, upgrade dialogs

**7. Upgrade System**
- Each building upgradable Level 1→3 via context menu
- Costs increase per level
- Visual indicator of building level on tile

### Visual Style
Clean, minimal 2D with a muted color palette. Grid tiles with subtle borders, building icons/emojis on placed structures, smooth hover/zoom transitions.

