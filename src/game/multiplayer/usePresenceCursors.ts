import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { CursorPosition, MultiplayerSession, MultiplayerRole } from './types';
import { channelName, CURSOR_THROTTLE_MS } from './constants';

interface UsePresenceCursorsOptions {
  session: MultiplayerSession | null;
  role: MultiplayerRole;
  userId: string;
  displayName: string;
  color: string;
}

export function usePresenceCursors({
  session,
  role,
  userId,
  displayName,
  color,
}: UsePresenceCursorsOptions) {
  const [remoteCursors, setRemoteCursors] = useState<CursorPosition[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastTrackRef = useRef(0);

  useEffect(() => {
    if (!session || role === 'solo') {
      setRemoteCursors([]);
      return;
    }

    const presenceChannel = supabase.channel(`${channelName(session.id)}:presence`, {
      config: { presence: { key: userId } },
    });

    presenceChannel.on('presence', { event: 'sync' }, () => {
      const presenceState = presenceChannel.presenceState();
      const cursors: CursorPosition[] = [];
      for (const [key, entries] of Object.entries(presenceState)) {
        if (key === userId) continue;
        const latest = (entries as any[])[0];
        if (latest?.gridX !== undefined) {
          cursors.push({
            userId: key,
            displayName: latest.displayName || 'Player',
            color: latest.color || '#ffffff',
            gridX: latest.gridX,
            gridY: latest.gridY,
          });
        }
      }
      setRemoteCursors(cursors);
    });

    presenceChannel.subscribe();
    channelRef.current = presenceChannel;

    return () => {
      supabase.removeChannel(presenceChannel);
      channelRef.current = null;
      setRemoteCursors([]);
    };
  }, [session?.id, role, userId]);

  const trackCursor = useCallback(
    (gridX: number, gridY: number) => {
      const now = Date.now();
      if (now - lastTrackRef.current < CURSOR_THROTTLE_MS) return;
      lastTrackRef.current = now;

      channelRef.current?.track({
        userId,
        displayName,
        color,
        gridX,
        gridY,
      });
    },
    [userId, displayName, color],
  );

  return { remoteCursors, trackCursor };
}
