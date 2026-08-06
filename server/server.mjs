// ReactX relay-server
// -------------------
// Minimal, dependency-let (kun `ws`) WebSocket-server der lader op til 3
// telefoner parre sig i et "rum" (4-tegns kode) og holder dem synkroniseret:
// værtens indstillinger + start/pause/stop bliver sendt videre, og selve
// farve-timeren har sin "sandhed" her på serveren (ikke på telefonerne), så
// alle telefoner skifter farve på nøjagtig samme tidspunkt uafhængigt af
// forskelle i klokkeslæt/ydelse på de enkelte telefoner.
//
// Kør lokalt:   npm install && npm start   (lytter på PORT, default 8080)
// Deploy gratis fx på Render/Fly/Railway – se README.md i repo-roden.
// Kan også køres på en bærbar på samme wifi/hotspot som telefonerne, hvis
// banen ikke har god mobildækning: telefonerne peger så på
// ws://<den bærbares lokale ip>:8080 i stedet for en cloud-adresse.

import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { randomBytes } from 'node:crypto';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const MAX_SLOTS = 3;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // uden 0/O/1/I for at undgå forveksling
const ROOM_TTL_MS = 4 * 60 * 60 * 1000; // ryd forladte rum efter 4 timer

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
};

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

function pickDistinctColors(palette, n) {
  if (palette.length === 0) return [];
  if (palette.length >= n) {
    const shuffled = [...palette].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  }
  return Array.from({ length: n }, () => palette[Math.floor(Math.random() * palette.length)]);
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
    const colors = pickDistinctColors(this.settings.palette, slots.length);
    this.repIndex += 1;
    slots.forEach((slot, i) => {
      this.sendTo(slot, { type: 'color', color: colors[i], repIndex: this.repIndex });
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

const server = createServer((req, res) => {
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

server.listen(PORT, () => {
  console.log(`ReactX relay-server lytter på port ${PORT}`);
});
