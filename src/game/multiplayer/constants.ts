export const CHANNEL_PREFIX = 'session:';
export const CURSOR_THROTTLE_MS = 100;
export const HEARTBEAT_INTERVAL_MS = 5000;
export const HOST_DISCONNECT_TIMEOUT_MS = 30000;
export const MAX_TICK_DRIFT = 3;

export function channelName(sessionId: string) {
  return `${CHANNEL_PREFIX}${sessionId}`;
}
