import type { Nav } from '../app';
import { t } from '../i18n';

export function renderIdeas(root: HTMLElement, nav: Nav): void {
  root.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen';

  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.innerHTML = `<h2>${t('ideas.heading')}</h2>`;
  const back = document.createElement('button');
  back.className = 'btn btn--ghost btn--sm';
  back.textContent = t('common.back');
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
    <h3>${t('ideas.difficulty')}</h3>
    <ul>
      <li>${t('ideas.difficulty.1')}</li>
      <li>${t('ideas.difficulty.2')}</li>
      <li>${t('ideas.difficulty.3')}</li>
      <li>${t('ideas.difficulty.4')}</li>
      <li>${t('ideas.difficulty.5')}</li>
    </ul>
    <h3>${t('ideas.variants')}</h3>
    <ul>
      <li>${t('ideas.variants.1')}</li>
      <li>${t('ideas.variants.2')}</li>
      <li>${t('ideas.variants.3')}</li>
      <li>${t('ideas.variants.4')}</li>
    </ul>
    <h3>${t('ideas.multi')}</h3>
    <ul>
      <li>${t('ideas.multi.1')}</li>
      <li>${t('ideas.multi.2')}</li>
      <li>${t('ideas.multi.3')}</li>
    </ul>
    <h3>${t('ideas.data')}</h3>
    <ul>
      <li>${t('ideas.data.1')}</li>
      <li>${t('ideas.data.2')}</li>
      <li>${t('ideas.data.3')}</li>
    </ul>
    <h3>${t('ideas.setup')}</h3>
    <ul>
      <li>${t('ideas.setup.1')}</li>
      <li>${t('ideas.setup.2')}</li>
      <li>${t('ideas.setup.3')}</li>
    </ul>
    <h3>${t('ideas.future')}</h3>
    <ul>
      <li>${t('ideas.future.1')}</li>
      <li>${t('ideas.future.2')}</li>
    </ul>
  `;
  card.appendChild(list);
  wrap.appendChild(card);
  screen.appendChild(wrap);
  root.appendChild(screen);
}
