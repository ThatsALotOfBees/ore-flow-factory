import React, { useState } from 'react';
import { useSessionContext } from '@/game/multiplayer/SessionContext';
import { useGame } from '@/game/GameContext';

export function SessionPanel({ onClose }: { onClose: () => void }) {
  const { session, members, role, loading, error, createSession, joinSession, leaveSession, kickPlayer, regenerateInvite } = useSessionContext();
  const { broadcastKick } = useGame();
  const [inviteInput, setInviteInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (session?.inviteCode) {
      navigator.clipboard.writeText(session.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKick = async (userId: string) => {
    await kickPlayer(userId);
    broadcastKick(userId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border shadow-2xl p-6"
        style={{
          background: 'hsl(220, 25%, 12%)',
          borderColor: 'hsl(220, 15%, 25%)',
          color: 'hsl(210, 30%, 90%)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Multiplayer</h2>
          <button onClick={onClose} className="opacity-40 hover:opacity-80 text-lg">✕</button>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Solo mode: create or join */}
        {!session && (
          <div className="space-y-4">
            <button
              onClick={createSession}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-30 transition-all"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] uppercase opacity-30 font-bold">or join</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inviteInput}
                onChange={e => setInviteInput(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="INVITE CODE"
                maxLength={6}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono font-bold text-center tracking-[0.3em] uppercase placeholder-white/20 outline-none focus:border-amber-500/50 transition-all"
              />
              <button
                onClick={() => joinSession(inviteInput)}
                disabled={loading || inviteInput.length !== 6}
                className="px-5 py-3 rounded-xl font-bold text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-30 transition-all"
              >
                Join
              </button>
            </div>
          </div>
        )}

        {/* In a session */}
        {session && (
          <div className="space-y-4">
            {/* Invite code (host only) */}
            {role === 'host' && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[9px] uppercase font-bold opacity-30 mb-2">Invite Code</div>
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-2xl font-mono font-bold tracking-[0.4em] text-amber-400 text-center">
                    {session.inviteCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={regenerateInvite}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    title="Generate new code"
                  >
                    New
                  </button>
                </div>
              </div>
            )}

            {/* Player list */}
            <div>
              <div className="text-[9px] uppercase font-bold opacity-30 mb-2">
                Players ({members.length}/{session.maxPlayers})
              </div>
              <div className="space-y-1.5">
                {members.map(m => (
                  <div
                    key={m.userId}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ background: m.color }} />
                    <span className="flex-1 text-xs font-medium">{m.displayName}</span>
                    <span className="text-[9px] uppercase opacity-30 font-bold">
                      {m.role === 'host' ? 'Host' : 'Guest'}
                    </span>
                    {role === 'host' && m.role === 'guest' && (
                      <button
                        onClick={() => handleKick(m.userId)}
                        className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                      >
                        Kick
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Leave / Close */}
            <button
              onClick={leaveSession}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-30"
            >
              {role === 'host' ? 'Close Session' : 'Leave Session'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
