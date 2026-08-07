// Genererer app-ikoner uden eksterne dependencies (rå PNG-encoder + zlib).
// Design: et "reaktions-hjul" – en cirkel delt i 4 farvede kvadranter på en
// mørk, helt uigennemsigtig baggrund (ingen alpha), så filerne også er
// klar til App Store Connects 1024×1024-ikon, som Apple kræver uden
// transparens og uden forudrundede hjørner (iOS runder selv hjørnerne af).
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const BG = [5, 8, 15];
const BLUE = [37, 99, 235];
const YELLOW = [234, 179, 8];
const RED = [220, 38, 38];
const GREEN = [22, 163, 74];
const RING = [22, 27, 38]; // svag ring mellem baggrund og hjul, for dybde

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

/**
 * Tegner "reaktions-hjulet": en cirkel delt i 4 farvede kvadranter (roteret
 * 45° så grænserne går diagonalt, mere dynamisk end lige op/ned-delinger),
 * med et blødt anti-aliaseret kant og en tynd ring for dybde, på en helt
 * uigennemsigtig mørk baggrund.
 */
function drawIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;
  const ringR = r * 1.08;
  const quadrants = [BLUE, YELLOW, RED, GREEN]; // med uret fra kl. 1-2-position

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let color = BG;

      if (dist <= ringR + 1) {
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += Math.PI * 2;
        // Roter 45° så kvadrant-grænserne går diagonalt (kl. 1:30, 4:30, 7:30, 10:30).
        const seg = Math.floor((((angle + Math.PI / 4) % (Math.PI * 2)) / (Math.PI * 2)) * 4);
        const wheelColor = quadrants[seg];

        if (dist <= r) {
          color = wheelColor;
          // Blødt anti-aliaseret ydre kant på selve hjulet.
          const edge = r - dist;
          if (edge < 1) color = mix(BG, wheelColor, Math.max(0, edge));
        } else {
          // Tynd mørk ring mellem hjul og baggrund, for lidt dybde/kontrast.
          const t = (dist - r) / (ringR - r);
          color = mix(RING, BG, Math.min(1, Math.max(0, t)));
        }
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
