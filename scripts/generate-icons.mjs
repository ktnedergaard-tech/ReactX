// Genererer app-ikoner uden eksterne dependencies (rå PNG-encoder + zlib).
// Design: mørk baggrund med et 2x2 gitter i de fire trænings-farver.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const BG = [5, 7, 12];
const BLUE = [37, 99, 235];
const YELLOW = [234, 179, 8];
const RED = [220, 38, 38];
const GREEN = [22, 163, 74];

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

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawIcon(size, { padRatio = 0, radiusRatio = 0.22 } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const pad = Math.round(size * padRatio);
  const inner = size - pad * 2;
  const r = Math.round(size * radiusRatio);
  const cx0 = pad, cy0 = pad, cx1 = pad + inner, cy1 = pad + inner;

  const inRoundedRect = (x, y) => {
    if (x < cx0 || x >= cx1 || y < cy0 || y >= cy1) return false;
    const nx = x < cx0 + r ? cx0 + r : x >= cx1 - r ? cx1 - r : x;
    const ny = y < cy0 + r ? cy0 + r : y >= cy1 - r ? cy1 - r : y;
    const dx = x - nx, dy = y - ny;
    return dx * dx + dy * dy <= r * r + 1;
  };

  const gap = Math.max(2, Math.round(inner * 0.045));
  const cellW = Math.floor((inner - gap) / 2);
  const cellH = Math.floor((inner - gap) / 2);
  const cellR = Math.round(cellW * 0.16);

  const cells = [
    { x: cx0, y: cy0, color: BLUE },
    { x: cx0 + cellW + gap, y: cy0, color: YELLOW },
    { x: cx0, y: cy0 + cellH + gap, color: RED },
    { x: cx0 + cellW + gap, y: cy0 + cellH + gap, color: GREEN },
  ];

  const inRoundedCell = (x, y, cell) => {
    const { x: cx, y: cy } = cell;
    if (x < cx || x >= cx + cellW || y < cy || y >= cy + cellH) return false;
    const nx = x < cx + cellR ? cx + cellR : x >= cx + cellW - cellR ? cx + cellW - cellR : x;
    const ny = y < cy + cellR ? cy + cellR : y >= cy + cellH - cellR ? cy + cellH - cellR : y;
    const dx = x - nx, dy = y - ny;
    return dx * dx + dy * dy <= cellR * cellR + 1;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let color = null;
      if (inRoundedRect(x, y)) {
        color = BG;
        for (const cell of cells) {
          if (inRoundedCell(x, y, cell)) {
            color = cell.color;
            break;
          }
        }
      }
      if (color) {
        rgba[i] = color[0];
        rgba[i + 1] = color[1];
        rgba[i + 2] = color[2];
        rgba[i + 3] = 255;
      } else {
        rgba[i] = 0;
        rgba[i + 1] = 0;
        rgba[i + 2] = 0;
        rgba[i + 3] = 0;
      }
    }
  }
  return rgba;
}

function writeIcon(name, size, opts) {
  const rgba = drawIcon(size, opts);
  const png = encodePNG(size, size, rgba);
  writeFileSync(join(outDir, name), png);
  console.log('wrote', name, `${size}x${size}`);
}

writeIcon('icon-32.png', 32, { radiusRatio: 0.22 });
writeIcon('icon-192.png', 192, { radiusRatio: 0.22 });
writeIcon('icon-512.png', 512, { radiusRatio: 0.22 });
writeIcon('apple-touch-icon-180.png', 180, { radiusRatio: 0.22 });
// Maskable ikon: indhold skal ligge inden for de midterste ~80%, baggrunden fylder hele lærredet.
writeIcon('icon-maskable-512.png', 512, { padRatio: 0.1, radiusRatio: 0 });

console.log('Ikoner genereret i', outDir);
