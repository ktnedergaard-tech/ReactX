// ReactX relay-server
// -------------------
// Minimal, dependency-let (kun `ws`) WebSocket-server der lader op til 3
// telefoner parre sig i et "rum" (4-tegns kode) og holder dem synkroniseret:
// værtens indstillinger + start/pause/stop bliver sendt videre, og selve
// farve-timeren har sin "sandhed" her på serveren (ikke på telefonerne), så
// alle telefoner skifter farve på nøjagtig samme tidspunkt uafhængigt af
// forskelle i klokkeslæt/ydelse på de enkelte telefoner.
//
// Brug helst server/start-mac.command eller server/start-windows.bat i
// stedet for at køre denne fil direkte – de bygger også selve appen først.
//
// Kør manuelt: (fra repo-roden) npm install && npm run build, derefter
// (fra /server) npm install && npm start   (lytter på PORT, default 8080).
// Hvis dist/ (den byggede app) findes, server denne proces BÅDE appen og
// parringen på samme adresse – praktisk til en bærbar på samme wifi som
// telefonerne, hvis banen ikke har god mobildækning. Hvis dist/ ikke findes
// (fx ved cloud-deploy på Render/Fly/Railway – se README.md), virker
// processen kun som ren parrings-server for en app hostet et andet sted
// (fx Vercel).

import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { randomBytes } from 'node:crypto';
import { networkInterfaces, hostname } from 'node:os';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import qrcode from 'qrcode-terminal';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const MAX_SLOTS = 3;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // uden 0/O/1/I for at undgå forveksling
const ROOM_TTL_MS = 4 * 60 * 60 * 1000; // ryd forladte rum efter 4 timer

// Hvis appen er bygget (npm run build i repo-roden), ligger den her. Når
// mappen findes, server denne proces også selve appen som almindelige
// http(s)-sider – se kommentaren ved createServer() for hvorfor det er
// afgørende for at "Par sammen" kan virke lokalt uden internet.
const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const HAS_BUILT_APP = existsSync(join(DIST_DIR, 'index.html'));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const DEFAULT_SETTINGS = {
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

const NUMBER_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** @type {Map<string, Room>} */
const rooms = new Map();

function genCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function genId() {
  return randomBytes(8).toString('hex');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Vælg N forskellige værdier fra en pulje (bruges til både farver og tal),
 * så ingen af de tilsluttede telefoner viser det samme samtidig. Falder
 * tilbage til tilfældig (med mulige gentagelser) hvis puljen er mindre end N.
 */
function pickDistinct(pool, n) {
  if (pool.length === 0) return [];
  if (pool.length >= n) {
    return shuffle(pool).slice(0, n);
  }
  return Array.from({ length: n }, () => pool[Math.floor(Math.random() * pool.length)]);
}

class Room {
  constructor(code) {
    this.code = code;
    /** @type {Map<number, {ws: import('ws').WebSocket, clientId: string}>} */
    this.slots = new Map();
    this.hostSlot = 0;
    this.settings = { ...DEFAULT_SETTINGS };
    this.status = 'lobby'; // lobby | countdown | running | paused | stopped
    this.repIndex = 0;
    this.tickTimer = null;
    this.countdownTimer = null;
    this.lastTouched = Date.now();
  }

  connectedSlots() {
    return [...this.slots.keys()].sort((a, b) => a - b);
  }

  freeSlot() {
    for (let s = 0; s < MAX_SLOTS; s++) if (!this.slots.has(s)) return s;
    return -1;
  }

  broadcast(msg, exceptWs) {
    const raw = JSON.stringify(msg);
    for (const { ws } of this.slots.values()) {
      if (ws !== exceptWs && ws.readyState === ws.OPEN) ws.send(raw);
    }
  }

  sendTo(slot, msg) {
    const entry = this.slots.get(slot);
    if (entry && entry.ws.readyState === entry.ws.OPEN) entry.ws.send(JSON.stringify(msg));
  }

  broadcastPresence() {
    this.broadcast({
      type: 'presence',
      connectedSlots: this.connectedSlots(),
      hostSlot: this.hostSlot,
      youAreHost: false, // overskrives pr. klient nedenfor
    });
    // youAreHost er klient-specifik, så send en individuel udgave i stedet:
    for (const slot of this.slots.keys()) {
      this.sendTo(slot, {
        type: 'presence',
        connectedSlots: this.connectedSlots(),
        hostSlot: this.hostSlot,
        youAreHost: slot === this.hostSlot,
      });
    }
  }

  broadcastSettings() {
    this.broadcast({ type: 'settings', settings: this.settings });
  }

  setStatus(status) {
    this.status = status;
    this.broadcast({ type: 'status', status });
  }

  startDrill() {
    if (this.slots.size === 0) return;
    this.clearTimers();
    let n = this.settings.countdownSeconds;
    this.repIndex = 0;
    if (n <= 0) {
      this.beginRunning();
      return;
    }
    this.setStatus('countdown');
    this.broadcast({ type: 'countdown', secondsLeft: n });
    this.countdownTimer = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(this.countdownTimer);
        this.beginRunning();
      } else {
        this.broadcast({ type: 'countdown', secondsLeft: n });
      }
    }, 1000);
  }

  beginRunning() {
    this.setStatus('running');
    this.tick();
  }

  tick() {
    const slots = this.connectedSlots();
    if (slots.length === 0) return;
    // Farver OG tal vælges hver især som distinkte værdier på tværs af de
    // tilsluttede telefoner, så ingen to telefoner nogensinde viser samme
    // farve eller samme tal samtidig.
    const colors = pickDistinct(this.settings.palette, slots.length);
    const numbers = this.settings.showNumbers ? pickDistinct(NUMBER_POOL, slots.length) : null;
    this.repIndex += 1;
    slots.forEach((slot, i) => {
      this.sendTo(slot, { type: 'color', color: colors[i], repIndex: this.repIndex, number: numbers ? numbers[i] : undefined });
    });

    const { minIntervalMs, maxIntervalMs } = this.settings;
    const delay = minIntervalMs + Math.random() * Math.max(0, maxIntervalMs - minIntervalMs);
    this.tickTimer = setTimeout(() => {
      if (this.status === 'running') this.tick();
    }, delay);
  }

  pauseDrill() {
    if (this.status !== 'running') return;
    clearTimeout(this.tickTimer);
    this.setStatus('paused');
  }

  resumeDrill() {
    if (this.status !== 'paused') return;
    this.setStatus('running');
    this.tick();
  }

  stopDrill() {
    this.clearTimers();
    this.setStatus('stopped');
  }

  clearTimers() {
    clearTimeout(this.tickTimer);
    clearInterval(this.countdownTimer);
  }
}

function handleMessage(ws, room, msg) {
  switch (msg.type) {
    case 'settings': {
      if (ws.slot !== room.hostSlot) return;
      if (msg.settings && typeof msg.settings === 'object') {
        room.settings = { ...room.settings, ...msg.settings };
        room.broadcastSettings();
      }
      return;
    }
    case 'start':
      if (ws.slot === room.hostSlot) room.startDrill();
      return;
    case 'pause':
      if (ws.slot === room.hostSlot) room.pauseDrill();
      return;
    case 'resume':
      if (ws.slot === room.hostSlot) room.resumeDrill();
      return;
    case 'stop':
      if (ws.slot === room.hostSlot) room.stopDrill();
      return;
    case 'leave':
      removeFromRoom(ws);
      return;
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      return;
  }
}

function removeFromRoom(ws) {
  const room = rooms.get(ws.roomCode);
  if (!room) return;
  const entry = room.slots.get(ws.slot);
  if (entry && entry.ws === ws) {
    room.slots.delete(ws.slot);
    room.lastTouched = Date.now();
    if (room.slots.size === 0) {
      room.clearTimers();
      rooms.delete(room.code);
      return;
    }
    // Hvis værten forlader, overtager den næste tilsluttede telefon.
    if (ws.slot === room.hostSlot) {
      room.hostSlot = Math.min(...room.connectedSlots());
    }
    room.broadcastPresence();
  }
}

// Server selve appen (dist/) hvis den er bygget – ellers et simpelt
// health-check-svar (fx når denne proces kun kører som cloud relay-server,
// hvor appen i stedet hostes separat på Vercel/Netlify).
//
// Hvorfor: mobilbrowsere blokerer "mixed content" – en https-side (som
// Vercel-udgaven) må ikke åbne en almindelig ws://-forbindelse til en lokal
// server uden TLS. Ved at lade DENNE proces også vise appen over almindelig
// http, kommer siden og WebSocket-forbindelsen fra samme (ukrypterede)
// oprindelse, så telefonerne aldrig rammer den blokering – og appen kan
// selv regne serverens adresse ud fra den side, den blev åbnet fra, uden at
// nogen skal skrive en adresse ind.
async function serveStaticFile(req, res) {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    let filePath = join(DIST_DIR, pathname);

    if (!filePath.startsWith(DIST_DIR)) {
      res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Ugyldig sti');
      return;
    }

    let stats;
    try {
      stats = await stat(filePath);
    } catch {
      stats = null;
    }
    if (!stats || stats.isDirectory()) {
      // SPA-fallback: appen har ingen server-side ruter, så ukendte stier får index.html.
      filePath = join(DIST_DIR, 'index.html');
    }

    const data = await readFile(filePath);
    const contentType = MIME_TYPES[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'content-type': contentType });
    res.end(data);
  } catch {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Serverfejl');
  }
}

const server = createServer((req, res) => {
  if (HAS_BUILT_APP) {
    void serveStaticFile(req, res);
    return;
  }
  // Simpelt health-check endpoint, praktisk for hosting-platforme (Render m.fl.)
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(`ReactX relay-server kører. Aktive rum: ${rooms.size}\n`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    if (msg.type === 'create') {
      const code = genCode();
      const room = new Room(code);
      rooms.set(code, room);
      const clientId = genId();
      room.slots.set(0, { ws, clientId });
      ws.roomCode = code;
      ws.slot = 0;
      ws.clientId = clientId;
      ws.send(JSON.stringify({ type: 'created', code, clientId, slot: 0 }));
      room.broadcastPresence();
      return;
    }

    if (msg.type === 'join') {
      const code = String(msg.code || '').toUpperCase();
      const room = rooms.get(code);
      if (!room) return ws.send(JSON.stringify({ type: 'error', message: 'Rum ikke fundet. Tjek koden.' }));
      const slot = room.freeSlot();
      if (slot === -1) return ws.send(JSON.stringify({ type: 'error', message: 'Rummet er fuldt (maks. 3 telefoner).' }));
      const clientId = genId();
      room.slots.set(slot, { ws, clientId });
      ws.roomCode = code;
      ws.slot = slot;
      ws.clientId = clientId;
      room.lastTouched = Date.now();
      ws.send(JSON.stringify({ type: 'joined', code, clientId, slot }));
      ws.send(JSON.stringify({ type: 'settings', settings: room.settings }));
      room.broadcastPresence();
      return;
    }

    if (msg.type === 'rejoin') {
      const code = String(msg.code || '').toUpperCase();
      const room = rooms.get(code);
      if (!room) return ws.send(JSON.stringify({ type: 'error', message: 'Rum ikke fundet – opret eller deltag igen.' }));
      let foundSlot = -1;
      for (const [slot, entry] of room.slots) {
        if (entry.clientId === msg.clientId) {
          foundSlot = slot;
          break;
        }
      }
      if (foundSlot === -1) {
        // Pladsen er måske overtaget af en anden i mellemtiden – prøv en ledig plads.
        foundSlot = room.freeSlot();
        if (foundSlot === -1) return ws.send(JSON.stringify({ type: 'error', message: 'Rummet er fuldt (maks. 3 telefoner).' }));
      }
      room.slots.set(foundSlot, { ws, clientId: msg.clientId });
      ws.roomCode = code;
      ws.slot = foundSlot;
      ws.clientId = msg.clientId;
      room.lastTouched = Date.now();
      ws.send(JSON.stringify({ type: 'rejoined', code, clientId: msg.clientId, slot: foundSlot }));
      ws.send(JSON.stringify({ type: 'settings', settings: room.settings }));
      ws.send(JSON.stringify({ type: 'status', status: room.status }));
      room.broadcastPresence();
      return;
    }

    // Alle øvrige beskeder kræver at klienten allerede er i et rum.
    const room = rooms.get(ws.roomCode);
    if (room) handleMessage(ws, room, msg);
  });

  ws.on('close', () => removeFromRoom(ws));
});

// Ping/pong for at opdage døde forbindelser (fx telefon der mister wifi uden ordentlig lukning).
const heartbeat = setInterval(() => {
  for (const client of wss.clients) {
    if (client.isAlive === false) {
      client.terminate();
      continue;
    }
    client.isAlive = false;
    client.ping();
  }
}, 30000);

// Ryd forladte/gamle rum.
const roomCleanup = setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (room.slots.size === 0 && now - room.lastTouched > 60000) rooms.delete(code);
    else if (now - room.lastTouched > ROOM_TTL_MS) {
      room.clearTimers();
      rooms.delete(code);
    }
  }
}, 60000);

server.on('close', () => {
  clearInterval(heartbeat);
  clearInterval(roomCleanup);
});

/** Finder computerens lokale netværks-IP'er, så man ikke selv skal lede efter dem. */
function localAddresses() {
  const nets = networkInterfaces();
  const addrs = [];
  for (const ifaceList of Object.values(nets)) {
    for (const net of ifaceList ?? []) {
      if (net.family === 'IPv4' && !net.internal) addrs.push(net.address);
    }
  }
  return addrs;
}

server.listen(PORT, () => {
  const addrs = localAddresses();
  console.log(`ReactX relay-server lytter på port ${PORT}`);
  console.log('');

  if (!HAS_BUILT_APP) {
    console.log('⚠️  Appen er ikke bygget (mangler dist/) – denne proces virker kun som');
    console.log('   ren parrings-server. Kør "npm run build" i repo-roden først, eller brug');
    console.log('   start-mac.command / start-windows.bat, som gør det automatisk.');
    console.log('');
  }

  if (addrs.length === 0) {
    console.log('   Kunne ikke finde en lokal netværksadresse automatisk – tjek at computeren er på wifi.');
    console.log('');
  } else {
    const mainAddr = addrs[0];
    const mainUrl = HAS_BUILT_APP ? `http://${mainAddr}:${PORT}` : `ws://${mainAddr}:${PORT}`;

    console.log('📱 Åbn denne adresse i Safari på ALLE telefoner (samme wifi/hotspot):');
    console.log('');
    console.log(`   ${mainUrl}`);
    console.log('');
    console.log('   ...eller scan denne QR-kode med kameraet i stedet for at skrive den:');
    console.log('');
    qrcode.generate(mainUrl, { small: true });
    console.log('');

    if (addrs.length > 1) {
      console.log('   Andre adresser fundet på denne computer (brug kun hvis den ovenfor ikke virker):');
      for (const addr of addrs.slice(1)) {
        console.log(`   ${HAS_BUILT_APP ? 'http' : 'ws'}://${addr}:${PORT}`);
      }
      console.log('');
    }

    console.log(`   Mac-tip: hvis IP-adressen ændrer sig fra gang til gang, kan I ofte også`);
    console.log(`   bruge ${HAS_BUILT_APP ? 'http' : 'ws'}://${hostname()}:${PORT} i stedet.`);
    console.log('');
  }

  console.log('   Luk dette vindue for at stoppe serveren igen.');
  console.log('');
});
