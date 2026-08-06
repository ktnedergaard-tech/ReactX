import type { Nav } from '../app';

export function renderIdeas(root: HTMLElement, nav: Nav): void {
  root.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen';

  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.innerHTML = `<h2>Idéer & forbedringer</h2>`;
  const back = document.createElement('button');
  back.className = 'btn btn--ghost btn--sm';
  back.textContent = '← Tilbage';
  back.addEventListener('click', () => nav.go('home'));
  topbar.prepend(back);
  screen.appendChild(topbar);

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.justifyContent = 'center';
  wrap.style.marginTop = '18px';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.maxWidth = '480px';

  const list = document.createElement('div');
  list.className = 'ideas-list';
  list.innerHTML = `
    <h3>Sværhedsgrad</h3>
    <ul>
      <li>Progressivt tempo: intervallet bliver automatisk kortere hen gennem øvelsen/serien.</li>
      <li>Flere farver (orange, lilla, hvid, sort) når basis-farverne bliver for nemme.</li>
      <li>"Distraktor": en telefon går sort ind imellem – spilleren skal sige "ingen"/"sort" i stedet.</li>
      <li>Tal eller bogstaver oven i farven, så spilleren både skal se farve og læse/tælle (kobler kognitiv belastning på).</li>
    </ul>
    <h3>Træningsvarianter</h3>
    <ul>
      <li>Peripert syn: farven vises kun kort (fx 300 ms) og går så sort igen – tvinger hurtigere blik.</li>
      <li>"Kald og bekræft": næste skift kommer først når coachen trykker godkend (kræver mikrofon/håndholdt dommer-knap).</li>
      <li>Retningsbestemt opstilling: telefoner i forskellige højder/vinkler for at træne nakke- og øjenbevægelse, ikke kun sideblik.</li>
      <li>Kombinér med decision-making: farven bestemmer hvilken finte/aflevering spilleren skal udføre efter modtagelse.</li>
    </ul>
    <h3>Multi-telefon</h3>
    <ul>
      <li>Garanti for at de 3 telefoner aldrig viser samme farve samtidig (allerede indbygget i Pair-tilstand).</li>
      <li>4. rolle som "coach-skærm" der viser alle 3 telefoners aktuelle farve og historik til feedback bagefter.</li>
      <li>QR-kode i stedet for 4-cifret kode til hurtigere parring.</li>
    </ul>
    <h3>Data & feedback</h3>
    <ul>
      <li>Log antal reps, gennemsnitligt interval og session-varighed – eksportér til CSV for progression over tid.</li>
      <li>Coach markerer manuelt "rigtig/forkert" pr. rep via en enkel knap, så I kan tracke præcision, ikke kun tempo.</li>
      <li>Mikrofon-baseret reaktionstid (avanceret, kræver taledetektion) – realistisk først som fase 2.</li>
    </ul>
    <h3>Praktisk opsætning</h3>
    <ul>
      <li>Skru skærmens lysstyrke helt op og sluk "Sluk skærm automatisk" i iPhone-indstillinger, hvis Wake Lock ikke virker.</li>
      <li>Brug billige telefonstativer/vægholdere til at placere telefonerne stabilt rundt om spilleren.</li>
      <li>Kør parrings-serveren lokalt på en bærbar/hotspot til baner uden god mobildækning (se README).</li>
    </ul>
    <h3>Fremtid</h3>
    <ul>
      <li>Pak appen som en rigtig iOS-app via Capacitor for haptik, App Store-distribution og bedre baggrundsopførsel.</li>
      <li>Apple Watch-companion til coachen som fjernbetjening (start/pause/stop) uden at skulle røre en telefon.</li>
    </ul>
  `;
  card.appendChild(list);
  wrap.appendChild(card);
  screen.appendChild(wrap);
  root.appendChild(screen);
}
