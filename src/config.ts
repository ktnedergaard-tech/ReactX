/**
 * Indbygget standard-adresse for parrings-serveren ("Par sammen"). Når denne
 * er sat, behøver spillerne aldrig selv indtaste en server-adresse — feltet
 * udfyldes automatisk, og "Opret rum"/"Deltag i rum" virker med det samme.
 *
 * Sættes typisk én gang, når relay-serveren (se /server) er deployet et sted
 * (fx Render via render.yaml i repo-roden). Se README.md, afsnittet
 * "Parrings-server", for hvordan.
 */
export const DEFAULT_RELAY_URL = 'wss://reactx-relay.onrender.com';
