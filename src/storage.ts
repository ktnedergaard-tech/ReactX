import type { ColorId } from './colors';

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
};

const SETTINGS_KEY = 'reactx.settings.v1';
const SERVER_URL_KEY = 'reactx.serverUrl.v1';

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
  return localStorage.getItem(SERVER_URL_KEY) ?? '';
}

export function saveServerUrl(url: string): void {
  localStorage.setItem(SERVER_URL_KEY, url);
}
