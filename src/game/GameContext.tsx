import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { GameState } from './types';
import { GameAction, gameReducer, createInitialState } from './reducer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MultiplayerSession, MultiplayerRole } from './multiplayer/types';
import { useMultiplayerSync } from './multiplayer/useMultiplayerSync';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  saving: boolean;
  multiplayerRole: MultiplayerRole;
  broadcastKick: (userId: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: React.ReactNode;
  session: MultiplayerSession | null;
  role: MultiplayerRole;
}

export function GameProvider({ children, session, role }: GameProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);
  const [loaded, setLoaded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const stateRef = React.useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const { multiplayerDispatch, broadcastTickDelta, broadcastKick } = useMultiplayerSync({
    dispatch,
    stateRef,
    session,
    role,
    userId: user?.id || '',
  });

  // Load save from Supabase on mount (solo or host only — guests get state via sync)
  useEffect(() => {
    if (!user) return;
    if (role === 'guest') {
      setLoaded(true);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('game_saves')
        .select('save_data')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.save_data) {
        dispatch({ type: 'LOAD', state: data.save_data as unknown as GameState });
      }
      setLoaded(true);
    })();
  }, [user, role]);

  // Auto-save (host and solo only — guests don't save)
  useEffect(() => {
    if (!user || !loaded || role === 'guest') return;
    const id = setInterval(async () => {
      setSaving(true);
      const { error } = await supabase
        .from('game_saves')
        .upsert({ user_id: user.id, save_data: stateRef.current as any }, { onConflict: 'user_id' });

      if (error) {
        console.error("Auto-Save Error:", error);
        toast({ title: 'Save Failed', description: error.message, variant: 'destructive' });
      }
      setSaving(false);
    }, 3000);
    return () => clearInterval(id);
  }, [user, loaded, role]);

  // Game tick (host and solo only — guests receive tick_delta via broadcast)
  useEffect(() => {
    if (role === 'guest') return;
    const id = setInterval(() => {
      dispatch({ type: 'TICK' });
      broadcastTickDelta();
    }, 1000);
    return () => clearInterval(id);
  }, [role, broadcastTickDelta]);

  return (
    <GameContext.Provider value={{
      state,
      dispatch: multiplayerDispatch,
      saving,
      multiplayerRole: role,
      broadcastKick,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
