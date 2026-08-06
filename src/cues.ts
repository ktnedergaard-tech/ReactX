// Lyd- og vibrationssignal ved farveskift. Slået fra som standard, fordi
// øvelsen handler om at spilleren selv skal opdage skiftet visuelt — men
// kan slås til af coachen, fx til at følge tempoet uden at kigge, eller til
// varianter hvor spilleren træner med lukkede øjne indtil signalet.
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

/** Skal kaldes fra en bruger-tap (fx "Start"-knappen), da iOS kræver et gesture for at låse lyd op. */
export function unlockAudio(): void {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* lyd er ikke kritisk for appen */
  }
}

export function playBeep(): void {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch {
    /* ignore */
  }
}

export function vibrate(): void {
  try {
    navigator.vibrate?.(60);
  } catch {
    /* ignore */
  }
}
