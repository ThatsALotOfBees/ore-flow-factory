import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MultiplayerSession, SessionMember } from './types';

export function useSession(userId: string) {
  const [session, setSession] = useState<MultiplayerSession | null>(null);
  const [members, setMembers] = useState<SessionMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from('session_members')
      .select('*')
      .eq('session_id', sessionId);
    if (data) {
      setMembers(
        data.map((m: any) => ({
          userId: m.user_id,
          displayName: m.display_name,
          color: m.color,
          role: m.role,
          isOnline: true,
        })),
      );
    }
  }, []);

  const createSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the user's save id
      const { data: save } = await supabase
        .from('game_saves')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!save) {
        setError('No save found. Play for a moment to auto-save first.');
        return null;
      }

      const { data, error: rpcError } = await supabase.rpc('create_session', {
        p_save_id: save.id,
      });

      if (rpcError) throw rpcError;

      const result = data as any;
      const newSession: MultiplayerSession = {
        id: result.session_id,
        hostUserId: userId,
        saveId: save.id,
        inviteCode: result.invite_code,
        inviteExpiresAt: result.invite_expires_at,
        maxPlayers: result.max_players,
        status: result.status,
      };
      setSession(newSession);
      await fetchMembers(newSession.id);
      return newSession;
    } catch (e: any) {
      setError(e.message || 'Failed to create session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchMembers]);

  const joinSession = useCallback(async (inviteCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('join_session', {
        p_invite_code: inviteCode.toUpperCase(),
      });

      if (rpcError) throw rpcError;

      const result = data as any;
      const joined: MultiplayerSession = {
        id: result.session_id,
        hostUserId: result.host_user_id,
        saveId: '',
        inviteCode: result.invite_code,
        inviteExpiresAt: '',
        maxPlayers: result.max_players,
        status: result.status,
      };
      setSession(joined);
      await fetchMembers(joined.id);
      return { session: joined, saveData: result.save_data };
    } catch (e: any) {
      setError(e.message || 'Failed to join session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  const leaveSession = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      await supabase.rpc('leave_session', { p_session_id: session.id });
    } catch (e: any) {
      console.error('Leave session error:', e);
    }
    setSession(null);
    setMembers([]);
    setLoading(false);
  }, [session]);

  const kickPlayer = useCallback(async (targetUserId: string) => {
    if (!session) return;
    try {
      await supabase.rpc('kick_player', {
        p_session_id: session.id,
        p_user_id: targetUserId,
      });
      await fetchMembers(session.id);
    } catch (e: any) {
      console.error('Kick player error:', e);
    }
  }, [session, fetchMembers]);

  const regenerateInvite = useCallback(async () => {
    if (!session) return;
    try {
      const { data } = await supabase.rpc('regenerate_invite', {
        p_session_id: session.id,
      });
      if (data) {
        setSession(prev => prev ? { ...prev, inviteCode: data as string } : null);
      }
    } catch (e: any) {
      console.error('Regenerate invite error:', e);
    }
  }, [session]);

  return {
    session,
    members,
    loading,
    error,
    createSession,
    joinSession,
    leaveSession,
    kickPlayer,
    regenerateInvite,
    setSession,
    refreshMembers: session ? () => fetchMembers(session.id) : () => {},
  };
}
