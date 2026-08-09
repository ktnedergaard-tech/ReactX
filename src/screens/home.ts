import type { Nav } from '../app';
import { icons } from '../icons';

export function renderHome(root: HTMLElement, nav: Nav): void {
  root.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.style.alignItems = 'center';
  screen.style.textAlign = 'center';

  screen.innerHTML = `
    <img class="app-mark" src="./icons/icon-192.png" alt="" width="84" height="84" />
    <h1 class="logo">React<span class="logo-x">X</span></h1>
    <p class="tagline">TRÆN<span class="dot">.</span> REAGÉR<span class="dot">.</span> FORBEDR<span class="dot">.</span></p>
    <p class="subtitle">Forbedr din reaktionsevne, beslutningstagning og evne til at scanne omgivelserne.</p>
    <div class="badge-row">
      <span class="badge">⚡ Virker offline</span>
      <span class="badge">🎲 Tilfældig hver gang</span>
      <span class="badge">🔗 Op til 3 telefoner</span>
    </div>

    <div class="hero-photo">
      <img src="./hero-player.webp" alt="Spiller scanner en telefon på stativ på banen, inden bolden modtages" loading="lazy" width="670" height="1510" />
      <div class="hero-photo-caption">Placér telefonen bag dig og scan, mens bolden er på vej</div>
    </div>
  `;

  const stack = document.createElement('div');
  stack.className = 'stack';
  stack.style.marginBottom = '36px';

  const soloBtn = document.createElement('button');
  soloBtn.className = 'btn btn--primary';
  soloBtn.textContent = '📱 Solo – én telefon';
  soloBtn.addEventListener('click', () => nav.go('solo-settings'));

  const pairBtn = document.createElement('button');
  pairBtn.className = 'btn';
  pairBtn.textContent = '🔗 Par sammen – 2-3 telefoner';
  pairBtn.addEventListener('click', () => nav.go('pair-home'));

  stack.append(soloBtn, pairBtn);
  screen.appendChild(stack);

  // --- Sådan virker det ---
  const stepsSection = document.createElement('div');
  stepsSection.style.width = '100%';
  stepsSection.style.maxWidth = '420px';
  stepsSection.innerHTML = `<div class="section-label">Sådan virker det</div>`;
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
  screen.appendChild(stepsSection);

  // --- Flere telefoner ---
  const multiSection = document.createElement('div');
  multiSection.style.width = '100%';
  multiSection.style.maxWidth = '420px';
  multiSection.innerHTML = `
    <div class="section-label">Par flere telefoner</div>
    <p class="subtitle" style="margin:0 0 4px;max-width:none;">Par op til 2 ekstra telefoner, og placér dem på mål, rebounders eller kegler. Hver telefon viser sin egen farve, aldrig den samme som de andre.</p>
    <div class="example-row">
      <span class="swatch-dot" style="background:#1d4ed8"></span>
      <span class="swatch-dot" style="background:#eab308"></span>
      <span class="swatch-dot" style="background:#dc2626"></span>
      <span class="subtitle" style="margin:0;font-size:0.78rem;">3 telefoner, 3 forskellige farver – samtidig</span>
    </div>
  `;
  screen.appendChild(multiSection);

  // --- Fordele ---
  const benefitsSection = document.createElement('div');
  benefitsSection.style.width = '100%';
  benefitsSection.style.maxWidth = '420px';
  benefitsSection.style.marginBottom = '8px';
  benefitsSection.innerHTML = `<div class="section-label">Hvorfor reaktionstræning</div>`;
  const grid = document.createElement('div');
  grid.className = 'benefits-grid';
  grid.append(
    benefitEl(icons.target, 'Bedre scanning', 'Træn evnen til hurtigt at opfatte information omkring dig.'),
    benefitEl(icons.brain, 'Hurtigere reaktion', 'Reager hurtigere på visuelle stimuli og spilsituationer.'),
    benefitEl(icons.branch, 'Bedre beslutninger', 'Tag hurtigere og skarpere beslutninger på banen.'),
    benefitEl(icons.trendUp, 'Bedre præstation', 'Skærp hovedet, og løft dit niveau.')
  );
  benefitsSection.appendChild(grid);
  screen.appendChild(benefitsSection);

  const ideasBtn = document.createElement('button');
  ideasBtn.className = 'link';
  ideasBtn.textContent = 'Idéer til øvelser og forbedringer →';
  ideasBtn.addEventListener('click', () => nav.go('ideas'));
  screen.appendChild(ideasBtn);

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
