import React from 'react';
import { CursorPosition } from '@/game/multiplayer/types';

interface Props {
  cursor: CursorPosition;
  tileSize: number;
}

export const RemoteCursor = React.memo(({ cursor, tileSize }: Props) => {
  return (
    <div
      className="absolute pointer-events-none z-10 transition-all duration-100 ease-out"
      style={{
        left: cursor.gridX * tileSize + tileSize / 2,
        top: cursor.gridY * tileSize,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div
        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-lg"
        style={{
          background: cursor.color,
          color: '#000',
        }}
      >
        {cursor.displayName}
      </div>
      <div
        className="w-3 h-3 rounded-full border-2 border-white/80 mx-auto -mt-0.5 shadow-md"
        style={{ background: cursor.color }}
      />
    </div>
  );
});

RemoteCursor.displayName = 'RemoteCursor';
