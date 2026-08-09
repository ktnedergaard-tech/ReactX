import './style.css';
import { App } from './app';
import { renderHome } from './screens/home';
import { renderSoloSettings, renderSoloRun } from './screens/solo';
import { renderPairHome } from './screens/pairHome';
import { renderPairLobby } from './screens/pairLobby';
import { renderPairRun } from './screens/pairRun';
import { renderIdeas } from './screens/ideas';
import { lang, t } from './i18n';

// Det statiske index.html har et engelsk fallback (crawlere/link-
// forhåndsvisninger kører ikke JS), men selve app-fanen/PWA-installationen
// skal matche telefonens faktiske sprog, når vi kender det.
document.title = t('meta.title');
document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
const manifestLink = document.getElementById('manifest-link');
if (manifestLink) manifestLink.setAttribute('href', lang === 'da' ? './manifest.da.webmanifest' : './manifest.en.webmanifest');

const root = document.getElementById('app');
if (!root) throw new Error('#app mangler i index.html');

const app = new App(root);
app.register('home', renderHome);
app.register('solo-settings', renderSoloSettings);
app.register('solo-run', renderSoloRun);
app.register('pair-home', renderPairHome);
app.register('pair-lobby', renderPairLobby);
app.register('pair-run', renderPairRun);
app.register('ideas', renderIdeas);

app.go('home');

// Undgå iOS "gummi-scroll" og pinch-zoom under selve øvelsen.
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length > 1) e.preventDefault();
  },
  { passive: false }
);
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      /* offline-cache er "nice to have", ikke kritisk */
    });
  });
}
