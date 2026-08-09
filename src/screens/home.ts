import type { Nav } from '../app';
import { icons } from '../icons';
import { t } from '../i18n';

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
    <p class="tagline">${t('home.tagline.1')}<span class="dot">.</span> ${t('home.tagline.2')}<span class="dot">.</span> ${t('home.tagline.3')}<span class="dot">.</span></p>
    <p class="hero-desc">${t('home.desc')}</p>
  `;
  screen.appendChild(heroTop);

  const hero = document.createElement('div');
  hero.className = 'hero-banner';
  hero.innerHTML = `
    <img src="./hero-player.webp" alt="${t('home.heroImgAlt')}" width="900" height="624" />
  `;
  screen.appendChild(hero);

  const heroCta = document.createElement('div');
  heroCta.className = 'hero-cta';

  const soloBtn = document.createElement('button');
  soloBtn.className = 'hero-cta-btn hero-cta-btn--solo';
  soloBtn.innerHTML = `
    <span class="hero-cta-icon">${icons.tripod}</span>
    <span class="hero-cta-label">${t('home.cta.solo')}</span>
    <span class="hero-cta-chevron">${icons.chevron}</span>
  `;
  soloBtn.addEventListener('click', () => nav.go('solo-settings'));

  const pairBtn = document.createElement('button');
  pairBtn.className = 'hero-cta-btn hero-cta-btn--pair';
  pairBtn.innerHTML = `
    <span class="hero-cta-icon">${icons.multiDevice}</span>
    <span class="hero-cta-label">${t('home.cta.pair')}</span>
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
  stepsSection.innerHTML = `<h2 class="plain-heading">${t('home.steps.heading')}</h2>`;
  const steps = document.createElement('ol');
  steps.className = 'steps';
  steps.append(
    stepEl(icons.tripod, t('home.steps.1.title'), t('home.steps.1.body')),
    connector(),
    stepEl(icons.eye, t('home.steps.2.title'), t('home.steps.2.body')),
    connector(),
    stepEl(icons.voice, t('home.steps.3.title'), t('home.steps.3.body'))
  );
  stepsSection.appendChild(steps);
  content.appendChild(stepsSection);

  // --- Flere telefoner ---
  const multiSection = document.createElement('div');
  multiSection.className = 'plain-section';
  multiSection.innerHTML = `
    <h2 class="plain-heading">${t('home.multi.heading')}</h2>
    <p class="plain-text">${t('home.multi.body')}</p>
    <div class="multi-photo">
      <img src="./multi-device.webp" alt="${t('home.multi.imgAlt')}" width="900" height="488" />
      <div class="example-row example-row--overlay">
        <span class="swatch-dot" style="background:#1d4ed8"></span>
        <span class="swatch-dot" style="background:#dc2626"></span>
        <span class="swatch-dot" style="background:#dc2626"></span>
        <span class="plain-text example-caption">${t('home.multi.caption')}</span>
      </div>
    </div>
  `;
  content.appendChild(multiSection);

  // --- Fordele ---
  const benefitsSection = document.createElement('div');
  benefitsSection.className = 'plain-section';
  benefitsSection.innerHTML = `<h2 class="plain-heading">${t('home.benefits.heading')}</h2>`;
  const benefitsRow = document.createElement('div');
  benefitsRow.className = 'benefits-row';
  benefitsRow.append(
    benefitEl(icons.target, t('home.benefits.1.title'), t('home.benefits.1.body')),
    benefitEl(icons.brain, t('home.benefits.2.title'), t('home.benefits.2.body')),
    benefitEl(icons.branch, t('home.benefits.3.title'), t('home.benefits.3.body')),
    benefitEl(icons.trendUp, t('home.benefits.4.title'), t('home.benefits.4.body'))
  );
  benefitsSection.appendChild(benefitsRow);
  content.appendChild(benefitsSection);

  const ideasBtn = document.createElement('button');
  ideasBtn.className = 'link';
  ideasBtn.textContent = t('home.ideasLink');
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
