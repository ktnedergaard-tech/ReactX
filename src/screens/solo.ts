import type { Nav } from '../app';
import { loadSettings, saveSettings } from '../storage';
import { buildSettingsForm } from './settingsForm';
import { SoloDrill } from '../drill';
import { ColorScreenView } from '../colorScreen';
import { setWakeLockWanted, isWakeLockSupported } from '../wakelock';
import { unlockAudio } from '../cues';
import { t } from '../i18n';

export function renderSoloSettings(root: HTMLElement, nav: Nav): void {
  root.innerHTML = '';
  const settings = loadSettings();

  const screen = document.createElement('div');
  screen.className = 'screen';

  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.innerHTML = `<h2>${t('solo.heading')}</h2>`;
  const back = document.createElement('button');
  back.className = 'btn btn--ghost btn--sm';
  back.textContent = t('common.back');
  back.addEventListener('click', () => nav.go('home'));
  topbar.prepend(back);
  screen.appendChild(topbar);

  const body = document.createElement('div');
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.alignItems = 'center';
  body.style.gap = '16px';
  body.style.marginTop = '18px';
  body.style.paddingBottom = '30px';

  buildSettingsForm(body, settings, (s) => saveSettings(s));

  if (!isWakeLockSupported()) {
    const note = document.createElement('p');
    note.style.fontSize = '0.75rem';
    note.style.color = 'var(--text-dim)';
    note.style.maxWidth = '380px';
    note.textContent = t('solo.noWakeLock');
    body.appendChild(note);
  }

  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn--primary';
  startBtn.style.maxWidth = '420px';
  startBtn.style.width = '100%';
  startBtn.textContent = t('common.startDrill');
  startBtn.addEventListener('click', () => {
    unlockAudio();
    nav.go('solo-run');
  });
  body.appendChild(startBtn);

  screen.appendChild(body);
  root.appendChild(screen);
}

export function renderSoloRun(root: HTMLElement, nav: Nav): () => void {
  root.innerHTML = '';
  const settings = loadSettings();
  const view = new ColorScreenView(root, {
    showRepCounter: settings.showRepCounter,
    colorBlindLabels: settings.colorBlindLabels,
    soundCue: settings.soundCue,
    vibrationCue: settings.vibrationCue,
    controllable: true,
    onExit: () => {
      drill.stop();
      setWakeLockWanted(false);
      nav.go('solo-settings');
    },
    onTogglePause: () => {
      if (paused) drill.resume();
      else drill.pause();
      paused = !paused;
    },
  });

  let paused = false;

  const drill = new SoloDrill(settings, {
    onCountdown: (n) => view.showCountdown(n),
    onColor: (color, repIndex, number) => view.setColor(color, repIndex, number),
    onPhase: () => {
      /* no-op, UI reagerer via onColor/onCountdown */
    },
  });

  setWakeLockWanted(true);
  drill.start();

  return () => {
    drill.stop();
    setWakeLockWanted(false);
    view.destroy();
  };
}
