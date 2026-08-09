/**
 * Små, selvstændige streg-ikoner (inline SVG) i samme minimale stil som
 * resten af appen. Holdt som rene strenge uden eksterne ikon-bibliotek-
 * afhængigheder.
 */
const base = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export const icons = {
  tripod: base(
    '<rect x="8" y="3" width="8" height="12" rx="2"/><path d="M12 15v3M12 18l-5 4M12 18l5 4M9 21h6"/>'
  ),
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
} as const;

export type IconName = keyof typeof icons;
