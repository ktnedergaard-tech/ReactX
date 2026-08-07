import type { Nav } from '../app';
import { pairSession } from '../pairSession';
import { loadServerUrl, hasAutoServerUrl } from '../storage';
import { unlockAudio } from '../cues';

export function renderPairHome(root: HTMLElement, nav: Nav): void {
  root.innerHTML = '';
  const hasAutoServer = hasAutoServerUrl();
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
  // Bevidst IKKE en tekst der ligner en rigtig adresse (fx en IP) – det
  // fik tidligere brugere til at tro feltet var udfyldt i forvejen og
  // trykke videre uden selv at skrive noget.
  urlInput.placeholder = 'Indtast serverens adresse her';
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
    autoNote.textContent = '✓ Server fundet automatisk – I skal ikke gøre noget.';
    card.appendChild(autoNote);

    const details = document.createElement('details');
    details.style.marginBottom = '14px';
    const summary = document.createElement('summary');
    summary.textContent = 'Avanceret: brug en anden server-adresse';
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
    hint.textContent = 'Overskriv kun hvis I ved I skal bruge en anden server end den fundne.';
    details.appendChild(hint);

    card.appendChild(details);
  } else {
    const localTip = document.createElement('div');
    localTip.className = 'error-banner';
    localTip.style.color = 'var(--text)';
    localTip.style.background = 'var(--panel-2)';
    localTip.style.borderColor = '#262d3b';
    localTip.style.marginBottom = '14px';
    localTip.innerHTML =
      '<strong>Bruger I en lokal server?</strong><br>Luk denne side og åbn i stedet adressen (eller scan QR-koden), som vises i terminal-vinduet, da I startede den lokale server. Så udfyldes alt automatisk.';
    card.appendChild(localTip);

    const urlField = document.createElement('div');
    urlField.className = 'field';
    urlField.innerHTML = `<label><span>Server-adresse</span></label>`;
    urlField.appendChild(urlInput);
    const example = document.createElement('div');
    example.style.fontSize = '0.75rem';
    example.style.color = 'var(--text-dim)';
    example.style.marginTop = '4px';
    example.textContent = 'Kun til jeres egen cloud-server, fx: wss://reactx-relay.onrender.com';
    urlField.appendChild(example);
    card.appendChild(urlField);

    const hint = document.createElement('p');
    hint.style.fontSize = '0.75rem';
    hint.style.color = 'var(--text-dim)';
    hint.style.margin = '4px 0 14px';
    hint.textContent = 'Alle 3 telefoner skal bruge samme server-adresse. Se README for detaljer.';
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
    const err = serverUrlError(url);
    if (err) return showError(err, urlInput);
    if (code.length < 4) return showError('Indtast den 4-tegns rumkode fra værtens telefon.', codeInput);
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
      return hasAutoServer
        ? 'Server-adresse-feltet er tomt. Åbn "Avanceret" og indtast adressen fra terminal-vinduet.'
        : 'Server-adresse-feltet er tomt. Bruger I en lokal server, skal I åbne dens adresse direkte i Safari i stedet (se boksen ovenfor) – feltet her er kun til jeres egen cloud-server.';
    }
    if (!isValidWsUrl(url)) {
      return 'Adressen skal starte med ws:// eller wss:// – tjek at du ikke er kommet til at skrive noget andet.';
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
