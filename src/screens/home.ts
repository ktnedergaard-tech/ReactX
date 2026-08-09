import type { Nav } from '../app';
import { icons } from '../icons';

export function renderHome(root: HTMLElement, nav: Nav): void {
  root.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen home-screen';

  // --- Hero: fuld-bredde foto, uden beskæring, så hele konceptet ses.
  // Kun selve mærket ligger som en lille "badge" ovenpå fotoet (med sin
  // egen mørke baggrund, så den altid er læselig) – resten af teksten
  // flyder sømløst videre lige under, uden noget synligt skel, så det
  // hele opleves som én sammenhængende blok. ---
  const hero = document.createElement('div');
  hero.className = 'hero-banner';
  hero.innerHTML = `
    <img src="./hero-player.webp" alt="Telefon på stativ viser farven lilla, mens en spiller scanner området og bolden er på vej" width="900" height="470" />
    <div class="hero-brand">
      <h1 class="logo logo--sm">React<span class="logo-x">X</span></h1>
    </div>
  `;
  screen.appendChild(hero);

  const heroText = document.createElement('div');
  heroText.className = 'hero-text';
  heroText.innerHTML = `
    <p class="tagline">TRÆN<span class="dot">.</span> REAGÉR<span class="dot">.</span> FORBEDR<span class="dot">.</span></p>
    <p class="hero-desc">Forbedr din reaktionsevne, beslutningstagning og evne til at scanne omgivelserne.</p>
  `;
  screen.appendChild(heroText);

  const content = document.createElement('div');
  content.className = 'home-content';

  // --- Primære handlinger ---
  const stack = document.createElement('div');
  stack.className = 'stack';

  const soloBtn = document.createElement('button');
  soloBtn.className = 'btn btn--primary';
  soloBtn.textContent = '📱 Solo – én telefon';
  soloBtn.addEventListener('click', () => nav.go('solo-settings'));

  const pairBtn = document.createElement('button');
  pairBtn.className = 'btn';
  pairBtn.textContent = '🔗 Par sammen – 2-3 telefoner';
  pairBtn.addEventListener('click', () => nav.go('pair-home'));

  stack.append(soloBtn, pairBtn);
  content.appendChild(stack);

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
    <div class="example-row">
      <span class="swatch-dot" style="background:#1d4ed8"></span>
      <span class="swatch-dot" style="background:#eab308"></span>
      <span class="swatch-dot" style="background:#dc2626"></span>
      <span class="plain-text example-caption">3 telefoner, 3 forskellige farver – samtidig</span>
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
