import type { ColorId } from './colors';
import { DEFAULT_RELAY_URL } from './config';

export interface DrillSettings {
  minIntervalMs: number;
  maxIntervalMs: number;
  palette: ColorId[];
  avoidImmediateRepeat: boolean;
  countdownSeconds: number;
  soundCue: boolean;
  vibrationCue: boolean;
  showRepCounter: boolean;
  colorBlindLabels: boolean;
  /** Viser et tal (1-9) oveni farven, så spilleren skal sige både farve og tal. */
  showNumbers: boolean;
}

export const DEFAULT_SETTINGS: DrillSettings = {
  minIntervalMs: 1500,
  maxIntervalMs: 3500,
  palette: ['blue', 'yellow', 'red', 'green'],
  avoidImmediateRepeat: true,
  countdownSeconds: 3,
  soundCue: false,
  vibrationCue: false,
  showRepCounter: true,
  colorBlindLabels: false,
  showNumbers: false,
};

const SETTINGS_KEY = 'reactx.settings.v1';
const SERVER_URL_KEY = 'reactx.serverUrl.v1';

/**
 * Når appen selv er hentet fra den lokale parrings-server (server.mjs
 * server også appen, når "dist/" findes – se kommentaren der), er siden
 * åbnet over almindelig http://, mens Vercel/Netlify altid serverer https://.
 * Ud fra det kan vi automatisk regne den rigtige ws://-adresse ud, uden at
 * nogen skal skrive noget ind – og det er samtidig den adresse der undgår
 * "mixed content"-blokering af ws:// fra en https-side.
 */
export function detectLocalRelayUrl(): string {
  if (typeof window === 'undefined') return '';
  if (window.location.protocol !== 'http:') return '';
  return `ws://${window.location.host}`;
}

export function hasAutoServerUrl(): boolean {
  return DEFAULT_RELAY_URL.trim().length > 0 || detectLocalRelayUrl().length > 0;
}

export function loadSettings(): DrillSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: DrillSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadServerUrl(): string {
  // Auto-detektionen går forud for en evt. gemt værdi fra en tidligere
  // session et andet sted (fx den offentlige Vercel-adresse) – ellers
  // risikerer man at hænge fast på en forkert/forældet adresse, netop det
  // problem der opstod, da appen blev åbnet lokalt med en gammel gemt værdi.
  const autoLocal = detectLocalRelayUrl();
  if (autoLocal) return autoLocal;
  return localStorage.getItem(SERVER_URL_KEY) ?? DEFAULT_RELAY_URL;
}

export function saveServerUrl(url: string): void {
  localStorage.setItem(SERVER_URL_KEY, url);
}
