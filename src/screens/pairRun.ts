import type { Nav } from '../app';
import { pairSession } from '../pairSession';
import { ColorScreenView } from '../colorScreen';
import { setWakeLockWanted } from '../wakelock';
import { t } from '../i18n';

export function renderPairRun(root: HTMLElement, nav: Nav): () => void {
  root.innerHTML = '';
  const state = pairSession.getState();
  let paused = false;

  const view = new ColorScreenView(root, {
    showRepCounter: state.settings.showRepCounter,
    colorBlindLabels: state.settings.colorBlindLabels,
    soundCue: state.settings.soundCue,
    vibrationCue: state.settings.vibrationCue,
    controllable: state.isHost,
    statusText: state.isHost ? t('pairRun.host') : '',
    onExit: () => {
      if (state.isHost) pairSession.stop();
      pairSession.leave();
      setWakeLockWanted(false);
      nav.go('home');
    },
    onTogglePause: () => {
      paused = !paused;
      if (paused) pairSession.pause();
      else pairSession.resume();
    },
  });

  setWakeLockWanted(true);

  const unsubColor = pairSession.onColor((color, repIndex, number) => view.setColor(color, repIndex, number));
  const unsubCountdown = pairSession.onCountdown((n) => view.showCountdown(n));
  const unsubState = pairSession.onState((s) => {
    if (s.connState === 'reconnecting') view.setStatusText(t('pairRun.reconnecting'));
    else if (s.connState === 'open') view.setStatusText(s.isHost ? t('pairRun.host') : '');
    if (s.status === 'stopped') {
      setWakeLockWanted(false);
      nav.go('pair-lobby');
    }
  });

  return () => {
    unsubColor();
    unsubCountdown();
    unsubState();
    setWakeLockWanted(false);
    view.destroy();
  };
}
