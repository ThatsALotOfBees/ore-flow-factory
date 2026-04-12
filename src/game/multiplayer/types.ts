import { GameState, Inventory } from '../types';
import { GameAction } from '../reducer';

export type MultiplayerRole = 'solo' | 'host' | 'guest';

export interface MultiplayerSession {
  id: string;
  hostUserId: string;
  saveId: string;
  inviteCode: string;
  inviteExpiresAt: string;
  maxPlayers: number;
  status: 'active' | 'paused' | 'closed';
}

export interface SessionMember {
  userId: string;
  displayName: string;
  color: string;
  role: 'host' | 'guest';
  isOnline: boolean;
}

export interface CursorPosition {
  userId: string;
  displayName: string;
  color: string;
  gridX: number;
  gridY: number;
}

export interface BroadcastAction {
  action: GameAction;
  senderId: string;
  seq: number;
}

export interface TickDelta {
  inventory: Inventory;
  tickCount: number;
}

export interface StateSync {
  state: GameState;
}
