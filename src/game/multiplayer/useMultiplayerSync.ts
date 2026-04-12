import { useEffect, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { GameState, Inventory } from '../types';
import { GameAction } from '../reducer';
import { MultiplayerRole, MultiplayerSession, BroadcastAction } from './types';
import { channelName, HEARTBEAT_INTERVAL_MS } from './constants';

const HOST_ONLY_ACTIONS = new Set(['RESET', 'REBIRTH']);

interface UseMultiplayerSyncOptions {
  dispatch: React.Dispatch<GameAction>;
  stateRef: React.MutableRefObject<GameState>;
  session: MultiplayerSession | null;
  role: MultiplayerRole;
  userId: string;
}

export function useMultiplayerSync({
  dispatch,
  stateRef,
  session,
  role,
  userId,
}: UseMultiplayerSyncOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const seqRef = useRef(0);
  const appliedSeqsRef = useRef(new Set<number>());

  // Clean up channel on unmount or session change
  useEffect(() => {
    if (!session || role === 'solo') {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const channel = supabase.channel(channelName(session.id), {
      config: { broadcast: { self: false } },
    });

    if (role === 'host') {
      setupHostListeners(channel);
    } else {
      setupGuestListeners(channel);
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && role === 'guest') {
        channel.send({
          type: 'broadcast',
          event: 'request_sync',
          payload: { userId },
        });
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [session?.id, role]);

  // Host: heartbeat with state every N seconds
  useEffect(() => {
    if (role !== 'host' || !channelRef.current) return;
    const id = setInterval(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'state_sync',
        payload: { state: stateRef.current },
      });
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [role, session?.id]);

  function setupHostListeners(channel: RealtimeChannel) {
    // Guest requests an action
    channel.on('broadcast', { event: 'action' }, ({ payload }) => {
      const { action, senderId, seq } = payload as BroadcastAction;
      // Apply the guest's action locally
      dispatch(action);
      // Re-broadcast as confirmed
      channel.send({
        type: 'broadcast',
        event: 'action_applied',
        payload: { action, senderId, seq },
      });
    });

    // Guest requests full state sync
    channel.on('broadcast', { event: 'request_sync' }, () => {
      channel.send({
        type: 'broadcast',
        event: 'state_sync',
        payload: { state: stateRef.current },
      });
    });
  }

  function setupGuestListeners(channel: RealtimeChannel) {
    // Host confirmed an action
    channel.on('broadcast', { event: 'action_applied' }, ({ payload }) => {
      const { action, senderId, seq } = payload as BroadcastAction;
      // If this was our own action and we already applied it optimistically, skip
      if (senderId === userId && appliedSeqsRef.current.has(seq)) {
        appliedSeqsRef.current.delete(seq);
        return;
      }
      // Apply someone else's action (or an action we didn't optimistically apply)
      dispatch(action);
    });

    // Host sends tick results
    channel.on('broadcast', { event: 'tick_delta' }, ({ payload }) => {
      const { inventory, tickCount } = payload as { inventory: Inventory; tickCount: number };
      dispatch({ type: 'TICK_SYNC', inventory, tickCount });
    });

    // Full state sync (join, reconnect, heartbeat)
    channel.on('broadcast', { event: 'state_sync' }, ({ payload }) => {
      const { state } = payload as { state: GameState };
      dispatch({ type: 'LOAD', state });
    });

    // Kicked
    channel.on('broadcast', { event: 'player_kicked' }, ({ payload }) => {
      if (payload.userId === userId) {
        supabase.removeChannel(channel);
        channelRef.current = null;
      }
    });
  }

  // Broadcast tick delta after host TICK (called from GameContext)
  const broadcastTickDelta = useCallback(() => {
    if (role !== 'host' || !channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'tick_delta',
      payload: {
        inventory: stateRef.current.inventory,
        tickCount: stateRef.current.tickCount,
      },
    });
  }, [role]);

  // Multiplayer-aware dispatch wrapper
  const multiplayerDispatch = useCallback(
    (action: GameAction) => {
      // Solo mode: pass through directly
      if (role === 'solo' || !channelRef.current) {
        dispatch(action);
        return;
      }

      // Block guest-restricted actions
      if (role === 'guest' && HOST_ONLY_ACTIONS.has(action.type)) {
        return;
      }

      if (role === 'host') {
        // Host: apply locally and broadcast to guests
        dispatch(action);
        if (action.type !== 'TICK' && action.type !== 'TICK_SYNC') {
          channelRef.current.send({
            type: 'broadcast',
            event: 'action_applied',
            payload: { action, senderId: userId, seq: ++seqRef.current },
          });
        }
      } else {
        // Guest: apply optimistically and send to host for confirmation
        const seq = ++seqRef.current;
        appliedSeqsRef.current.add(seq);
        dispatch(action);
        channelRef.current.send({
          type: 'broadcast',
          event: 'action',
          payload: { action, senderId: userId, seq },
        });
      }
    },
    [role, userId, dispatch],
  );

  // Broadcast a kick event
  const broadcastKick = useCallback(
    (targetUserId: string) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'player_kicked',
        payload: { userId: targetUserId },
      });
    },
    [],
  );

  return {
    multiplayerDispatch,
    broadcastTickDelta,
    broadcastKick,
    channel: channelRef,
  };
}
