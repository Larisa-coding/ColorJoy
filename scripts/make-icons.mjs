import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}

const crc = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const name = Buffer.from(type);
  const sum = Buffer.alloc(4);
  sum.writeUInt32BE(crc(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, sum]);
};

const png = (size, pixel) => {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = pixel(x, y, size);
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const icon = (size, pad) =>
  png(size, (x, y) => {
    const px = x / (size - 1);
    const py = y / (size - 1);
    const inset = pad ? 0.08 : 0;
    const radius = 0.22;
    const nx = Math.abs(px - 0.5) * 2;
    const ny = Math.abs(py - 0.5) * 2;
    const outside = px < inset || py < inset || px > 1 - inset || py > 1 - inset;
    const dx = Math.max(nx - (1 - radius * 2), 0);
    const dy = Math.max(ny - (1 - radius * 2), 0);
    if (outside || dx * dx + dy * dy > radius * radius) return [0, 0, 0, 0];
    const face = Math.hypot(px - 0.5, py - 0.46) < 0.22;
    if (face) {
      const eye = Math.hypot(px - 0.43, py - 0.44) < 0.025 || Math.hypot(px - 0.57, py - 0.44) < 0.025;
      return eye ? [44, 39, 64, 255] : [255, 255, 255, 255];
    }
    const dots = [
      [0.28, 0.72, 255, 107, 147],
      [0.44, 0.78, 108, 140, 255],
      [0.6, 0.72, 255, 196, 87],
      [0.74, 0.64, 94, 214, 168],
    ];
    for (const [cx, cy, r, g, b] of dots) {
      if (Math.hypot(px - cx, py - cy) < 0.055) return [r, g, b, 255];
    }
    const mix = px * 0.35 + py * 0.15;
    return [255, Math.round(214 - mix * 40), Math.round(230 - mix * 20), 255];
  });

writeFileSync('public/icons/icon-192.png', icon(192, false));
writeFileSync('public/icons/icon-512.png', icon(512, false));
writeFileSync('public/icons/icon-512-maskable.png', icon(512, true));
