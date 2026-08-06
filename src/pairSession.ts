import { RoomClient, type ConnState } from './net/client';
import type { RoomStatus } from './net/protocol';
import type { ColorId } from './colors';
import { DEFAULT_SETTINGS, type DrillSettings, saveServerUrl } from './storage';

export interface PairState {
  connState: ConnState | 'idle';
  code: string | null;
  clientId: string | null;
  slot: number | null;
  hostSlot: number | null;
  isHost: boolean;
  connectedSlots: number[];
  status: RoomStatus;
  settings: DrillSettings;
  error: string | null;
}

type StateListener = (s: PairState) => void;
type ColorListener = (color: ColorId, repIndex: number, number?: number) => void;
type CountdownListener = (secondsLeft: number) => void;

/**
 * Singleton der holder styr på forbindelsen til parrings-serveren og rummets
 * tilstand, så den kan deles mellem pair-home/-lobby/-run skærmene uden at
 * skulle genoprette forbindelsen ved hver navigation.
 */
class PairSession {
  private client: RoomClient | null = null;
  private state: PairState = {
    connState: 'idle',
    code: null,
    clientId: null,
    slot: null,
    hostSlot: null,
    isHost: false,
    connectedSlots: [],
    status: 'lobby',
    settings: { ...DEFAULT_SETTINGS },
    error: null,
  };
  private stateListeners = new Set<StateListener>();
  private colorListeners = new Set<ColorListener>();
  private countdownListeners = new Set<CountdownListener>();

  getState(): PairState {
    return this.state;
  }

  onState(l: StateListener): () => void {
    this.stateListeners.add(l);
    return () => this.stateListeners.delete(l);
  }
  onColor(l: ColorListener): () => void {
    this.colorListeners.add(l);
    return () => this.colorListeners.delete(l);
  }
  onCountdown(l: CountdownListener): () => void {
    this.countdownListeners.add(l);
    return () => this.countdownListeners.delete(l);
  }

  private patch(p: Partial<PairState>): void {
    this.state = { ...this.state, ...p };
    for (const l of this.stateListeners) l(this.state);
  }

  private ensureClient(serverUrl: string): RoomClient {
    if (this.client) this.client.close();
    saveServerUrl(serverUrl);
    const client = new RoomClient(serverUrl);
    this.client = client;

    client.onState((s) => {
      this.patch({ connState: s, error: s === 'open' ? null : this.state.error });
      // Efter en genforbindelse (fx kort wifi-udfald på banen) skal telefonen
      // selv finde tilbage til sin plads i rummet uden at spilleren gør noget.
      if (s === 'open' && this.state.code && this.state.clientId) {
        client.send({ type: 'rejoin', code: this.state.code, clientId: this.state.clientId });
      }
    });

    client.on((msg) => {
      switch (msg.type) {
        case 'created':
        case 'joined':
        case 'rejoined':
          this.patch({ code: msg.code, clientId: msg.clientId, slot: msg.slot, error: null });
          break;
        case 'presence':
          this.patch({
            connectedSlots: msg.connectedSlots,
            hostSlot: msg.hostSlot,
            isHost: msg.youAreHost,
          });
          break;
        case 'settings':
          this.patch({ settings: msg.settings });
          break;
        case 'status':
          this.patch({ status: msg.status });
          break;
        case 'countdown':
          for (const l of this.countdownListeners) l(msg.secondsLeft);
          break;
        case 'color':
          for (const l of this.colorListeners) l(msg.color, msg.repIndex, msg.number);
          break;
        case 'error':
          this.patch({ error: msg.message });
          break;
      }
    });

    client.connect();
    return client;
  }

  create(serverUrl: string): void {
    const client = this.ensureClient(serverUrl);
    client.send({ type: 'create' });
  }

  join(serverUrl: string, code: string): void {
    const client = this.ensureClient(serverUrl);
    client.send({ type: 'join', code: code.trim().toUpperCase() });
  }

  updateSettings(settings: DrillSettings): void {
    this.patch({ settings });
    this.client?.send({ type: 'settings', settings });
  }

  start(): void {
    this.client?.send({ type: 'start' });
  }
  pause(): void {
    this.client?.send({ type: 'pause' });
  }
  resume(): void {
    this.client?.send({ type: 'resume' });
  }
  stop(): void {
    this.client?.send({ type: 'stop' });
  }

  leave(): void {
    this.client?.send({ type: 'leave' });
    this.client?.close();
    this.client = null;
    this.state = {
      connState: 'idle',
      code: null,
      clientId: null,
      slot: null,
      hostSlot: null,
      isHost: false,
      connectedSlots: [],
      status: 'lobby',
      settings: { ...DEFAULT_SETTINGS },
      error: null,
    };
    for (const l of this.stateListeners) l(this.state);
  }
}

export const pairSession = new PairSession();
