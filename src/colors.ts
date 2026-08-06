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

/**
 * "Pose-shuffle": hvert element i listen optræder præcis én gang pr. omgang
 * gennem posen, i ny tilfældig rækkefølge, før posen blandes igen. Det
 * sikrer at rækkefølgen aldrig er den samme fra træning til træning, at
 * intet element kommer sjældnere end de andre, og at man aldrig får det
 * samme element to gange i træk – heller ikke hen over posens grænse.
 * Bruges til både farver ("Undgå samme farve to gange i træk") og de
 * valgfrie tal oveni farven.
 */
export function createSequencer<T>(items: T[]): () => T {
  let bag: T[] = [];
  let last: T | null = null;

  function refill(): void {
    bag = [...items];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    if (bag.length > 1 && bag[0] === last) {
      [bag[0], bag[1]] = [bag[1], bag[0]];
    }
  }

  return function next(): T {
    if (items.length === 0) throw new Error('Tom liste');
    if (bag.length === 0) refill();
    last = bag.pop() as T;
    return last;
  };
}

/** Tal-puljen der bruges når "Vis tal oveni farven" er slået til. */
export const NUMBER_POOL: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
