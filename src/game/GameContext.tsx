import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { GameState } from './types';
import { GameAction, gameReducer, createInitialState } from './reducer';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

const SAVE_KEY = 'grid-mining-save';

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw) as GameState;
  } catch { /* ignore */ }
  return null;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    return loadSave() || createInitialState();
  });

  // Auto-save every 10 seconds
  useEffect(() => {
    const id = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    }, 10000);
    return () => clearInterval(id);
  }, [state]);

  // Game tick every 1 second
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
