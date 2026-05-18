const fs = require('fs');
const zlib = require('zlib');
const size = 1024;
const center = size / 2;
const data = Buffer.alloc(size * size * 4, 255);

function setPixel(x, y, r, g, b, a = 255) {
  const idx = (y * size + x) * 4;
  data[idx] = r;
  data[idx + 1] = g;
  data[idx + 2] = b;
  data[idx + 3] = a;
}

function drawCircle(cx, cy, r) {
  const r2 = r * r;
  const minX = Math.max(0, Math.floor(cx - r));
  const maxX = Math.min(size - 1, Math.ceil(cx + r));
  const minY = Math.max(0, Math.floor(cy - r));
  const maxY = Math.min(size - 1, Math.ceil(cy + r));
  for (let y = minY; y <= maxY; y++) {
    const dy = y - cy;
    const dy2 = dy * dy;
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      if (dx * dx + dy2 <= r2) {
        setPixel(x, y, 0, 0, 0, 255);
      }
    }
  }
}

function setBlack(x, y) {
  const idx = (y * size + x) * 4;
  data[idx] = 0;
  data[idx + 1] = 0;
  data[idx + 2] = 0;
  data[idx + 3] = 255;
}

const coinRadius = 96;
drawCircle(center, center - 140, coinRadius);
drawCircle(center - 130, center + 20, coinRadius);
drawCircle(center + 130, center + 20, coinRadius);

const handleCenterY = center + 280;
const outerRx = 420;
const outerRy = 120;
const innerRx = 320;
const innerRy = 80;
for (let y = 0; y < size; y++) {
  const dyOuter = (y - handleCenterY) / outerRy;
  const dyInner = (y - handleCenterY) / innerRy;
  for (let x = 0; x < size; x++) {
    const dxOuter = (x - center) / outerRx;
    const dxInner = (x - center) / innerRx;
    const outer = dxOuter * dxOuter + dyOuter * dyOuter <= 1;
    const inner = dxInner * dxInner + dyInner * dyInner <= 1;
    if (outer && !inner && y >= handleCenterY - outerRy * 0.4) {
      setBlack(x, y);
    }
  }
}

const rectW = 80;
const rectH = 90;
const rectTop = center - 50;
for (let y = rectTop; y < rectTop + rectH; y++) {
  if (y < 0 || y >= size) continue;
  for (let x = Math.floor(center - rectW / 2); x < Math.ceil(center + rectW / 2); x++) {
    if (x < 0 || x >= size) continue;
    setBlack(x, y);
  }
}

function crc(buf) {
  let c = -1;
  for (let n = 0; n < buf.length; n++) {
    c = (c >>> 8) ^ table[(c ^ buf[n]) & 0xFF];
  }
  return (c ^ -1) >>> 0;
}
const table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xEDB88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  table[n] = c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  const crcValue = crc(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcValue, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function buildPng(width, height, pixelData) {
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const bytesPerLine = width * 4 + 1;
  const raw = Buffer.alloc(bytesPerLine * height);
  for (let y = 0; y < height; y++) {
    raw[y * bytesPerLine] = 0;
    pixelData.copy(raw, y * bytesPerLine + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([
    header,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const png = buildPng(size, size, data);
fs.writeFileSync('assets/icons/app-icon.png', png);
console.log('Created assets/icons/app-icon.png');
