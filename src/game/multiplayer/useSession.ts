import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MultiplayerSession, SessionMember } from './types';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const PLAYER_COLORS = ['#34d399', '#f59e0b', '#38bdf8', '#a78bfa'];

export function useSession(userId: string) {
  const [session, setSession] = useState<MultiplayerSession | null>(null);
  const [members, setMembers] = useState<SessionMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (sessionId: string) => {
    const { data } = await (supabase as any)
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
      const { data: save } = await supabase
        .from('game_saves')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!save) {
        setError('No save found. Play for a moment to auto-save first.');
        return null;
      }

      const inviteCode = generateInviteCode();

      const { data: sessionRow, error: sessionErr } = await (supabase as any)
        .from('game_sessions')
        .insert({
          host_user_id: userId,
          save_id: save.id,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (sessionErr) throw sessionErr;

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', userId)
        .maybeSingle();

      await (supabase as any).from('session_members').insert({
        session_id: sessionRow.id,
        user_id: userId,
        role: 'host',
        display_name: profile?.display_name || 'Host',
        color: PLAYER_COLORS[0],
      });

      const newSession: MultiplayerSession = {
        id: sessionRow.id,
        hostUserId: userId,
        saveId: save.id,
        inviteCode: sessionRow.invite_code,
        inviteExpiresAt: sessionRow.invite_expires_at,
        maxPlayers: sessionRow.max_players,
        status: sessionRow.status,
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
      const { data: sessionRow, error: findErr } = await (supabase as any)
        .from('game_sessions')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .eq('status', 'active')
        .maybeSingle();

      if (findErr) throw findErr;
      if (!sessionRow) {
        setError('Invalid or expired invite code');
        return null;
      }

      if (sessionRow.host_user_id === userId) {
        setError('You are already the host of this session');
        return null;
      }

      const { count } = await (supabase as any)
        .from('session_members')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionRow.id);

      if ((count || 0) >= sessionRow.max_players) {
        setError('Session is full');
        return null;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', userId)
        .maybeSingle();

      const colorIndex = (count || 0) % PLAYER_COLORS.length;

      const { error: joinErr } = await (supabase as any).from('session_members').insert({
        session_id: sessionRow.id,
        user_id: userId,
        role: 'guest',
        display_name: profile?.display_name || 'Guest',
        color: PLAYER_COLORS[colorIndex],
      });

      if (joinErr) {
        if (joinErr.code === '23505') {
          setError('Already in this session');
        } else {
          throw joinErr;
        }
        return null;
      }

      const { data: saveRow } = await supabase
        .from('game_saves')
        .select('save_data')
        .eq('id', sessionRow.save_id)
        .maybeSingle();

      const joined: MultiplayerSession = {
        id: sessionRow.id,
        hostUserId: sessionRow.host_user_id,
        saveId: sessionRow.save_id,
        inviteCode: sessionRow.invite_code,
        inviteExpiresAt: sessionRow.invite_expires_at,
        maxPlayers: sessionRow.max_players,
        status: sessionRow.status,
      };
      setSession(joined);
      await fetchMembers(joined.id);
      return { session: joined, saveData: saveRow?.save_data };
    } catch (e: any) {
      setError(e.message || 'Failed to join session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchMembers]);

  const leaveSession = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      await (supabase as any)
        .from('session_members')
        .delete()
        .eq('session_id', session.id)
        .eq('user_id', userId);

      if (session.hostUserId === userId) {
        await (supabase as any)
          .from('game_sessions')
          .update({ status: 'closed' })
          .eq('id', session.id);
      }
    } catch (e: any) {
      console.error('Leave session error:', e);
    }
    setSession(null);
    setMembers([]);
    setLoading(false);
  }, [session, userId]);

  const kickPlayer = useCallback(async (targetUserId: string) => {
    if (!session || session.hostUserId !== userId) return;
    try {
      await (supabase as any)
        .from('session_members')
        .delete()
        .eq('session_id', session.id)
        .eq('user_id', targetUserId)
        .eq('role', 'guest');
      await fetchMembers(session.id);
    } catch (e: any) {
      console.error('Kick player error:', e);
    }
  }, [session, userId, fetchMembers]);

  const regenerateInvite = useCallback(async () => {
    if (!session || session.hostUserId !== userId) return;
    try {
      const newCode = generateInviteCode();
      const { error: updateErr } = await (supabase as any)
        .from('game_sessions')
        .update({
          invite_code: newCode,
          invite_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', session.id);
      if (!updateErr) {
        setSession(prev => prev ? { ...prev, inviteCode: newCode } : null);
      }
    } catch (e: any) {
      console.error('Regenerate invite error:', e);
    }
  }, [session, userId]);

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
