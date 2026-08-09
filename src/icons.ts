/**
 * Små, selvstændige streg-ikoner (inline SVG) i samme minimale stil som
 * resten af appen. Holdt som rene strenge uden eksterne ikon-bibliotek-
 * afhængigheder.
 */
const base = (paths: string, viewBox = '0 0 24 24') =>
  `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

/** Samme telefon-på-stativ-tegning som `tripod`, men forskudt `dx` enheder
 * til højre – bruges til at gentage ikonet flere gange i samme SVG uden at
 * skalere det (så hver kopi altid er nøjagtig samme størrelse som originalen). */
const tripodAt = (dx: number) =>
  `<rect x="${8.6 + dx}" y="2" width="6.8" height="12" rx="1.7"/><path d="M${10.6 + dx} 3.7h2.8"/><circle cx="${12 + dx}" cy="12.3" r="0.6" fill="currentColor"/><path d="M${12 + dx} 14l-4.5 7M${12 + dx} 14v7M${12 + dx} 14l4.5 7"/>`;

export const icons = {
  tripod: base(tripodAt(0)),
  eye: base('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'),
  voice: base(
    '<path d="M9 21c1-2 1-4 0-6M4 15c2 .5 3-1 3-3s-1-3.5-3-3"/><path d="M13 4c4 2.4 4 13.2 0 16"/>'
  ),
  target: base('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/>'),
  brain: base(
    '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8A3 3 0 0 0 8 17a3 3 0 0 0 3-3V6a2 2 0 0 0-2-2Z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5.8A3 3 0 0 1 16 17a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Z"/>'
  ),
  branch: base('<path d="M12 3v6M12 9l-6 6M12 9l6 6M6 15v6M18 15v6"/>'),
  trendUp: base('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
  // Nøjagtig samme telefon-på-stativ-ikon som `tripod`, bare gentaget 3
  // gange side om side – hver kopi i samme skala som solo-ikonet.
  multiDevice: base(tripodAt(0) + tripodAt(24) + tripodAt(48), '0 0 72 24'),
  chevron: base('<path d="M9 5l7 7-7 7"/>'),
} as const;

export type IconName = keyof typeof icons;
