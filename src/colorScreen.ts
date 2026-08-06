import { colorById, type ColorId } from './colors';
import { playBeep, vibrate } from './cues';

export interface ColorScreenOptions {
  showRepCounter: boolean;
  colorBlindLabels: boolean;
  soundCue: boolean;
  vibrationCue: boolean;
  /** Kan denne telefon selv styre pause/stop? (Solo: altid. Pair: kun værten). */
  controllable: boolean;
  onExit: () => void;
  onTogglePause?: () => void;
  statusText?: string;
}

/**
 * Fuldskærms farvevisning. Bruges af både Solo- og Pair-tilstand.
 * Tap i øverste højre hjørne (uden for spillerens synsfelt, når telefonen
 * ligger på jorden/står op ad noget) åbner exit/pause-menuen, så en tilfældig
 * bold ikke rammer skærmen og trigger noget ved et uheld.
 */
export class ColorScreenView {
  private root: HTMLDivElement;
  private label: HTMLDivElement;
  private hud: HTMLDivElement;
  private repCounterEl: HTMLDivElement;
  private overlay: HTMLDivElement | null = null;
  private paused = false;

  constructor(mount: HTMLElement, private opts: ColorScreenOptions) {
    this.root = document.createElement('div');
    this.root.className = 'color-screen';
    this.root.style.backgroundColor = '#05070c';

    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    this.hud.textContent = opts.statusText ?? '';
    this.root.appendChild(this.hud);

    this.label = document.createElement('div');
    this.label.className = 'label';
    this.root.appendChild(this.label);

    this.repCounterEl = document.createElement('div');
    this.repCounterEl.className = 'rep-counter';
    this.root.appendChild(this.repCounterEl);

    const cornerTap = document.createElement('button');
    cornerTap.className = 'corner-tap';
    cornerTap.setAttribute('aria-label', 'Pause og stop');
    cornerTap.innerHTML = '<span class="menu-dot">⋯</span>';
    cornerTap.addEventListener('click', () => this.toggleOverlay());
    this.root.appendChild(cornerTap);

    mount.appendChild(this.root);
    this.showHintOnce();
  }

  /** Viser kort en tip-boble om menu-knappen, så den er let at finde første gang. */
  private showHintOnce(): void {
    const hint = document.createElement('div');
    hint.className = 'corner-hint';
    hint.textContent = 'Tryk her for pause/stop';
    this.root.appendChild(hint);
    window.setTimeout(() => hint.classList.add('corner-hint--fade'), 3500);
    window.setTimeout(() => hint.remove(), 4200);
  }

  setStatusText(text: string): void {
    this.hud.textContent = text;
  }

  setColor(color: ColorId, repIndex?: number): void {
    const def = colorById(color);
    this.root.style.backgroundColor = def.hex;
    this.label.style.color = def.contrast;
    this.label.textContent = this.opts.colorBlindLabels ? def.label : '';
    if (this.opts.showRepCounter && repIndex !== undefined) {
      this.repCounterEl.textContent = `#${repIndex}`;
    }
    if (this.opts.soundCue) playBeep();
    if (this.opts.vibrationCue) vibrate();
  }

  showCountdown(secondsLeft: number): void {
    this.label.style.color = '#ffffff';
    this.label.textContent = secondsLeft > 0 ? String(secondsLeft) : 'KLAR!';
  }

  private toggleOverlay(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      return;
    }
    const overlay = document.createElement('div');
    overlay.className = 'pause-overlay';

    if (this.opts.controllable) {
      const pauseBtn = document.createElement('button');
      pauseBtn.className = 'btn btn--primary';
      pauseBtn.textContent = this.paused ? 'Fortsæt' : 'Pause';
      pauseBtn.addEventListener('click', () => {
        this.paused = !this.paused;
        pauseBtn.textContent = this.paused ? 'Fortsæt' : 'Pause';
        this.opts.onTogglePause?.();
      });
      overlay.appendChild(pauseBtn);
    } else {
      const info = document.createElement('div');
      info.textContent = 'Værten styrer denne øvelse';
      info.style.opacity = '0.7';
      info.style.fontSize = '0.9rem';
      overlay.appendChild(info);
    }

    const exitBtn = document.createElement('button');
    exitBtn.className = 'btn btn--danger';
    exitBtn.textContent = '⏹ Stop træning';
    exitBtn.addEventListener('click', () => this.opts.onExit());
    overlay.appendChild(exitBtn);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn--ghost';
    closeBtn.textContent = 'Luk menu';
    closeBtn.addEventListener('click', () => this.toggleOverlay());
    overlay.appendChild(closeBtn);

    this.overlay = overlay;
    this.root.appendChild(overlay);
  }

  destroy(): void {
    this.root.remove();
  }
}
