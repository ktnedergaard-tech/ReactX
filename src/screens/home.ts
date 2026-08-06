import type { Nav } from '../app';

export function renderHome(root: HTMLElement, nav: Nav): void {
  root.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen screen--centered';
  screen.innerHTML = `
    <h1 class="logo">ReactX</h1>
    <p class="subtitle">Fuldskærms farvereaktion til reaktionstræning. Placér telefonen(erne) så du kan scanne dem, mens bolden er på vej tilbage — råb farverne højt, inden du modtager.</p>
  `;

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

  const ideasBtn = document.createElement('button');
  ideasBtn.className = 'link';
  ideasBtn.textContent = 'Idéer til øvelser og forbedringer →';
  ideasBtn.addEventListener('click', () => nav.go('ideas'));

  stack.append(soloBtn, pairBtn, ideasBtn);
  screen.appendChild(stack);
  root.appendChild(screen);
}
