import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

// 1200x630 share card in the system palette. System monospace is used because sharp's SVG renderer can't load webfonts.
const card = (spine, name, sub, tag) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#2a292e"/>
  <rect x="80" y="80" width="24" height="24" fill="${spine}"/>
  <text x="80" y="300" font-family="Consolas, monospace" font-size="${name.length > 20 ? 56 : 88}" font-weight="700" fill="#f1e8d4" letter-spacing="6">${name}</text>
  <text x="80" y="380" font-family="Consolas, monospace" font-size="34" fill="#e8737c" letter-spacing="8">${sub}</text>
  <text x="80" y="440" font-family="Consolas, monospace" font-size="28" fill="#a9a6ae">${tag}</text>
  <rect x="80" y="520" width="1040" height="24" fill="url(#c)"/>
  <defs><pattern id="c" width="14" height="24" patternUnits="userSpaceOnUse"><rect width="8" height="24" fill="#c9a25c"/></pattern></defs>
</svg>`;

await sharp(Buffer.from(card('#b91e2f', 'ATHARVA SHEWALE', 'UE5 DEVELOPER', 'Games · Simulation · Real-time Viz'))).png().toFile('public/og.png');

const spines = { blue: '#2b5ba0', red: '#b91e2f', green: '#2f6b3a', purple: '#5b2d8c', teal: '#1f6e66', orange: '#a04516' };
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
fs.mkdirSync('public/og', { recursive: true });
for (const f of fs.readdirSync('src/content/projects').filter((n) => n.endsWith('.md'))) {
  const fm = fs.readFileSync(path.join('src/content/projects', f), 'utf8');
  const get = (k) => fm.match(new RegExp('^' + k + ':\s*(.+)$', 'm'))[1].trim();
  const slug = f.replace(/.md$/, '');
  const svg = card(spines[get('spine')], esc(get('title').toUpperCase()), esc(get('role').toUpperCase()), 'Atharva Shewale · UE5 Developer');
  await sharp(Buffer.from(svg)).png().toFile(`public/og/${slug}.png`);
}
console.log('Wrote public/og.png and public/og/*.png');
