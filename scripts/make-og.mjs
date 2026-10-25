import sharp from 'sharp';

// 1200x630 share card in the system palette. System monospace is used because sharp's SVG renderer can't load webfonts.
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#2a292e"/>
  <rect x="80" y="80" width="24" height="24" fill="#b91e2f"/>
  <text x="80" y="300" font-family="Consolas, monospace" font-size="88" font-weight="700" fill="#f1e8d4" letter-spacing="6">ATHARVA SHEWALE</text>
  <text x="80" y="380" font-family="Consolas, monospace" font-size="34" fill="#e8737c" letter-spacing="8">UE5 DEVELOPER</text>
  <text x="80" y="440" font-family="Consolas, monospace" font-size="28" fill="#a9a6ae">Games · Simulation · Real-time Viz</text>
  <rect x="80" y="520" width="1040" height="24" fill="url(#c)"/>
  <defs><pattern id="c" width="14" height="24" patternUnits="userSpaceOnUse"><rect width="8" height="24" fill="#c9a25c"/></pattern></defs>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('Wrote public/og.png');
