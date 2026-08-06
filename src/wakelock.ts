// Screen Wake Lock API – understøttet i Safari fra iOS 16.4. Fejler stille
// på ældre iOS, hvor brugeren i stedet skal skrue ned for "Auto-Lås" i
// Indstillinger, mens de træner (vi gør opmærksom på det i UI'en).
let sentinel: WakeLockSentinel | null = null;

export function isWakeLockSupported(): boolean {
  return 'wakeLock' in navigator;
}

export async function requestWakeLock(): Promise<boolean> {
  if (!isWakeLockSupported()) return false;
  try {
    sentinel = await (navigator as Navigator & { wakeLock: WakeLock }).wakeLock.request('screen');
    sentinel.addEventListener('release', () => {
      sentinel = null;
    });
    return true;
  } catch {
    sentinel = null;
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  try {
    await sentinel?.release();
  } catch {
    /* ignore */
  }
  sentinel = null;
}

// Genopret wake lock når appen bliver synlig igen (iOS frigiver den ved app-skift).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && sentinel === null && wakeLockWanted) {
    void requestWakeLock();
  }
});

let wakeLockWanted = false;
export function setWakeLockWanted(wanted: boolean): void {
  wakeLockWanted = wanted;
  if (wanted) void requestWakeLock();
  else void releaseWakeLock();
}

// --- Minimal type-shim, da TS's lib.dom endnu ikke altid har disse typer ---
interface WakeLockSentinel extends EventTarget {
  released: boolean;
  type: 'screen';
  release: () => Promise<void>;
}
interface WakeLock {
  request: (type: 'screen') => Promise<WakeLockSentinel>;
}
