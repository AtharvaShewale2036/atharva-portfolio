import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { findPlaceholders } from './placeholders.mjs';

const dir = process.argv[2] ?? 'dist';
const files = (await readdir(dir, { recursive: true })).filter((f) => f.endsWith('.html'));
let hits = 0;
for (const f of files) {
  const text = (await readFile(join(dir, f), 'utf8')).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');
  for (const m of findPlaceholders(text)) {
    console.error(`${f}: ${m}`);
    hits++;
  }
}
if (hits) {
  console.error(`Placeholder check failed: ${hits} hit(s).`);
  process.exit(1);
}
console.log(`Placeholder check passed (${files.length} pages).`);
