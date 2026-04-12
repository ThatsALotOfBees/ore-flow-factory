import React from 'react';
import { SessionMember } from '@/game/multiplayer/types';

interface Props {
  members: SessionMember[];
  onClick: () => void;
}

export function PlayerIndicator({ members, onClick }: Props) {
  if (members.length === 0) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
      title="Multiplayer session"
    >
      <div className="flex -space-x-1">
        {members.slice(0, 4).map(m => (
          <div
            key={m.userId}
            className="w-4 h-4 rounded-full border border-black/40"
            style={{ background: m.color }}
            title={m.displayName}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold opacity-60">
        {members.length} online
      </span>
    </button>
  );
}
