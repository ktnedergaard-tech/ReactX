import type { Nav } from '../app';
import { pairSession } from '../pairSession';
import { loadServerUrl } from '../storage';
import { unlockAudio } from '../cues';
import { DEFAULT_RELAY_URL } from '../config';

const HAS_BUILT_IN_SERVER = DEFAULT_RELAY_URL.trim().length > 0;

export function renderPairHome(root: HTMLElement, nav: Nav): void {
  root.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen';

  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.innerHTML = `<h2>Par telefoner sammen</h2>`;
  const back = document.createElement('button');
  back.className = 'btn btn--ghost btn--sm';
  back.textContent = '← Tilbage';
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
  urlInput.placeholder = 'wss://dit-reactx-relay.example.com';
  urlInput.value = loadServerUrl() || '';
  urlInput.autocapitalize = 'off';
  urlInput.autocomplete = 'off';
  urlInput.spellcheck = false;

  if (HAS_BUILT_IN_SERVER) {
    // Der er en indbygget server – de fleste skal aldrig se eller røre feltet.
    const details = document.createElement('details');
    details.style.marginBottom = '14px';
    const summary = document.createElement('summary');
    summary.textContent = 'Avanceret: brug egen server-adresse';
    summary.style.fontSize = '0.78rem';
    summary.style.color = 'var(--text-dim)';
    summary.style.cursor = 'pointer';
    details.appendChild(summary);

    const urlField = document.createElement('div');
    urlField.className = 'field';
    urlField.style.marginTop = '10px';
    urlField.innerHTML = `<label><span>Server-adresse</span></label>`;
    urlField.appendChild(urlInput);
    details.appendChild(urlField);

    const hint = document.createElement('p');
    hint.style.fontSize = '0.75rem';
    hint.style.color = 'var(--text-dim)';
    hint.style.margin = '4px 0 0';
    hint.textContent =
      'Kun nødvendigt hvis I selv kører en server lokalt (fx til en bane uden god mobildækning) – se README.';
    details.appendChild(hint);

    card.appendChild(details);
  } else {
    const urlField = document.createElement('div');
    urlField.className = 'field';
    urlField.innerHTML = `<label><span>Server-adresse</span></label>`;
    urlField.appendChild(urlInput);
    card.appendChild(urlField);

    const hint = document.createElement('p');
    hint.style.fontSize = '0.75rem';
    hint.style.color = 'var(--text-dim)';
    hint.style.margin = '-6px 0 14px';
    hint.textContent =
      'Alle 3 telefoner skal bruge samme server-adresse. Se README for hvordan I selv sætter en gratis relay-server op (eller kører den lokalt på samme wifi til stævner/træning uden internet).';
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
  createBtn.textContent = '➕ Opret rum (bliv vært)';
  createBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!isValidWsUrl(url)) return showError('Indtast en gyldig server-adresse (starter med wss:// eller ws://).');
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
  divider.textContent = 'eller';
  card.appendChild(divider);

  const codeField = document.createElement('div');
  codeField.className = 'field';
  codeField.innerHTML = `<label><span>Rumkode</span></label>`;
  const codeInput = document.createElement('input');
  codeInput.type = 'text';
  codeInput.placeholder = 'fx A7K2';
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
  joinBtn.textContent = '🔗 Deltag i rum';
  joinBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    const code = codeInput.value.trim();
    if (!isValidWsUrl(url)) return showError('Indtast en gyldig server-adresse (starter med wss:// eller ws://).');
    if (code.length < 4) return showError('Indtast den 4-tegns rumkode fra værtens telefon.');
    unlockAudio();
    pairSession.join(url, code);
    nav.go('pair-lobby');
  });
  card.appendChild(joinBtn);

  function showError(msg: string): void {
    errorBanner.textContent = msg;
    errorBanner.style.display = 'block';
  }

  body.appendChild(card);
  screen.appendChild(body);
  root.appendChild(screen);
}

function isValidWsUrl(url: string): boolean {
  return /^wss?:\/\/.+/i.test(url);
}
