import type { ClientMessage, ServerMessage } from './protocol';

type Listener = (msg: ServerMessage) => void;

export type ConnState = 'connecting' | 'open' | 'reconnecting' | 'closed';

/**
 * Tynd WebSocket-klient med automatisk genforbindelse. Bruges af pair-flowet
 * til at snakke med relay-serveren i /server.
 */
export class RoomClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private stateListeners = new Set<(s: ConnState) => void>();
  private shouldReconnect = true;
  private reconnectAttempt = 0;
  private reconnectTimer: number | undefined;
  private queue: ClientMessage[] = [];

  constructor(private url: string) {}

  connect(): void {
    this.shouldReconnect = true;
    this.open();
  }

  private open(): void {
    this.setState(this.reconnectAttempt > 0 ? 'reconnecting' : 'connecting');
    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.addEventListener('open', () => {
      this.reconnectAttempt = 0;
      this.setState('open');
      for (const msg of this.queue) this.rawSend(msg);
      this.queue = [];
    });

    ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data as string) as ServerMessage;
        for (const l of this.listeners) l(msg);
      } catch {
        /* ignorer ugyldige beskeder */
      }
    });

    ws.addEventListener('close', () => {
      if (!this.shouldReconnect) {
        this.setState('closed');
        return;
      }
      this.setState('reconnecting');
      const delay = Math.min(500 * 2 ** this.reconnectAttempt, 5000);
      this.reconnectAttempt++;
      this.reconnectTimer = window.setTimeout(() => this.open(), delay);
    });

    ws.addEventListener('error', () => {
      ws.close();
    });
  }

  on(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onState(listener: (s: ConnState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private setState(s: ConnState): void {
    for (const l of this.stateListeners) l(s);
  }

  send(msg: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.rawSend(msg);
    } else {
      this.queue.push(msg);
    }
  }

  private rawSend(msg: ClientMessage): void {
    this.ws?.send(JSON.stringify(msg));
  }

  close(): void {
    this.shouldReconnect = false;
    window.clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}
