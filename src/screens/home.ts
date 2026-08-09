import type { Nav } from '../app';
import { icons } from '../icons';

export function renderHome(root: HTMLElement, nav: Nav): void {
  root.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen home-screen';

  // --- Top: logo/tagline/beskrivelse på ren mørk baggrund (matcher
  // designforslaget), efterfulgt af foto-bånd (stativ/telefon/spiller)
  // og til sidst de to store handlings-knapper, der overlapper bunden
  // af fotoet let – ligesom i det forslag brugeren har lavet. ---
  const heroTop = document.createElement('div');
  heroTop.className = 'hero-top';
  heroTop.innerHTML = `
    <h1 class="logo">React<span class="logo-x">X</span></h1>
    <p class="tagline">TRÆN<span class="dot">.</span> REAGÉR<span class="dot">.</span> FORBEDR<span class="dot">.</span></p>
    <p class="hero-desc">Forbedr din reaktionsevne, beslutningstagning og evne til at scanne omgivelserne.</p>
  `;
  screen.appendChild(heroTop);

  const hero = document.createElement('div');
  hero.className = 'hero-banner';
  hero.innerHTML = `
    <img src="./hero-player.webp" alt="Telefon på stativ viser farven lilla, mens en spiller scanner området og bolden er på vej" width="900" height="624" />
  `;
  screen.appendChild(hero);

  const heroCta = document.createElement('div');
  heroCta.className = 'hero-cta';

  const soloBtn = document.createElement('button');
  soloBtn.className = 'hero-cta-btn hero-cta-btn--solo';
  soloBtn.innerHTML = `
    <span class="hero-cta-icon">${icons.tripod}</span>
    <span class="hero-cta-label">Solo – én telefon</span>
    <span class="hero-cta-chevron">${icons.chevron}</span>
  `;
  soloBtn.addEventListener('click', () => nav.go('solo-settings'));

  const pairBtn = document.createElement('button');
  pairBtn.className = 'hero-cta-btn hero-cta-btn--pair';
  pairBtn.innerHTML = `
    <span class="hero-cta-icon">${icons.multiDevice}</span>
    <span class="hero-cta-label">Par sammen – 2-3 telefoner</span>
    <span class="hero-cta-chevron">${icons.chevron}</span>
  `;
  pairBtn.addEventListener('click', () => nav.go('pair-home'));

  heroCta.append(soloBtn, pairBtn);
  screen.appendChild(heroCta);

  const content = document.createElement('div');
  content.className = 'home-content';

  // --- Sådan virker det ---
  const stepsSection = document.createElement('div');
  stepsSection.className = 'plain-section';
  stepsSection.innerHTML = `<h2 class="plain-heading">Sådan virker det</h2>`;
  const steps = document.createElement('ol');
  steps.className = 'steps';
  steps.append(
    stepEl(icons.tripod, '1. Opsætning', 'Placér telefonen på et stativ eller op ad noget, bag dig.'),
    connector(),
    stepEl(icons.eye, '2. Scan', 'Mens bolden spilles til dig, skifter skærmen farve.'),
    connector(),
    stepEl(icons.voice, '3. Reagér', 'Råb farven højt, vend dig, og modtag bolden.')
  );
  stepsSection.appendChild(steps);
  content.appendChild(stepsSection);

  // --- Flere telefoner ---
  const multiSection = document.createElement('div');
  multiSection.className = 'plain-section';
  multiSection.innerHTML = `
    <h2 class="plain-heading">Par flere telefoner</h2>
    <p class="plain-text">Par op til 2 ekstra telefoner, og placér dem på mål, rebounders eller kegler. Hver telefon viser sin egen farve, aldrig den samme som de andre.</p>
    <div class="multi-photo">
      <img src="./multi-device.webp" alt="Spiller foran tre rebounders med hver sin farve – blå, gul og rød – og pile der viser bevægelsen mellem dem" width="900" height="488" />
      <div class="example-row example-row--overlay">
        <span class="swatch-dot" style="background:#1d4ed8"></span>
        <span class="swatch-dot" style="background:#dc2626"></span>
        <span class="swatch-dot" style="background:#dc2626"></span>
        <span class="plain-text example-caption">3 telefoner i spil – samtidig</span>
      </div>
    </div>
  `;
  content.appendChild(multiSection);

  // --- Fordele ---
  const benefitsSection = document.createElement('div');
  benefitsSection.className = 'plain-section';
  benefitsSection.innerHTML = `<h2 class="plain-heading">Hvorfor reaktionstræning</h2>`;
  const benefitsRow = document.createElement('div');
  benefitsRow.className = 'benefits-row';
  benefitsRow.append(
    benefitEl(icons.target, 'Bedre scanning', 'Opfat information omkring dig hurtigere.'),
    benefitEl(icons.brain, 'Hurtigere reaktion', 'Reager hurtigere på visuelle stimuli.'),
    benefitEl(icons.branch, 'Bedre beslutninger', 'Tag hurtigere og skarpere valg på banen.'),
    benefitEl(icons.trendUp, 'Bedre præstation', 'Skærp hovedet, løft dit niveau.')
  );
  benefitsSection.appendChild(benefitsRow);
  content.appendChild(benefitsSection);

  const ideasBtn = document.createElement('button');
  ideasBtn.className = 'link';
  ideasBtn.textContent = 'Idéer til øvelser og forbedringer →';
  ideasBtn.addEventListener('click', () => nav.go('ideas'));
  content.appendChild(ideasBtn);

  screen.appendChild(content);
  root.appendChild(screen);
}

function connector(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'step-connector';
  return el;
}

function stepEl(icon: string, title: string, body: string): HTMLElement {
  const li = document.createElement('li');
  li.className = 'step';
  li.innerHTML = `
    <div class="step-icon">${icon}</div>
    <div class="step-body">
      <h3>${title}</h3>
      <p>${body}</p>
    </div>
  `;
  return li;
}

function benefitEl(icon: string, title: string, body: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'benefit';
  el.innerHTML = `
    <div class="step-icon">${icon}</div>
    <h4>${title}</h4>
    <p>${body}</p>
  `;
  return el;
}
