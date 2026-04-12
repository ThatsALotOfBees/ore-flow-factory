import React, { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { useAuth } from '@/hooks/useAuth';
import { useSessionContext } from '@/game/multiplayer/SessionContext';
import { PlayerIndicator } from './PlayerIndicator';
import { SessionPanel } from './SessionPanel';

export function GameHeader() {
  const { state, saving, multiplayerRole } = useGame();
  const { user, signOut } = useAuth();
  const { members } = useSessionContext();
  const [showSession, setShowSession] = useState(false);

  return (
    <>
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
          {multiplayerRole !== 'solo' ? (
            <PlayerIndicator members={members} onClick={() => setShowSession(true)} />
          ) : (
            <button
              onClick={() => setShowSession(true)}
              className="text-xs px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-all font-medium"
            >
              Multiplayer
            </button>
          )}
          <span className="text-xs opacity-50 truncate max-w-[150px]">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-xs px-2 py-1 rounded border border-white/10 hover:bg-white/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
      {showSession && <SessionPanel onClose={() => setShowSession(false)} />}
    </>
  );
}
