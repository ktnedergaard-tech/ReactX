import { ALL_COLORS, CORE_COLORS, EXTRA_COLORS, type ColorId } from '../colors';
import { icons } from '../icons';
import type { DrillSettings } from '../storage';

/**
 * Bygger et indstillings-panel (interval, farvepalette, ekstra funktioner)
 * og kalder onChange, hver gang brugeren ændrer noget. Bruges både til Solo
 * og som værtens indstillinger i Pair-lobbyen.
 */
export function buildSettingsForm(
  container: HTMLElement,
  settings: DrillSettings,
  onChange: (s: DrillSettings) => void
): void {
  const card = document.createElement('div');
  card.className = 'card';

  // --- Interval ---
  card.appendChild(sectionLabel('Tempo'));
  const minField = field(
    'Hurtigst skift',
    `${(settings.minIntervalMs / 1000).toFixed(1)} sek`,
    rangeInput(500, 8000, 100, settings.minIntervalMs, (v) => {
      settings.minIntervalMs = Math.min(v, settings.maxIntervalMs);
      onChange(settings);
      refreshLabels();
    })
  );
  const maxField = field(
    'Langsomst skift',
    `${(settings.maxIntervalMs / 1000).toFixed(1)} sek`,
    rangeInput(500, 8000, 100, settings.maxIntervalMs, (v) => {
      settings.maxIntervalMs = Math.max(v, settings.minIntervalMs);
      onChange(settings);
      refreshLabels();
    })
  );

  function refreshLabels(): void {
    minField.labelValue.textContent = `${(settings.minIntervalMs / 1000).toFixed(1)} sek`;
    maxField.labelValue.textContent = `${(settings.maxIntervalMs / 1000).toFixed(1)} sek`;
    (minField.input as HTMLInputElement).value = String(settings.minIntervalMs);
    (maxField.input as HTMLInputElement).value = String(settings.maxIntervalMs);
  }

  card.append(minField.wrap, maxField.wrap);

  // --- Farvepalette ---
  card.appendChild(sectionLabel('Farver'));
  const paletteLabel = document.createElement('div');
  paletteLabel.className = 'field';
  paletteLabel.innerHTML = `<label><span>Farver i spil</span></label>`;
  const swatches = document.createElement('div');
  swatches.className = 'swatches';

  function renderSwatches(): void {
    swatches.innerHTML = '';
    for (const c of ALL_COLORS) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'swatch' + (settings.palette.includes(c.id) ? ' active' : '');
      el.style.background = c.hex;
      el.style.color = c.contrast;
      el.textContent = c.label;
      el.addEventListener('click', () => toggleColor(c.id));
      swatches.appendChild(el);
    }
  }

  function toggleColor(id: ColorId): void {
    const active = settings.palette.includes(id);
    if (active) {
      // Mindst 2 farver skal altid være aktive, så øvelsen giver mening.
      if (settings.palette.length <= 2) return;
      settings.palette = settings.palette.filter((p) => p !== id);
    } else {
      settings.palette = [...settings.palette, id];
    }
    onChange(settings);
    renderSwatches();
  }

  renderSwatches();
  paletteLabel.appendChild(swatches);
  const hint = document.createElement('div');
  hint.style.fontSize = '0.75rem';
  hint.style.color = 'var(--text-dim)';
  hint.style.marginTop = '8px';
  hint.textContent = `${CORE_COLORS.length} standardfarver + ${EXTRA_COLORS.length} ekstra til sværere øvelser eller flere telefoner.`;
  paletteLabel.appendChild(hint);
  card.appendChild(paletteLabel);

  // --- Toggles (fold-ud, så de mange ekstra-indstillinger ikke fylder
  // hele skærmen som standard) ---
  const extraDetails = document.createElement('details');
  extraDetails.className = 'section-collapse';
  const extraSummary = document.createElement('summary');
  extraSummary.className = 'section-label section-label--toggle';
  extraSummary.innerHTML = `<span>Ekstra</span><span class="section-collapse-chevron">${icons.chevron}</span>`;
  extraDetails.appendChild(extraSummary);

  const toggles = document.createElement('div');
  toggles.className = 'section-collapse-body';
  toggles.appendChild(
    switchRow('Undgå samme farve to gange i træk', settings.avoidImmediateRepeat, (v) => {
      settings.avoidImmediateRepeat = v;
      onChange(settings);
    })
  );
  toggles.appendChild(
    switchRow('Vis tæller (antal skift)', settings.showRepCounter, (v) => {
      settings.showRepCounter = v;
      onChange(settings);
    })
  );
  toggles.appendChild(
    switchRow('Farveblind-hjælp (viser farvenavn som tekst)', settings.colorBlindLabels, (v) => {
      settings.colorBlindLabels = v;
      onChange(settings);
    })
  );
  toggles.appendChild(
    switchRow('Vis tal oveni farven (sig farve + tal)', settings.showNumbers, (v) => {
      settings.showNumbers = v;
      onChange(settings);
    })
  );
  toggles.appendChild(
    switchRow('Lydsignal ved skift', settings.soundCue, (v) => {
      settings.soundCue = v;
      onChange(settings);
    })
  );
  toggles.appendChild(
    switchRow('Vibration ved skift', settings.vibrationCue, (v) => {
      settings.vibrationCue = v;
      onChange(settings);
    })
  );
  extraDetails.appendChild(toggles);
  card.appendChild(extraDetails);

  // --- Nedtælling ---
  card.appendChild(sectionLabel('Opstart'));
  const countdownField = field(
    'Nedtælling før start',
    `${settings.countdownSeconds} sek`,
    rangeInput(0, 10, 1, settings.countdownSeconds, (v) => {
      settings.countdownSeconds = v;
      onChange(settings);
      countdownField.labelValue.textContent = `${v} sek`;
    })
  );
  card.appendChild(countdownField.wrap);

  container.appendChild(card);
}

function sectionLabel(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'section-label';
  el.textContent = text;
  return el;
}

function rangeInput(min: number, max: number, step: number, value: number, onInput: (v: number) => void): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.addEventListener('input', () => onInput(Number(input.value)));
  return input;
}

function field(labelText: string, valueText: string, input: HTMLInputElement) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  const label = document.createElement('label');
  const span = document.createElement('span');
  span.textContent = labelText;
  const labelValue = document.createElement('span');
  labelValue.textContent = valueText;
  label.append(span, labelValue);
  wrap.append(label, input);
  return { wrap, labelValue, input };
}

function switchRow(text: string, initial: boolean, onChange: (v: boolean) => void): HTMLElement {
  const row = document.createElement('label');
  row.className = 'switch-row';
  const span = document.createElement('span');
  span.textContent = text;
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = initial;
  input.addEventListener('change', () => onChange(input.checked));
  row.append(span, input);
  return row;
}
