// Delt protokol mellem klient og WebSocket-relay-serveren i /server.
// Rummet identificeres af en 4-tegns kode. Hver telefon får en "slot"
// (0 = vært, 1-2 = de to der parrer sig på). Max 3 telefoner pr. rum.
import type { ColorId } from '../colors';
import type { DrillSettings } from '../storage';

export const MAX_SLOTS = 3;

export type RoomStatus = 'lobby' | 'countdown' | 'running' | 'paused' | 'stopped';

export type ClientMessage =
  | { type: 'create' }
  | { type: 'join'; code: string }
  | { type: 'rejoin'; code: string; clientId: string }
  | { type: 'settings'; settings: DrillSettings }
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' }
  | { type: 'leave' }
  | { type: 'ping' };

export type ServerMessage =
  | { type: 'created'; code: string; clientId: string; slot: number }
  | { type: 'joined'; code: string; clientId: string; slot: number }
  | { type: 'rejoined'; code: string; clientId: string; slot: number }
  | { type: 'error'; message: string }
  | { type: 'presence'; connectedSlots: number[]; hostSlot: number; youAreHost: boolean }
  | { type: 'settings'; settings: DrillSettings }
  | { type: 'status'; status: RoomStatus }
  | { type: 'countdown'; secondsLeft: number }
  | { type: 'color'; color: ColorId; repIndex: number }
  | { type: 'pong' };
