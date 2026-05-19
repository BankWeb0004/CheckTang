const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const svgPath = path.join(__dirname, 'assets', 'icons', 'icon.svg');
const outPath = path.join(__dirname, 'assets', 'icons', 'icon-512x512-test.png');
const svg = fs.readFileSync(svgPath, 'utf8');
sharp(Buffer.from(svg), { density: 300 })
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outPath)
  .then(() => console.log('generated', outPath))
  .catch((err) => { console.error(err); process.exit(1); });
