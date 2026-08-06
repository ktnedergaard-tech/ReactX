import type { ColorId } from './colors';
import { createSequencer, NUMBER_POOL } from './colors';
import type { DrillSettings } from './storage';

export type DrillPhase = 'idle' | 'countdown' | 'running' | 'paused' | 'stopped';

export interface DrillCallbacks {
  onCountdown: (secondsLeft: number) => void;
  /** number er kun sat når "Vis tal oveni farven" er slået til. */
  onColor: (color: ColorId, repIndex: number, number?: number) => void;
  onPhase: (phase: DrillPhase) => void;
}

/**
 * Kører selve reaktions-loopet lokalt på telefonen (bruges i Solo-tilstand).
 * I Pair-tilstand er det i stedet serveren der har "sandheden" om timing,
 * og klienten lytter bare på 'color'-beskeder — se net/client.ts.
 */
export class SoloDrill {
  private phase: DrillPhase = 'idle';
  private timer: number | undefined;
  private countdownTimer: number | undefined;
  private repIndex = 0;
  private nextColor: (() => ColorId) | null = null;
  private nextNumber: (() => number) | null = null;

  constructor(private settings: DrillSettings, private cb: DrillCallbacks) {}

  start(): void {
    this.repIndex = 0;
    // Ny pose-shuffle for hver træning, så rækkefølgen aldrig er den samme
    // to gange, og alle farver (og evt. tal) kommer lige ofte.
    this.nextColor = this.settings.avoidImmediateRepeat ? createSequencer(this.settings.palette) : null;
    this.nextNumber = this.settings.showNumbers ? createSequencer(NUMBER_POOL) : null;
    let n = this.settings.countdownSeconds;
    if (n <= 0) {
      this.beginRunning();
      return;
    }
    this.setPhase('countdown');
    this.cb.onCountdown(n);
    this.countdownTimer = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(this.countdownTimer);
        this.beginRunning();
      } else {
        this.cb.onCountdown(n);
      }
    }, 1000);
  }

  private beginRunning(): void {
    this.setPhase('running');
    this.tick();
  }

  private tick(): void {
    const palette = this.settings.palette;
    const color = this.nextColor ? this.nextColor() : palette[Math.floor(Math.random() * palette.length)];
    const number = this.nextNumber ? this.nextNumber() : undefined;
    this.repIndex += 1;
    this.cb.onColor(color, this.repIndex, number);

    const { minIntervalMs, maxIntervalMs } = this.settings;
    const delay = minIntervalMs + Math.random() * Math.max(0, maxIntervalMs - minIntervalMs);
    this.timer = window.setTimeout(() => {
      if (this.phase === 'running') this.tick();
    }, delay);
  }

  pause(): void {
    if (this.phase !== 'running') return;
    window.clearTimeout(this.timer);
    this.setPhase('paused');
  }

  resume(): void {
    if (this.phase !== 'paused') return;
    this.setPhase('running');
    this.tick();
  }

  stop(): void {
    window.clearTimeout(this.timer);
    window.clearInterval(this.countdownTimer);
    this.setPhase('stopped');
  }

  private setPhase(p: DrillPhase): void {
    this.phase = p;
    this.cb.onPhase(p);
  }
}
