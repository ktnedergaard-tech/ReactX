export type ColorId = 'blue' | 'yellow' | 'red' | 'green' | 'orange' | 'purple' | 'white' | 'black';

export interface ColorDef {
  id: ColorId;
  label: string; // dansk navn, vises i colorblind-tilstand
  hex: string;
  /** tekstfarve der bruges oven på denne baggrund (til label/UI) */
  contrast: '#000000' | '#ffffff';
}

// De fire "kerne"-farver ekstra mættede/adskilte, så de er lette at kende fra
// hinanden i det perifere syn og for farveblinde spillere (rød/grøn er det
// klassiske problem, så de to er bevidst holdt langt fra hinanden i lysstyrke).
export const CORE_COLORS: ColorDef[] = [
  { id: 'blue', label: 'BLÅ', hex: '#1d4ed8', contrast: '#ffffff' },
  { id: 'yellow', label: 'GUL', hex: '#eab308', contrast: '#000000' },
  { id: 'red', label: 'RØD', hex: '#dc2626', contrast: '#ffffff' },
  { id: 'green', label: 'GRØN', hex: '#16a34a', contrast: '#ffffff' },
];

// Ekstra farver til øget sværhedsgrad / flere spillere.
export const EXTRA_COLORS: ColorDef[] = [
  { id: 'orange', label: 'ORANGE', hex: '#ea580c', contrast: '#ffffff' },
  { id: 'purple', label: 'LILLA', hex: '#7e22ce', contrast: '#ffffff' },
  { id: 'white', label: 'HVID', hex: '#f8fafc', contrast: '#000000' },
  { id: 'black', label: 'SORT', hex: '#0a0a0a', contrast: '#ffffff' },
];

export const ALL_COLORS: ColorDef[] = [...CORE_COLORS, ...EXTRA_COLORS];

export function colorById(id: ColorId): ColorDef {
  const c = ALL_COLORS.find((c) => c.id === id);
  if (!c) throw new Error(`Ukendt farve: ${id}`);
  return c;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Vælg en ny farve der ikke er lig den forrige (hvis der er flere end 1 mulighed). */
export function pickNext(palette: ColorId[], previous: ColorId | null): ColorId {
  if (palette.length === 0) throw new Error('Tom palet');
  if (palette.length === 1) return palette[0];
  let next = pickRandom(palette);
  let guard = 0;
  while (next === previous && guard < 20) {
    next = pickRandom(palette);
    guard++;
  }
  return next;
}

/**
 * Vælg N distinkte farver fra paletten (én pr. tilsluttet telefon), så to
 * telefoner ikke viser samme farve samtidig. Falder tilbage til tilfældig
 * (med mulige gentagelser) hvis paletten er mindre end N.
 */
export function pickDistinct(palette: ColorId[], n: number): ColorId[] {
  if (palette.length >= n) {
    const shuffled = [...palette].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  }
  // For få farver til at dække alle telefoner uden gentagelse.
  return Array.from({ length: n }, () => pickRandom(palette));
}
