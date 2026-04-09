import React, { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { ResourceKey } from '@/game/types';
import { ALLOY_RECIPES } from '@/game/alloys';

export function AlloySmelterPanel() {
  const { state, dispatch } = useGame();
  const [search, setSearch] = useState('');

  const filteredAlloys = ALLOY_RECIPES.filter(alloy => 
    alloy.name.toLowerCase().includes(search.toLowerCase()) ||
    Object.keys(alloy.inputs).some(k => k.replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase()))
  );

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-300 border-gray-500/30';
      case 'Uncommon': return 'text-green-400 border-green-500/30';
      case 'Rare': return 'text-blue-400 border-blue-500/30';
      case 'Very Rare': return 'text-purple-400 border-purple-500/30';
      case 'Ultra-Rare': return 'text-pink-400 border-pink-500/30';
      case 'Extremely Rare': return 'text-red-400 border-red-500/30';
      case 'Mythical': return 'text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(251,191,36,0.2)] animate-pulse';
      case 'Legendary': return 'text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] filter contrast-125';
      default: return 'text-white border-white/10';
    }
  };

  const smeltAlloy = (alloyId: string, inputs: Record<string, number>, maxCraftable: number) => {
    if (maxCraftable < 1) return;
    dispatch({ type: 'SMELT_ALLOY', inputs, output: alloyId, outputAmount: 1 });
  };

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-xl p-3 border border-white/5">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <div className="text-xs uppercase tracking-wider text-amber-500/80 font-black flex items-center gap-2">
            <span className="text-lg">🌋</span> Alloy Smelter
          </div>
          <div className="text-[10px] opacity-50 mt-0.5">Combine base ingots into advanced structural properties.</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <input 
          type="text" 
          placeholder="Search alloys or ingredients..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-amber-500/50 transition-all font-medium"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-2">
        {filteredAlloys.length === 0 && (
          <div className="text-center py-8 text-xs opacity-40 italic">No alloys match your search criteria.</div>
        )}
        {filteredAlloys.map(alloy => {
          let maxCraftable = Infinity;
          for (const [res, amt] of Object.entries(alloy.inputs)) {
            const has = state.inventory[res as ResourceKey] || 0;
            maxCraftable = Math.min(Math.floor(has / (amt as number)), maxCraftable);
          }

          return (
            <div key={alloy.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-gradient-to-br from-white/5 to-transparent gap-3 ${getRarityColor(alloy.rarity)}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-xs font-black uppercase tracking-widest truncate">{alloy.name}</div>
                  <div className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 border border-current opacity-80 uppercase tracking-tighter">
                    {alloy.rarity}
                  </div>
                </div>
                <div className="text-[10px] opacity-60 mb-2 leading-snug">{alloy.description}</div>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(alloy.inputs).map(([res, amt]) => {
                    const has = Math.floor(state.inventory[res as ResourceKey] || 0);
                    const canAfford = has >= (amt as number);
                    return (
                      <span key={res} className={`px-1.5 py-0.5 rounded ${canAfford ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                        {canAfford ? '✓' : '✗'} {amt}x {res.replace(/_/g, ' ')} ({has})
                      </span>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => smeltAlloy(alloy.id, alloy.inputs as Record<string, number>, maxCraftable)}
                disabled={maxCraftable < 1}
                className="px-4 py-2 rounded font-bold text-xs uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Smelt 1x
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
