import type { Nav } from '../app';
import { pairSession, type PairState } from '../pairSession';
import { buildSettingsForm } from './settingsForm';

const SLOT_NAMES = ['Vært', 'Spiller 2', 'Spiller 3'];

export function renderPairLobby(root: HTMLElement, nav: Nav): () => void {
  root.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen';

  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  const back = document.createElement('button');
  back.className = 'btn btn--ghost btn--sm';
  back.textContent = '← Forlad rum';
  back.addEventListener('click', () => {
    pairSession.leave();
    nav.go('home');
  });
  const statusPill = document.createElement('span');
  statusPill.className = 'status-pill';
  statusPill.innerHTML = `<span class="led"></span><span>Forbinder…</span>`;
  topbar.append(back, statusPill);
  screen.appendChild(topbar);

  const body = document.createElement('div');
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.alignItems = 'center';
  body.style.gap = '18px';
  body.style.marginTop = '18px';
  body.style.paddingBottom = '30px';

  const errorBanner = document.createElement('div');
  errorBanner.className = 'error-banner';
  errorBanner.style.display = 'none';

  const codeWrap = document.createElement('div');
  codeWrap.style.textAlign = 'center';
  codeWrap.innerHTML = `<div style="color:var(--text-dim);font-size:0.8rem;margin-bottom:8px;">RUMKODE – del den med de to andre telefoner</div>`;
  const codeDisplay = document.createElement('div');
  codeDisplay.className = 'code-display';
  codeDisplay.textContent = '····';
  codeWrap.appendChild(codeDisplay);

  const presence = document.createElement('div');
  presence.className = 'presence';

  const settingsHost = document.createElement('div');
  settingsHost.style.width = '100%';
  settingsHost.style.display = 'flex';
  settingsHost.style.justifyContent = 'center';

  const waitingMsg = document.createElement('p');
  waitingMsg.style.color = 'var(--text-dim)';
  waitingMsg.style.fontSize = '0.9rem';
  waitingMsg.textContent = 'Venter på at værten starter øvelsen…';
  waitingMsg.style.display = 'none';

  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn--primary';
  startBtn.style.width = '100%';
  startBtn.style.maxWidth = '420px';
  startBtn.textContent = 'Start øvelse på alle telefoner';
  startBtn.style.display = 'none';
  startBtn.addEventListener('click', () => pairSession.start());

  body.append(errorBanner, codeWrap, presence, settingsHost, waitingMsg, startBtn);
  screen.appendChild(body);
  root.appendChild(screen);

  let settingsBuilt = false;

  function render(state: PairState): void {
    // Forbindelsesstatus-pille
    const connLabel: Record<string, string> = {
      idle: 'Ikke forbundet',
      connecting: 'Forbinder…',
      open: 'Forbundet',
      reconnecting: 'Genopretter forbindelse…',
      closed: 'Afbrudt',
    };
    statusPill.className = 'status-pill' + (state.connState === 'open' ? ' ok' : state.connState === 'closed' ? ' bad' : '');
    statusPill.innerHTML = `<span class="led"></span><span>${connLabel[state.connState] ?? state.connState}</span>`;

    if (state.error) {
      errorBanner.style.display = 'block';
      errorBanner.textContent = state.error;
    } else {
      errorBanner.style.display = 'none';
    }

    codeDisplay.textContent = state.code ?? '····';

    presence.innerHTML = '';
    for (let slot = 0; slot < 3; slot++) {
      const dot = document.createElement('div');
      const connected = state.connectedSlots.includes(slot);
      dot.className = 'dot' + (connected ? ' on' : '') + (slot === state.hostSlot ? ' host' : '');
      dot.textContent = connected ? '✓' : String(slot + 1);
      dot.title = SLOT_NAMES[slot];
      presence.appendChild(dot);
    }

    if (state.isHost) {
      waitingMsg.style.display = 'none';
      startBtn.style.display = 'block';
      startBtn.disabled = state.connState !== 'open';
      if (!settingsBuilt) {
        settingsBuilt = true;
        buildSettingsForm(settingsHost, state.settings, (s) => pairSession.updateSettings(s));
      }
    } else {
      waitingMsg.style.display = 'block';
      startBtn.style.display = 'none';
    }

    if (state.status === 'countdown' || state.status === 'running') {
      nav.go('pair-run');
    }
  }

  render(pairSession.getState());
  const unsub = pairSession.onState(render);

  return () => {
    unsub();
  };
}
