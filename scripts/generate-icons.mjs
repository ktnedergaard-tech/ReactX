// Genererer app-ikoner uden eksterne dependencies (rå PNG-encoder + zlib).
// Design: det store "X" fra ordmærket (mint/teal-gradient) på appens egen
// mørke baggrund – matcher det faktiske logo i appen og på forsiden, i
// stedet for det tidligere "reaktions-hjul". Helt uigennemsigtig baggrund
// (ingen alpha), så filerne også er klar til App Store Connects
// 1024×1024-ikon, som Apple kræver uden transparens og uden forudrundede
// hjørner (iOS runder selv hjørnerne af).
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const BG = [5, 7, 12]; // = --bg
const ACCENT = [22, 217, 172]; // = --accent
const ACCENT_2 = [111, 252, 224]; // = --accent-2

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba, { alpha = true } = {}) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = alpha ? 6 : 2; // 6 = RGBA, 2 = RGB (ingen alpha-kanal overhovedet)
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const channels = alpha ? 4 : 3;
  const stride = width * channels;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    if (alpha) {
      rgba.copy(raw, y * (stride + 1) + 1, y * width * 4, y * width * 4 + width * 4);
    } else {
      // Drop alpha-byte pr. pixel, så filen er ren RGB (Apples krav til App Store-ikonet).
      for (let x = 0; x < width; x++) {
        const src = (y * width + x) * 4;
        const dst = y * (stride + 1) + 1 + x * 3;
        raw[dst] = rgba[src];
        raw[dst + 1] = rgba[src + 1];
        raw[dst + 2] = rgba[src + 2];
      }
    }
  }
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Korteste afstand fra punkt (px,py) til linjestykket A→B. */
function distToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLen2 = abx * abx + aby * aby;
  let t = abLen2 > 0 ? (apx * abx + apy * aby) / abLen2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  const dx = px - cx;
  const dy = py - cy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Tegner det store "X" – to tykke, rundede streger der krydser hinanden,
 * fyldt med samme lodrette mint/teal-gradient som .logo-x i appen – på
 * appens egen mørke baggrund.
 */
function drawIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const pad = size * 0.28;
  const thickness = size * 0.16;
  const half = thickness / 2;

  // De to diagonale streger i X'et, hjørne til hjørne inden for paddingen.
  const a1x = pad, a1y = pad, b1x = size - pad, b1y = size - pad; // "\"
  const a2x = pad, a2y = size - pad, b2x = size - pad, b2y = pad; // "/"

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const px = x + 0.5;
      const py = y + 0.5;

      const d = Math.min(
        distToSegment(px, py, a1x, a1y, b1x, b1y),
        distToSegment(px, py, a2x, a2y, b2x, b2y)
      );

      let color = BG;
      const edge = half - d;
      if (edge > -1) {
        const t = Math.min(1, Math.max(0, (py - pad) / (size - pad * 2)));
        const strokeColor = mix(ACCENT_2, ACCENT, t);
        color = mix(BG, strokeColor, Math.min(1, Math.max(0, edge + 0.5)));
      }

      rgba[i] = Math.round(color[0]);
      rgba[i + 1] = Math.round(color[1]);
      rgba[i + 2] = Math.round(color[2]);
      rgba[i + 3] = 255;
    }
  }
  return rgba;
}

function writeIcon(name, size, { alpha = true } = {}) {
  const rgba = drawIcon(size);
  const png = encodePNG(size, size, rgba, { alpha });
  writeFileSync(join(outDir, name), png);
  console.log('wrote', name, `${size}x${size}`, alpha ? '(RGBA)' : '(RGB, ingen alpha)');
}

writeIcon('icon-32.png', 32);
writeIcon('icon-192.png', 192);
writeIcon('icon-512.png', 512);
writeIcon('apple-touch-icon-180.png', 180);
writeIcon('icon-maskable-512.png', 512);
// Til App Store Connect (uploades manuelt der ved en evt. senere native
// indpakning) – skal være 1024×1024, kvadratisk, UDEN alpha-kanal.
writeIcon('app-store-icon-1024.png', 1024, { alpha: false });

console.log('Ikoner genereret i', outDir);
