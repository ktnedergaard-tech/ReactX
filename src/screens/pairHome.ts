import type { Nav } from '../app';
import { pairSession } from '../pairSession';
import { loadServerUrl, hasAutoServerUrl } from '../storage';
import { unlockAudio } from '../cues';
import { t } from '../i18n';

export function renderPairHome(root: HTMLElement, nav: Nav): void {
  root.innerHTML = '';
  const hasAutoServer = hasAutoServerUrl();
  const screen = document.createElement('div');
  screen.className = 'screen';

  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.innerHTML = `<h2>${t('pairHome.heading')}</h2>`;
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
  body.style.marginTop = '24px';
  body.style.flex = '1';
  body.style.justifyContent = 'center';

  const card = document.createElement('div');
  card.className = 'card';

  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  // Bevidst IKKE en tekst der ligner en rigtig adresse (fx en IP) – det
  // fik tidligere brugere til at tro feltet var udfyldt i forvejen og
  // trykke videre uden selv at skrive noget.
  urlInput.placeholder = t('pairHome.urlPlaceholder');
  urlInput.value = loadServerUrl() || '';
  urlInput.autocapitalize = 'off';
  urlInput.autocomplete = 'off';
  urlInput.spellcheck = false;

  if (hasAutoServer) {
    // Adressen er fundet automatisk – de fleste skal aldrig se eller røre feltet.
    const autoNote = document.createElement('p');
    autoNote.style.fontSize = '0.8rem';
    autoNote.style.color = 'var(--text-dim)';
    autoNote.style.margin = '-6px 0 14px';
    autoNote.textContent = t('pairHome.autoFound');
    card.appendChild(autoNote);

    const details = document.createElement('details');
    details.style.marginBottom = '14px';
    const summary = document.createElement('summary');
    summary.textContent = t('pairHome.advanced');
    summary.style.fontSize = '0.78rem';
    summary.style.color = 'var(--text-dim)';
    summary.style.cursor = 'pointer';
    details.appendChild(summary);

    const urlField = document.createElement('div');
    urlField.className = 'field';
    urlField.style.marginTop = '10px';
    urlField.innerHTML = `<label><span>${t('pairHome.serverAddress')}</span></label>`;
    urlField.appendChild(urlInput);
    details.appendChild(urlField);

    const hint = document.createElement('p');
    hint.style.fontSize = '0.75rem';
    hint.style.color = 'var(--text-dim)';
    hint.style.margin = '4px 0 0';
    hint.textContent = t('pairHome.overrideHint');
    details.appendChild(hint);

    card.appendChild(details);
  } else {
    const localTip = document.createElement('div');
    localTip.className = 'error-banner';
    localTip.style.color = 'var(--text)';
    localTip.style.background = 'var(--panel-2)';
    localTip.style.borderColor = '#262d3b';
    localTip.style.marginBottom = '14px';
    localTip.innerHTML = `<strong>${t('pairHome.localTitle')}</strong><br>${t('pairHome.localBody')}`;
    card.appendChild(localTip);

    const urlField = document.createElement('div');
    urlField.className = 'field';
    urlField.innerHTML = `<label><span>${t('pairHome.serverAddress')}</span></label>`;
    urlField.appendChild(urlInput);
    const example = document.createElement('div');
    example.style.fontSize = '0.75rem';
    example.style.color = 'var(--text-dim)';
    example.style.marginTop = '4px';
    example.textContent = t('pairHome.exampleAddress');
    urlField.appendChild(example);
    card.appendChild(urlField);

    const hint = document.createElement('p');
    hint.style.fontSize = '0.75rem';
    hint.style.color = 'var(--text-dim)';
    hint.style.margin = '4px 0 14px';
    hint.textContent = t('pairHome.sameServerHint');
    card.appendChild(hint);
  }

  const errorBanner = document.createElement('div');
  errorBanner.className = 'error-banner';
  errorBanner.style.display = 'none';
  card.appendChild(errorBanner);

  const createBtn = document.createElement('button');
  createBtn.className = 'btn btn--primary';
  createBtn.style.width = '100%';
  createBtn.style.marginBottom = '10px';
  createBtn.textContent = t('pairHome.create');
  createBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    const err = serverUrlError(url);
    if (err) return showError(err, urlInput);
    unlockAudio();
    pairSession.create(url);
    nav.go('pair-lobby');
  });
  card.appendChild(createBtn);

  const divider = document.createElement('div');
  divider.style.textAlign = 'center';
  divider.style.color = 'var(--text-dim)';
  divider.style.fontSize = '0.8rem';
  divider.style.margin = '10px 0';
  divider.textContent = t('pairHome.or');
  card.appendChild(divider);

  const codeField = document.createElement('div');
  codeField.className = 'field';
  codeField.innerHTML = `<label><span>${t('pairHome.roomCode')}</span></label>`;
  const codeInput = document.createElement('input');
  codeInput.type = 'text';
  codeInput.placeholder = t('pairHome.roomCodePlaceholder');
  codeInput.maxLength = 4;
  codeInput.style.textTransform = 'uppercase';
  codeInput.style.fontSize = '1.4rem';
  codeInput.style.textAlign = 'center';
  codeInput.style.letterSpacing = '0.2em';
  codeInput.autocapitalize = 'characters';
  codeInput.autocomplete = 'off';
  codeInput.spellcheck = false;
  codeField.appendChild(codeInput);
  card.appendChild(codeField);

  const joinBtn = document.createElement('button');
  joinBtn.className = 'btn';
  joinBtn.style.width = '100%';
  joinBtn.textContent = t('pairHome.join');
  joinBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    const code = codeInput.value.trim();
    const err = serverUrlError(url);
    if (err) return showError(err, urlInput);
    if (code.length < 4) return showError(t('pairHome.err.shortCode'), codeInput);
    unlockAudio();
    pairSession.join(url, code);
    nav.go('pair-lobby');
  });
  card.appendChild(joinBtn);

  function showError(msg: string, focusEl?: HTMLElement): void {
    errorBanner.textContent = msg;
    errorBanner.style.display = 'block';
    focusEl?.focus();
  }

  /** Giver en konkret fejlbesked afhængig af om feltet er tomt eller bare forkert udfyldt. */
  function serverUrlError(url: string): string | null {
    if (url.length === 0) {
      return hasAutoServer ? t('pairHome.err.emptyAuto') : t('pairHome.err.emptyManual');
    }
    if (!isValidWsUrl(url)) {
      return t('pairHome.err.badFormat');
    }
    return null;
  }

  body.appendChild(card);
  screen.appendChild(body);
  root.appendChild(screen);
}

function isValidWsUrl(url: string): boolean {
  return /^wss?:\/\/.+/i.test(url);
}
