const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ICON_SIZES = {
  android: [192, 512],
  ios: [180, 167, 152],
  web: [192, 512, 256, 128, 64, 32],
  universal: [1024],
};

const targetSizes = Array.from(
  new Set([
    ...ICON_SIZES.android,
    ...ICON_SIZES.ios,
    ...ICON_SIZES.web,
    ...ICON_SIZES.universal,
  ])
).sort((a, b) => a - b);

const outputDir = path.join(__dirname, 'assets', 'icons');

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function buildSvg(size = 1024) {
  const svgPath = path.join(__dirname, 'assets', 'icons', 'icon.svg');
  if (fs.existsSync(svgPath)) {
    return fs.readFileSync(svgPath, 'utf8');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024" fill="none">
  <defs>
    <radialGradient id="bgGradient" cx="50%" cy="50%" r="90%">
      <stop offset="0%" stop-color="#111827" />
      <stop offset="100%" stop-color="#050914" />
    </radialGradient>
    <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#63E8FF" />
      <stop offset="40%" stop-color="#38B3FF" />
      <stop offset="100%" stop-color="#67F5FF" />
    </linearGradient>
    <filter id="glow" x="-250%" y="-250%" width="500%" height="500%">
      <feGaussianBlur stdDeviation="26" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="1024" height="1024" rx="220" fill="url(#bgGradient)" />
  <g opacity="0.85">
    <circle cx="512" cy="512" r="300" fill="#0b1224" />
    <circle cx="512" cy="512" r="278" fill="none" stroke="#11203b" stroke-width="44" />
  </g>
  <g filter="url(#glow)">
    <circle cx="482" cy="482" r="220" fill="none" stroke="url(#neonGradient)" stroke-width="44" stroke-linecap="round" />
    <circle cx="675" cy="265" r="86" fill="none" stroke="url(#neonGradient)" stroke-width="30" />
    <circle cx="476" cy="196" r="30" fill="url(#neonGradient)" />
    <path d="M320 360C360 260 520 240 580 320" stroke="url(#neonGradient)" stroke-width="22" stroke-linecap="round" fill="none" opacity="0.8" />
  </g>
  <g opacity="0.2">
    <circle cx="512" cy="512" r="332" stroke="#3b5b9a" stroke-width="6" />
    <circle cx="648" cy="300" r="110" stroke="#3b5b9a" stroke-width="4" />
  </g>
</svg>`;
}

async function generatePng(size) {
  const svg = buildSvg(1024);
  return sharp(Buffer.from(svg), { density: 300 })
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function main() {
  ensureDirectory(outputDir);
  console.log('Generating CheckTang app icons with sharp...');

  for (const size of targetSizes) {
    const filename = path.join(outputDir, `icon-${size}x${size}.png`);
    const buffer = await generatePng(size);
    fs.writeFileSync(filename, buffer);
    console.log(`✓ Generated ${filename}`);
  }

  const iconOnlyPath = path.join(__dirname, 'assets', 'icon-only.png');
  const iconOnlyBuffer = await generatePng(1024);
  fs.writeFileSync(iconOnlyPath, iconOnlyBuffer);
  console.log(`✓ Generated ${iconOnlyPath}`);

  const appIconPath = path.join(outputDir, 'app-icon.png');
  fs.writeFileSync(appIconPath, iconOnlyBuffer);
  console.log(`✓ Generated ${appIconPath}`);

  console.log('\nAll icon assets generated successfully.');
}

main().catch((error) => {
  console.error('Icon generation failed:', error);
  process.exit(1);
});