import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from './useSession';
import { MultiplayerSession, SessionMember, MultiplayerRole } from './types';

interface SessionContextValue {
  session: MultiplayerSession | null;
  members: SessionMember[];
  role: MultiplayerRole;
  loading: boolean;
  error: string | null;
  createSession: () => Promise<MultiplayerSession | null>;
  joinSession: (code: string) => Promise<any>;
  leaveSession: () => Promise<void>;
  kickPlayer: (userId: string) => Promise<void>;
  regenerateInvite: () => Promise<void>;
}

const SessionCtx = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id || '';

  const {
    session,
    members,
    loading,
    error,
    createSession,
    joinSession: joinSessionRpc,
    leaveSession,
    kickPlayer,
    regenerateInvite,
  } = useSession(userId);

  const role: MultiplayerRole = !session
    ? 'solo'
    : session.hostUserId === userId
      ? 'host'
      : 'guest';

  const joinSession = useCallback(async (code: string) => {
    return joinSessionRpc(code);
  }, [joinSessionRpc]);

  return (
    <SessionCtx.Provider
      value={{
        session,
        members,
        role,
        loading,
        error,
        createSession,
        joinSession,
        leaveSession,
        kickPlayer,
        regenerateInvite,
      }}
    >
      {children}
    </SessionCtx.Provider>
  );
}

export function useSessionContext() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error('useSessionContext must be used within SessionProvider');
  return ctx;
}
