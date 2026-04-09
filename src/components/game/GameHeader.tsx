import React from 'react';
import { useGame } from '@/game/GameContext';
import { useAuth } from '@/hooks/useAuth';

export function GameHeader() {
  const { state, saving } = useGame();
  const { user, signOut } = useAuth();

  return (
    <div
      className="h-10 flex items-center justify-between px-4 border-b shrink-0 z-30"
      style={{
        background: 'hsl(220, 25%, 10%)',
        borderColor: 'hsl(220, 15%, 20%)',
        color: 'hsl(210, 30%, 90%)',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="font-bold text-sm">⛏️ Grid Miner</span>
        <span className="text-amber-400 font-bold text-sm">💰 ${state.currency.toFixed(2)}</span>
        {saving && <span className="text-[10px] text-emerald-400 animate-pulse">Saving...</span>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs opacity-50 truncate max-w-[150px]">{user?.email}</span>
        <button
          onClick={signOut}
          className="text-xs px-2 py-1 rounded border border-white/10 hover:bg-white/10 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
