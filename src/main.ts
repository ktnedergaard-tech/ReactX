import './style.css';
import { App } from './app';
import { renderHome } from './screens/home';
import { renderSoloSettings, renderSoloRun } from './screens/solo';
import { renderPairHome } from './screens/pairHome';
import { renderPairLobby } from './screens/pairLobby';
import { renderPairRun } from './screens/pairRun';
import { renderIdeas } from './screens/ideas';

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
