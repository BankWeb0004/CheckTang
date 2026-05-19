const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Icon sizes needed for different platforms
const ICON_SIZES = {
  android: [192, 512],
  ios: [180, 167, 152],
  web: [192, 512, 256, 128, 64, 32],
  universal: [1024],
};

const allSizes = [...new Set([
  ...ICON_SIZES.android,
  ...ICON_SIZES.ios,
  ...ICON_SIZES.web,
  ...ICON_SIZES.universal,
])].sort((a, b) => a - b);

function createIcon(size) {
  const center = size / 2;
  const data = Buffer.alloc(size * size * 4, 255);

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (y * size + x) * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = a;
  }

  function drawCircle(cx, cy, r, red, green, blue, alpha = 255) {
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
        const dist2 = dx * dx + dy2;
        if (dist2 <= r2) {
          const dist = Math.sqrt(dist2);
          const ratio = dist / r;
          const a = Math.max(0, Math.min(255, Math.round(alpha * (1 - Math.max(0, ratio - 0.98) * 50))));
          setPixel(x, y, red, green, blue, a);
        }
      }
    }
  }

  function drawLine(x1, y1, x2, y2, thickness, red, green, blue, alpha = 255) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(len) * 2;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + dx * t;
      const y = y1 + dy * t;

      const r2 = thickness * thickness;
      const minX = Math.max(0, Math.floor(x - thickness));
      const maxX = Math.min(size - 1, Math.ceil(x + thickness));
      const minY = Math.max(0, Math.floor(y - thickness));
      const maxY = Math.min(size - 1, Math.ceil(y + thickness));

      for (let py = minY; py <= maxY; py++) {
        const dy2 = py - y;
        for (let px = minX; px <= maxX; px++) {
          const dx2 = px - x;
          if (dx2 * dx2 + dy2 * dy2 <= r2) {
            setPixel(px, py, red, green, blue, alpha);
          }
        }
      }
    }
  }

  // Dark background
  for (let i = 0; i < size * size * 4; i += 4) {
    data[i] = 26;
    data[i + 1] = 26;
    data[i + 2] = 46;
    data[i + 3] = 255;
  }

  // Scale from base 120 to target size
  const scale = size / 120;
  const offset = (size - 120 * scale) / 2;

  // Grid pattern at bottom
  const gridStart = (72 - offset / scale) * scale + offset;
  const gridThickness = 0.5 * scale;
  for (let i = 0; i < 5; i++) {
    drawLine(20 * scale + offset, gridStart + i * 4 * scale, 100 * scale + offset, gridStart + i * 4 * scale, gridThickness, 0, 200, 255, 60);
    drawLine(20 * scale + offset + i * 16 * scale, gridStart, 20 * scale + offset + i * 16 * scale, gridStart + 16 * scale, gridThickness, 0, 200, 255, 60);
  }

  // Large magnifying glass
  const largeMagX = 50 * scale + offset;
  const largeMagY = 35 * scale + offset;
  const largeRadius = 16 * scale;
  drawCircle(largeMagX, largeMagY, largeRadius, 0, 150, 255, 220);
  drawLine(largeMagX + largeRadius * 0.7, largeMagY + largeRadius * 0.7, largeMagX + largeRadius * 1.35, largeMagY + largeRadius * 1.35, 2.5 * scale, 0, 150, 255, 220);

  // Small magnifying glass
  const smallMagX = 72 * scale + offset;
  const smallMagY = 25 * scale + offset;
  const smallRadius = 10 * scale;
  drawCircle(smallMagX, smallMagY, smallRadius, 0, 180, 255, 200);
  drawLine(smallMagX + smallRadius * 0.7, smallMagY + smallRadius * 0.7, smallMagX + smallRadius * 1.3, smallMagY + smallRadius * 1.3, 2 * scale, 0, 180, 255, 200);

  // Accent circle
  drawCircle(52 * scale + offset, 18 * scale + offset, 3.5 * scale, 0, 200, 255, 255);

  return data;
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

function createPNG(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = createIcon(size);
  const compressed = zlib.deflateSync(idat);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate all sizes
const outputDir = path.join(__dirname, 'assets', 'icons');
ensureDir(outputDir);

console.log('Generating CheckTang Neon icons...');

allSizes.forEach((size) => {
  const png = createPNG(size);
  const filename = path.join(outputDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`✓ Generated ${size}x${size}px icon`);
});

// Generate main icon for reference
const mainIcon = createPNG(1024);
fs.writeFileSync(path.join(__dirname, 'assets', 'icon-only.png'), mainIcon);
console.log('✓ Generated main icon-only.png');

console.log('\n✅ Icon generation complete!');
console.log('\nGenerated icons:');
console.log(`• Android: ${ICON_SIZES.android.join(', ')}px`);
console.log(`• iOS: ${ICON_SIZES.ios.join(', ')}px`);
console.log(`• Web: ${ICON_SIZES.web.join(', ')}px`);
console.log(`• Universal: ${ICON_SIZES.universal.join(', ')}px`);
