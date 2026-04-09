import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { GameState } from './types';
import { GameAction, gameReducer, createInitialState } from './reducer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  saving: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);
  const [loaded, setLoaded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Track state in a ref so the save interval doesn't reset every second on TICK
  const stateRef = React.useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Load save from Supabase on mount
  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  // Auto-save every 15 seconds
  useEffect(() => {
    if (!user || !loaded) return;
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
  }, [user, loaded]);

  // Game tick every 1 second
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, saving }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
