# Atharva Shewale Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the "Cartridge Library" portfolio site (crate home, Quick Start list, six project pages, chip teardowns) to Vercel with a QR code.

**Architecture:** Astro static site. All content lives in Markdown content collections validated by zod and is rendered server-side; small vanilla TypeScript modules add the crate, tabs, teardown, lite YouTube and sound. Every interactive view has a no-JS / reduced-motion fallback driven by `html[data-mode]`.

**Tech Stack:** Node 24, Astro 5, TypeScript, plain CSS, @fontsource (Silkscreen, IBM Plex Mono), @astrojs/sitemap, Vitest, Playwright, @lhci/cli, qrcode, sharp, @google/design.md CLI.

**Spec:** `docs/superpowers/specs/2026-10-25-portfolio-design.md` and `DESIGN.md` (visual system). Read both before any task.

## Global Constraints

- Static output only; no server functions, no CMS, no analytics.
- 3D is CSS transforms only; no WebGL, no animation library.
- Client JS per page < 20 KB gzipped.
- Colours, spacing and radii come only from `src/styles/tokens.css` (generated from `DESIGN.md`); never hardcode a hex in components.
- Silkscreen for headings/labels/buttons only, uppercase, sizes 16/24/40/64px (13px for label-caps); IBM Plex Mono for all readable text. Never more than three lines of Silkscreen.
- Signal red (`--color-primary`) only for actions, selection, panel headers; red text on charcoal uses `--color-primary-bright`.
- Spine colour of a project never appears outside that project.
- YouTube iframes only after a click, via `youtube-nocookie.com`; never autoplay before a click.
- `<768px` or `prefers-reduced-motion: reduce`: Quick Start forced, no crate rendered visible, no tilts.
- No placeholder text in production; build fails on it.
- A system is described as Atharva's only if it is in his contribution list in the source docs.
- eVaColregs: systems + role only, no source code, no eDOT marketing assets until eDOT approves.
- Lighthouse mobile targets: Performance ≥ 0.90, Accessibility ≥ 0.95, Best Practices ≥ 0.95, SEO ≥ 0.95.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Project with no cover, no videos, no team: page renders and hides those blocks with no empty frames (Task 7 test).
2. `localStorage` throws (Safari private mode, blocked storage): site renders in default mode, toggles still work for the session (Task 5 test).
3. Trackpad momentum scroll over the crate: one flip per gesture, page scroll resumes at first/last cartridge (Task 2 unit test + Task 6 e2e).
4. 375px phone: Quick Start shown, no horizontal scroll on any page (Task 5 and Task 7 tests).
5. JavaScript disabled: home shows Quick Start, project pages show all tabs and all chip panels readable (Task 8 test).

---

## File Structure

```
atharva-portfolio/
  DESIGN.md                         visual system (exists)
  package.json                      scripts + deps
  astro.config.mjs                  site URL, sitemap
  tsconfig.json
  vitest.config.ts
  playwright.config.ts
  lighthouserc.json
  public/
    favicon.svg
    resume.pdf
    og.png                          generated (Task 9)
    qr.svg / qr.png                 generated (Task 11)
  scripts/
    placeholders.mjs                findPlaceholders(text) (pure)
    check-placeholders.mjs          scans dist/*.html, exits 1 on hit
    make-og.mjs                     renders public/og.png with sharp
    make-qr.mjs                     writes public/qr.svg + qr.png
  src/
    styles/tokens.css               generated from DESIGN.md
    styles/global.css               base, type, buttons, mode visibility
    lib/crate.ts                    wrapIndex, clampIndex, keyToIndex, createWheelStepper (pure)
    lib/spine.ts                    spineVar(spine)
    data/profile.ts                 bio, contacts, skills, experience, education
    content.config.ts               projects collection schema
    content/projects/*.md           6 projects
    assets/covers/frequency-zero.webp
    layouts/Base.astro              head, meta, mode bootstrap, header
    components/Header.astro
    components/Cartridge.astro      shell + label visual
    components/Crate.astro          crate + flipped-to cards
    components/QuickStart.astro     intro + cartridge list
    components/Profile.astro        About, Experience, Contact sections
    components/LiteYouTube.astro
    components/BackOfBox.astro
    components/ChipBoard.astro      board + teardown panels + spec sheet
    components/Manual.astro         ChipBoard + troubleshooting + credits
    scripts/crate.ts                initCrate(root)
    scripts/sound.ts                playBlip(kind), initSoundToggle()
    scripts/lite-youtube.ts         initLiteYouTube()
    scripts/project.ts              initTabs(), initTeardown(root)
    pages/index.astro
    pages/work/[slug].astro
    pages/404.astro
    pages/robots.txt.ts
  tests/
    unit/crate.test.ts
    unit/placeholders.test.ts
    e2e/home.spec.ts
    e2e/project.spec.ts
    e2e/site.spec.ts
```

---

### Task 1: Scaffold, tokens, base layout, test harness

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/Header.astro`, `src/pages/index.astro` (temporary), `public/favicon.svg`, `public/resume.pdf`, `tests/e2e/site.spec.ts`

**Interfaces:**
- Produces: `Base.astro` props `{ title: string; description: string; image?: string; jsonLd?: Record<string, unknown> }`; `html[data-mode="full"|"quick"]`; CSS classes `.btn .btn-primary .btn-paper .btn-ghost .btn-ghost-paper .btn-icon .label .h-display .h-lg .h-md .title .muted .visually-hidden .container`; visibility attributes `[data-show="full"]`, `[data-show="quick"]`; header hooks `[data-mode-toggle]`, `[data-sound-toggle]` (wired in Tasks 5/6).

- [ ] **Step 1: Init project and install deps**

Run in `D:/Protfolio/atharva-portfolio`:
```bash
npm init -y
npm i astro @astrojs/sitemap @fontsource/silkscreen @fontsource/ibm-plex-mono
npm i -D typescript @astrojs/check vitest @playwright/test @lhci/cli qrcode sharp @google/design.md
npx playwright install chromium
```

- [ ] **Step 2: Write `package.json` scripts** (keep the generated deps; replace `"scripts"` and add `"type"`)

```json
{
  "type": "module",
  "scripts": {
    "tokens": "designmd export DESIGN.md --format css-vars > src/styles/tokens.css",
    "lint:design": "designmd lint DESIGN.md",
    "dev": "astro dev",
    "build": "astro check && astro build && node scripts/check-placeholders.mjs",
    "preview": "astro preview --port 4321",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "lhci": "lhci autorun",
    "og": "node scripts/make-og.mjs",
    "qr": "node scripts/make-qr.mjs"
  }
}
```

- [ ] **Step 3: Config files**

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://atharva-shewale.vercel.app',
  integrations: [sitemap()],
  trailingSlash: 'ignore',
});
```

`tsconfig.json`:
```json
{ "extends": "astro/tsconfigs/strict", "include": [".astro/types.d.ts", "**/*"], "exclude": ["dist"] }
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/unit/**/*.test.ts'] } });
```

`playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:4321' },
  webServer: { command: 'npm run preview', url: 'http://localhost:4321', reuseExistingServer: true },
});
```

`.gitignore`:
```
node_modules/
dist/
.astro/
test-results/
playwright-report/
.lighthouseci/
.vercel/
```

- [ ] **Step 4: Generate tokens and copy static files**

```bash
npm run tokens
cp "../design-md-planner-main/Atharva Shewale resume Aug 2026 (02).pdf" public/resume.pdf
```
Expected: `src/styles/tokens.css` starts with `:root {` and contains `--color-primary: #b91e2f;`.

`public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="#2a292e"/><rect x="4" y="4" width="8" height="8" fill="#b91e2f"/></svg>
```

- [ ] **Step 5: `src/styles/global.css`**

```css
:root {
  --font-display: 'Silkscreen', 'Courier New', monospace;
  --font-body: 'IBM Plex Mono', ui-monospace, Consolas, monospace;
  --shadow-paper: 8px 10px 0 rgba(14, 13, 16, 0.55);
  --gutter: var(--spacing-2xl);
  color-scheme: dark;
}
@media (max-width: 767px) { :root { --gutter: var(--spacing-md); } }

*, *::before, *::after { box-sizing: border-box; }
html { background: var(--color-surface); }
body {
  margin: 0; min-height: 100vh;
  background: radial-gradient(ellipse at 50% 30%, var(--color-surface-raised) 0%, var(--color-surface) 60%);
  color: var(--color-on-surface);
  font: 400 16px/1.6 var(--font-body);
  overflow-x: hidden;
}
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; }
.container { max-width: 1440px; margin: 0 auto; padding: 0 var(--gutter); }

.h-display, .h-lg, .h-md, .title, .label { font-family: var(--font-display); text-transform: uppercase; margin: 0; }
.h-display { font-size: 64px; font-weight: 700; line-height: 1; letter-spacing: 0.04em; }
.h-lg { font-size: 40px; font-weight: 700; line-height: 1.1; letter-spacing: 0.06em; }
.h-md { font-size: 24px; font-weight: 700; line-height: 1.2; letter-spacing: 0.08em; }
.title { font-size: 16px; font-weight: 700; line-height: 1.25; letter-spacing: 0.14em; }
.label { font-size: 13px; font-weight: 400; line-height: 1.3; letter-spacing: 0.22em; }
@media (max-width: 767px) { .h-display { font-size: 40px; } .h-lg { font-size: 24px; } }
.muted { color: var(--color-on-surface-muted); }
.prompt::before { content: '> '; }
.body-sm { font-size: 14px; line-height: 1.55; }

.btn {
  display: inline-flex; align-items: center; gap: var(--spacing-sm);
  font: 700 16px/1.25 var(--font-display); letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none;
  padding: var(--spacing-md) var(--spacing-lg); border-radius: var(--rounded-sm); border: 1.5px solid transparent;
  cursor: pointer; transition: transform 80ms steps(2);
}
.btn:active { transform: translateY(3px); }
.btn-primary { background: var(--color-primary); color: var(--color-paper); box-shadow: 0 3px 0 var(--color-primary-deep); }
.btn-primary:hover { background: var(--color-primary-deep); }
.btn-primary:active { box-shadow: none; }
.btn-paper { background: var(--color-paper); color: var(--color-ink); }
.btn-ghost { background: transparent; color: var(--color-on-surface); border-color: var(--color-border); }
.btn-ghost:hover { border-color: var(--color-on-surface); }
.btn-ghost-paper { background: transparent; color: var(--color-ink); border-color: var(--color-ink); }
.btn-icon { padding: var(--spacing-sm); font-size: 13px; }

:focus-visible { outline: 2px solid var(--color-primary-bright); outline-offset: 2px; }
.panel :focus-visible { outline-color: var(--color-primary); }

.panel {
  background: var(--color-paper); color: var(--color-ink);
  border-radius: var(--rounded-md); box-shadow: var(--shadow-paper);
}
.panel-header {
  background: var(--color-primary); color: var(--color-paper);
  padding: var(--spacing-md) var(--spacing-lg); border-radius: var(--rounded-md) var(--rounded-md) 0 0;
  display: flex; justify-content: space-between; gap: var(--spacing-md);
}
.divider { height: 1px; background: var(--color-border); border: 0; margin: 0; }

.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.skip { position: absolute; left: -9999px; }
.skip:focus { left: var(--spacing-md); top: var(--spacing-md); z-index: 10; background: var(--color-paper); color: var(--color-ink); padding: var(--spacing-sm); }

/* Mode visibility. No data-mode (JS off) behaves like quick. */
[data-show="full"] { display: none; }
html[data-mode="full"] [data-show="full"] { display: block; }
html[data-mode="full"] [data-show="quick"] { display: none; }

@media (max-width: 767px), (prefers-reduced-motion: reduce) {
  [data-mode-toggle] { display: none; }
  *, *::before, *::after { transition: none !important; animation: none !important; }
}
```

- [ ] **Step 6: `src/components/Header.astro`**

```astro
---
const nav = [
  ['Projects', '/#projects'],
  ['About', '/#about'],
  ['Experience', '/#experience'],
  ['Contact', '/#contact'],
];
---
<header class="site-header container">
  <a class="brand label" href="/"><span class="brand-mark" aria-hidden="true"></span>Atharva Shewale</a>
  <nav aria-label="Main">
    <ul>{nav.map(([label, href]) => <li><a class="label" href={href}>{label}</a></li>)}</ul>
  </nav>
  <div class="actions">
    <a class="btn btn-ghost" href="/resume.pdf" download>Résumé (PDF)</a>
    <button class="btn btn-paper" type="button" data-mode-toggle>
      <span class="when-full">Quick start</span><span class="when-quick">▶ Full mode</span>
    </button>
    <button class="btn btn-ghost btn-icon" type="button" data-sound-toggle aria-pressed="false" aria-label="Sound effects">SND</button>
  </div>
</header>

<style>
  .site-header { display: flex; align-items: center; gap: var(--spacing-lg); padding-block: var(--spacing-lg); border-bottom: 1px solid var(--color-border); flex-wrap: wrap; }
  .brand { display: flex; align-items: center; gap: var(--spacing-sm); text-decoration: none; font-weight: 700; color: var(--color-on-surface); }
  .brand-mark { width: 10px; height: 10px; background: var(--color-primary); }
  nav { margin-left: auto; }
  nav ul { display: flex; gap: var(--spacing-lg); list-style: none; margin: 0; padding: 0; }
  nav a { color: var(--color-on-surface-muted); text-decoration: none; }
  nav a:hover { color: var(--color-on-surface); box-shadow: 0 2px 0 var(--color-primary); }
  .actions { display: flex; gap: var(--spacing-sm); }
  .when-quick { display: none; }
  :global(html[data-mode="quick"]) .when-full { display: none; }
  :global(html[data-mode="quick"]) .when-quick { display: inline; }
  @media (max-width: 1023px) { nav { display: none; } .actions { margin-left: auto; } }
  @media (max-width: 767px) { .actions .btn-ghost:first-child { display: none; } }
</style>
```

- [ ] **Step 7: `src/layouts/Base.astro`**

```astro
---
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import '../styles/tokens.css';
import '../styles/global.css';
import Header from '../components/Header.astro';

interface Props { title: string; description: string; image?: string; jsonLd?: Record<string, unknown> }
const { title, description, image = '/og.png', jsonLd } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
const ogImage = new URL(image, Astro.site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#2a292e" />
    <script is:inline>
      // Decide the mode before first paint so phones never flash the 3D crate.
      (function () {
        var forced = matchMedia('(max-width: 767px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches;
        var stored = null;
        try { stored = localStorage.getItem('mode'); } catch (e) {}
        document.documentElement.dataset.mode = forced || stored === 'quick' ? 'quick' : 'full';
      })();
    </script>
    {jsonLd && <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />}
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <Header />
    <main id="main"><slot /></main>
  </body>
</html>
```

Temporary `src/pages/index.astro` (replaced in Task 5):
```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Atharva Shewale · UE5 Developer" description="UE5 developer portfolio."><h1 class="h-display container">Atharva Shewale</h1></Base>
```

- [ ] **Step 8: Write the failing e2e test** `tests/e2e/site.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('home renders with title and résumé link', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Atharva Shewale/);
  await expect(page.getByRole('link', { name: 'Résumé (PDF)' })).toHaveAttribute('href', '/resume.pdf');
});
```

- [ ] **Step 9: Build and run**

Run: `npx astro build && npx playwright test tests/e2e/site.spec.ts`
Expected: PASS (1 test). (`npm run build` is used from Task 3 onward, once the placeholder checker exists.)

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro site with design tokens and base layout"
```

---

### Task 2: Crate navigation logic

**Files:**
- Create: `src/lib/crate.ts`, `tests/unit/crate.test.ts`

**Interfaces:**
- Produces:
  - `wrapIndex(i: number, n: number): number`
  - `clampIndex(i: number, n: number): number`
  - `keyToIndex(key: string, active: number, n: number): number | null`
  - `createWheelStepper(opts?: { threshold?: number; cooldownMs?: number }): (deltaY: number, now: number) => -1 | 0 | 1`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { wrapIndex, clampIndex, keyToIndex, createWheelStepper } from '../../src/lib/crate';

describe('wrapIndex', () => {
  it('wraps negatives and overflow', () => {
    expect(wrapIndex(-1, 6)).toBe(5);
    expect(wrapIndex(6, 6)).toBe(0);
    expect(wrapIndex(2, 6)).toBe(2);
  });
});

describe('clampIndex', () => {
  it('stays inside 0..n-1', () => {
    expect(clampIndex(-3, 6)).toBe(0);
    expect(clampIndex(9, 6)).toBe(5);
  });
});

describe('keyToIndex', () => {
  it('moves with arrows and clamps at the ends', () => {
    expect(keyToIndex('ArrowRight', 0, 6)).toBe(1);
    expect(keyToIndex('ArrowDown', 5, 6)).toBe(5);
    expect(keyToIndex('ArrowLeft', 0, 6)).toBe(0);
    expect(keyToIndex('ArrowUp', 3, 6)).toBe(2);
  });
  it('jumps with Home/End', () => {
    expect(keyToIndex('Home', 4, 6)).toBe(0);
    expect(keyToIndex('End', 1, 6)).toBe(5);
  });
  it('ignores other keys', () => {
    expect(keyToIndex('a', 1, 6)).toBeNull();
  });
});

describe('createWheelStepper', () => {
  it('accumulates small deltas into one step', () => {
    const step = createWheelStepper({ threshold: 60, cooldownMs: 250 });
    expect(step(30, 0)).toBe(0);
    expect(step(40, 10)).toBe(1);
  });
  it('ignores momentum within the cooldown', () => {
    const step = createWheelStepper({ threshold: 60, cooldownMs: 250 });
    expect(step(100, 0)).toBe(1);
    expect(step(100, 50)).toBe(0);
    expect(step(100, 120)).toBe(0);
    expect(step(100, 300)).toBe(1);
  });
  it('steps backwards on negative delta', () => {
    const step = createWheelStepper();
    expect(step(-200, 0)).toBe(-1);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/crate.test.ts`
Expected: FAIL, cannot resolve `../../src/lib/crate`.

- [ ] **Step 3: Implement `src/lib/crate.ts`**

```ts
export const wrapIndex = (i: number, n: number): number => ((i % n) + n) % n;

export const clampIndex = (i: number, n: number): number => Math.min(Math.max(i, 0), n - 1);

export function keyToIndex(key: string, active: number, n: number): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return clampIndex(active + 1, n);
    case 'ArrowLeft':
    case 'ArrowUp':
      return clampIndex(active - 1, n);
    case 'Home':
      return 0;
    case 'End':
      return n - 1;
    default:
      return null;
  }
}

// One flip per gesture: deltas accumulate to a threshold, then a cooldown swallows trackpad momentum.
export function createWheelStepper({ threshold = 60, cooldownMs = 250 } = {}) {
  let acc = 0;
  let lockedUntil = -Infinity;
  return (deltaY: number, now: number): -1 | 0 | 1 => {
    if (now < lockedUntil) return 0;
    acc += deltaY;
    if (Math.abs(acc) < threshold) return 0;
    const step = acc > 0 ? 1 : -1;
    acc = 0;
    lockedUntil = now + cooldownMs;
    return step;
  };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run tests/unit/crate.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/crate.ts tests/unit/crate.test.ts
git commit -m "feat: crate index, keyboard and wheel stepping logic"
```

---

### Task 3: Placeholder guard in the build

**Files:**
- Create: `scripts/placeholders.mjs`, `scripts/check-placeholders.mjs`, `tests/unit/placeholders.test.ts`

**Interfaces:**
- Produces: `findPlaceholders(text: string): string[]` (ES module, `scripts/placeholders.mjs`); `node scripts/check-placeholders.mjs [dir=dist]` exits 1 and prints `file: match` lines on any hit.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { findPlaceholders } from '../../scripts/placeholders.mjs';

describe('findPlaceholders', () => {
  it('flags mockup brackets and TODO markers', () => {
    expect(findPlaceholders('> [one-line: what I built]')).toContain('[one-line');
    expect(findPlaceholders('[role] · RELEASED')).toContain('[role]');
    expect(findPlaceholders('Showreel: [ADD YOUTUBE URL]')).toContain('[ADD');
    expect(findPlaceholders('[SYSTEM 02]')).toContain('[SYSTEM 02]');
    expect(findPlaceholders('[Project 03]')).toContain('[Project 03]');
    expect(findPlaceholders('TODO write this')).toContain('TODO');
  });
  it('passes real copy, including legitimate brackets', () => {
    expect(findPlaceholders('Purge reveal 1.3 s → 15 s. Array [0] is fine.')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/placeholders.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

`scripts/placeholders.mjs`:
```js
const PATTERNS = [
  /\[one[- ]line/i,
  /\[role\]/i,
  /\[what /i,
  /\[ADD /i,
  /\[name\]/i,
  /\[team\]/i,
  /\[duration\]/i,
  /\[system \d+\]/i,
  /\[project \d+\]/i,
  /\[factual/i,
  /\bTODO\b/,
  /\bTBD\b/,
];

/** @param {string} text */
export function findPlaceholders(text) {
  return PATTERNS.flatMap((p) => {
    const m = text.match(p);
    return m ? [m[0]] : [];
  });
}
```

`scripts/check-placeholders.mjs`:
```js
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
```

- [ ] **Step 4: Run tests and the full build**

Run: `npx vitest run tests/unit/placeholders.test.ts && npm run build`
Expected: tests PASS; build ends with `Placeholder check passed (1 pages).`

- [ ] **Step 5: Commit**

```bash
git add scripts tests/unit/placeholders.test.ts
git commit -m "feat: fail the build on placeholder text"
```

---

### Task 4: Content: schema, profile, six projects

**Files:**
- Create: `src/content.config.ts`, `src/lib/spine.ts`, `src/data/profile.ts`, `src/assets/covers/frequency-zero.webp`, `src/content/projects/{evacolregs,frequency-zero,saridena-archviz,ctrlaltexp-touch,ctrlaltexp-vr,trapped-in-terror}.md`

**Interfaces:**
- Produces: collection `projects`; entry `id` = filename slug; `data` fields exactly as in the schema below. `spineVar(spine: Spine): string` returns a CSS `var(...)`. `profile` object as below.

- [ ] **Step 1: Copy cover art**

```bash
mkdir -p src/assets/covers
cp "C:/Users/shobh/AppData/Local/Temp/claude/D--Protfolio-design-md-planner-main-design-md-planner/3e171050-f3be-47c5-ab50-fd40f4a880d1/images/7.webp" src/assets/covers/frequency-zero.webp
```
(If that temp file is gone, ask the user to re-send the Frequency Zero poster.)

- [ ] **Step 2: `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const SPINES = ['blue', 'red', 'green', 'purple', 'teal', 'orange'] as const;

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        order: z.number().int().min(1),
        title: z.string(),
        spine: z.enum(SPINES),
        tier: z.enum(['full', 'light']),
        genre: z.string(),
        engine: z.string(),
        platform: z.string(),
        role: z.string(),
        status: z.string(),
        dates: z.string().optional(),
        client: z.string().optional(),
        team: z.string().optional(),
        oneLine: z.string(),
        tagline: z.string().optional(),
        cover: image().optional(),
        videos: z.array(z.object({ youtubeId: z.string().regex(/^[\w-]{11}$/), title: z.string() })).default([]),
        links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
        facts: z.array(z.string()).default([]),
        features: z.array(z.string()).default([]),
        tools: z.array(z.string()).default([]),
        chips: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              summary: z.string(),
              problem: z.string(),
              approach: z.string(),
              result: z.string(),
              still: image().optional(),
            }),
          )
          .default([]),
        troubleshooting: z.array(z.object({ challenge: z.string(), tried: z.string(), fix: z.string() })).default([]),
        credits: z
          .object({
            mine: z.array(z.string()).default([]),
            team: z.array(z.object({ name: z.string(), role: z.string() })).default([]),
          })
          .default({}),
      })
      .refine((p) => p.tier === 'light' || p.chips.length >= 4, { message: 'full-tier projects need at least 4 chips' }),
});

export const collections = { projects };
```

`src/lib/spine.ts`:
```ts
export type Spine = 'blue' | 'red' | 'green' | 'purple' | 'teal' | 'orange';
export const spineVar = (s: Spine): string => (s === 'red' ? 'var(--color-primary)' : `var(--color-spine-${s})`);
```

- [ ] **Step 3: `src/data/profile.ts`**

```ts
export const profile = {
  name: 'Atharva Shewale',
  role: 'UE5 Developer · Games, Simulation, Real-time Viz',
  intro:
    'I build Unreal Engine 5 systems people actually use: gameplay and AI for games, multiplayer simulation in C++, and interactive ArchViz for touchscreens and VR.',
  availability: 'Open to full-time roles and freelance projects · Remote / relocate · Goa, India',
  bio: [
    'Unreal Engine 5 developer working across games, simulation and real-time visualisation, on PC, touchscreen kiosks, Meta Quest and cloud streaming.',
    'At eDot Solutions I build eVaColregs, a C++ multiplayer collision-regulations trainer used for maritime training. On Frequency Zero I lead gameplay programming for an eight-person horror shooter.',
    'Before that I delivered ArchViz walkthroughs end to end as a freelancer and an intern, and spent four years as a 3D artist and motion designer, so I own both the systems and the look.',
  ],
  contact: {
    email: 'shatharva@gmail.com',
    phone: '+91 70411 42749',
    tel: '+917041142749',
    whatsapp: 'https://wa.me/917041142749',
    linkedin: 'https://www.linkedin.com/in/atharva-shewale-3835b0250',
    youtube: 'https://www.youtube.com/playlist?list=PLP6aXjlbiNLc',
    itch: 'https://gamersaurusrex.itch.io/frequency-zero',
  },
  skills: [
    { group: 'Visualisation', items: ['Unreal Engine 5', 'ArchViz', 'Real-time lighting', 'Texturing', 'Level design', 'Cinematics', 'MetaHumans', 'VR / AR / XR walkthroughs', 'Performance optimisation'] },
    { group: 'Interactivity', items: ['Blueprints', 'UMG / UI-UX', 'Modular interaction systems', 'Multiplayer walkthroughs', 'Touchscreen and kiosk builds'] },
    { group: 'Programming', items: ['C++ (gameplay and simulation)', 'Blueprint visual scripting', 'Android Studio'] },
    { group: 'Platforms & tools', items: ['Windows', 'Android', 'Meta Quest 2', 'AR', 'Pixel Streaming', 'Git', 'Perforce', 'Adobe Creative Suite'] },
  ],
  experience: [
    { role: 'Game Developer', org: 'eDot Solutions', place: 'Goa, India · Full-time', dates: 'Aug 2025 – Present', points: ['Real-time naval simulator (eVaColregs) in UE5 C++ and Blueprints, deployed to cloud and local machines with hardware input rigs.', 'AI-controlled ships, procedurally generated scenarios, ship physics and dynamic lighting for training conditions.'] },
    { role: 'Lead Gameplay Programmer', org: 'Frequency Zero', place: 'Collaborative indie project', dates: 'Oct 2025 – Present', points: ['Player abilities, combat, enemy AI, tutorial and adaptive music for a first-person horror shooter.', 'Playable Windows prototype on itch.io; planned showcase at IGDC 2026, Chennai.'] },
    { role: 'Freelance UE5 Developer', org: 'Gaming & ArchViz', place: 'Self-employed', dates: 'Apr 2025 – Present', points: ['Delivered an INR 1.8 lakh Unreal ArchViz project end to end as sole developer.', 'Interactive environments for PC, touchscreen kiosks, VR and AR with modular Blueprint systems.'] },
    { role: 'UE5 Artist & Developer (Intern)', org: 'Saridena Constructions', place: 'Hyderabad, India', dates: 'Oct 2024 – Apr 2025', points: ['VR/AR/XR walkthroughs, interactives, renders and cinematics for real-estate projects, including multiplayer sessions.', 'Level design, lighting and texturing for Meta Quest 2 and Android AR builds.'] },
    { role: 'Freelance 3D Artist & Motion Designer', org: 'Self-employed', place: 'Remote', dates: 'May 2021 – Mar 2025', points: ['3D models and animation for an animated film, TV commercial artwork, and game-ready visuals for a mobile title.'] },
  ],
  education: [
    'BA (Hons) VFX & Animation · Annapurna College of Film and Media, Hyderabad · 2022 – 2025',
    'Diploma, Arena Certified Professional in VFX Compositing & Editing · Arena Animation, Vadodara · 2021 – 2023',
    'Epic Games Game Design Professional Certificate · Coursera · Feb 2025',
  ],
} as const;
```

- [ ] **Step 4: `src/content/projects/evacolregs.md`**

```md
---
order: 1
title: eVaColregs
spine: blue
tier: full
genre: COLREGs training simulator
engine: UE5.5 source build · C++
platform: Windows · Browser (Pixel Streaming)
role: Game Developer · eDot Solutions
status: Shipped, in active use
dates: Nov 2025 – Present
client: eDot Solutions
oneLine: Multiplayer bridge simulator where AI ships follow the collision rules and trainees are scored on what they do.
tagline: Stand the watch. Apply the rules.
links:
  - label: Live demo
    href: https://colregs.ai
facts:
  - ~240,000 lines of C++ in one game module
  - Dedicated-server classroom with VHF voice
  - Nine IMO-based equipment failures, scored out of 100
chips:
  - id: multiplayer
    title: Multiplayer layer
    summary: Many trainees, one shared sea, on a dedicated server.
    problem: A single-player trainer had to host a whole classroom of bridges without forking its gameplay.
    approach: Lobby flow, rejoin, access checks, environment applied on lobby and exercise maps, VHF voice session management and a backend session heartbeat.
    result: The same exercise runs on one or many bridges; a trainee who drops still produces an IncompleteSimulation report, retried until it lands.
  - id: bam
    title: Failures & alerts (BAM)
    summary: Engine, steering, blackout, radar and lamp failures with IMO-style alerts.
    problem: Trainees must notice and diagnose equipment failures the way a real bridge presents them.
    approach: Situation types and variants, blackout power-state timeline, radar fault handling, and a Bridge Alert Management panel modelled on IMO MSC.302(87), plus 3D BAMS and navigation-light consoles with spare lamps.
    result: Every failure raises one alert with ACK and SILENCE, and the trainee's response is scored in the debrief.
  - id: collision
    title: Collision & hazard handling
    summary: One end-of-exercise flow for ships, groundings and charted hazards.
    problem: A collision or hazard strike has to end the exercise the same way in single player and multiplayer.
    approach: Helm and telegraph lock, alarm, open question closed as unanswered, report sent immediately; strikes detected against charted wrecks, obstructions, rocks and platforms.
    result: Identical behaviour on one or many bridges, with the debrief sent before the Session Over screen.
  - id: first-person
    title: Deck walking & binoculars
    summary: First-person walking on a moving ship.
    problem: Trainees need to walk the wheelhouse without breaking every system that asks where the player's ship is.
    approach: An invisible walking character that is never possessed, its target stored in ship-local space so it rides the moving hull; binocular pan and zoom with field-of-view-scaled sensitivity.
    result: Free movement around the bridge while radar, AI, questions and reporting keep tracking the ship.
  - id: time
    title: Time control & question UI
    summary: Pause, fast-forward and AI questions that don't fight.
    problem: The menu pause, the training pause, fast-forward and timed questions all want to control time.
    approach: Pause and 1×/2×/4× fast-forward, a separate question pause, fast-forward warnings, the question widget and indicator, and a stacking notification system.
    result: Questions keep their own wall-clock timer while the simulation is paused, and a trainee's own pause is never overridden.
  - id: frontend
    title: Front end & Pixel Streaming
    summary: Login to exercise, on a PC or in a browser.
    problem: The simulator had to run from a browser on shared streaming machines as well as on desktops.
    approach: Login and mode selection flow, exercise tile grid with search and sort, Pixel Streaming setup with an inactivity monitor, and a crash logging system.
    result: Trainees open the full simulator in a browser, and idle sessions free their streaming slot automatically.
troubleshooting:
  - challenge: Hazard strikes were lost in multiplayer.
    tried: The RPC passed a pointer to a mesh component created at runtime, which arrives as null on the other machine.
    fix: The RPC now sends a small enum for the hazard type and the server runs the same collision flow.
  - challenge: The camera froze in "blending" at full binocular zoom.
    tried: Light scaling divided 0 by 0 when the minimum and default field of view were equal, and the NaN spread into the camera.
    fix: Fixed the order of operations and made the camera blend bail out on non-finite values.
  - challenge: Pausing during a view transition froze it half-done.
    tried: The training pause runs time dilation near zero, which stretched a short Blueprint delay to about 2,000 seconds.
    fix: A lock blocks pausing while a view transition is running.
credits:
  mine:
    - Multiplayer layer from prototype to completion, VHF voice sessions, session heartbeat
    - Abnormal situations, Bridge Alert Management, BAMS and navigation-light consoles
    - Collision handling and reporting, hazard strikes
    - First-person deck walking, orbit and top view fixes, binoculars, 3D tooltips
    - Pause, fast-forward, question pause and question UI, notification system
    - Login flow, exercise browser, Pixel Streaming setup, crash logging, volume control
    - Navigation lights and day signals for AI vessels, tutorial step controls
  team:
    - name: eDot Solutions
      role: Product owner and wider engineering team
---

eVaColregs teaches seafarers the International Regulations for Preventing Collisions at Sea by making them use the rules. The trainee stands watch on a real merchant ship in real charted waters, meets AI traffic that gives way and stands on by the rules, answers questions generated from the live situation, and gets a 100-point debrief.
```

- [ ] **Step 5: `src/content/projects/frequency-zero.md`**

```md
---
order: 2
title: Frequency Zero
spine: red
tier: full
genre: First-person horror shooter
engine: UE5.6 · 100% Blueprints
platform: Windows
role: Lead Gameplay Programmer
status: Prototype on itch.io · IGDC 2026
dates: Oct 2025 – Present
team: 8 developers
oneLine: You are blind; every shot flashes the world into view and tells the monsters where you are.
tagline: You don't need eyes to survive.
cover: ../../assets/covers/frequency-zero.webp
links:
  - label: Play on itch.io
    href: https://gamersaurusrex.itch.io/frequency-zero
facts:
  - No scene lights; the only light is the player's pulse
  - Shared perception AI across three enemy types
  - Purge reveal lifetime fixed from 1.3 s to 15 s
chips:
  - id: ping-pool
    title: Ping pool priority fix
    summary: Why the purge reveal vanished, and the fix.
    problem: The purge's reveal disappeared about 1.3 s after firing, whatever its hold and fade times.
    approach: Inspected the live ping array; the 16-slot pool was always full of med kit, alarm and invisible player pings. Made the purge a protected priority and distance-gated ambient emitters.
    result: Purge reveal 1.3 s → 15 s; pool use 16/16 → about 6–7/16.
  - id: senses
    title: Shared enemy senses
    summary: One perception model for Muties, exploders and drones.
    problem: The old setup gave enemies 360° vision and no shared awareness.
    approach: An awareness component with Unaware, Suspicious, Alert and Searching states, a 60° sight cone plus close-range detection, hearing halved through walls, and one-hop alerts to nearby allies.
    result: Every enemy type reacts to noise the same way, which turned noise management into the stealth mechanic.
  - id: purge-dash
    title: Purge & look-directed dash
    summary: The panic button and the escape move.
    problem: The first dash launched along current velocity and went 13–28° off when the player changed direction.
    approach: Rebuilt as a look-directed burst with a 3 s cooldown bar; the purge scales radius and damage with charge, locks targets on key press and runs its slow motion on a timeline.
    result: Dash direction error 0°, cooldown 3.02–3.03 s; shooting mid-purge can no longer strand the game in slow motion.
  - id: tutorial
    title: Tutorial system
    summary: Six abilities taught without pausing the game.
    problem: Players had to learn six abilities in a pitch-black level without being stopped.
    approach: A 15-step director with timed, non-pausing prompt cards; each ability is locked by an input context until its prompt appears.
    result: Each ability closes its own prompt early; verified with real keyboard and mouse input in automated play sessions.
  - id: music
    title: Adaptive music director
    summary: Combat music that follows the fight, not the floor plan.
    problem: Exploration and combat music played on top of each other, triggered by where the player stood.
    approach: One director owns both tracks; combat means any alerted enemy in range, with 6 s hysteresis, a 2 s crossfade and FMOD pause handling.
    result: Combat music starts within 0.8 s of an alert and fades 6–7 s after the last one, with no flip-flopping.
  - id: optimisation
    title: Optimisation pass
    summary: Moving AI and UI off the per-frame tick.
    problem: Enemy brains, HUD bindings and cosmetic effects all ran every frame.
    approach: Enemy brains on 0.2 s timers, senses on staggered 0.1 s ticks, cosmetics only when rendered, HUD on timers, and dead Blueprint code removed.
    result: About 420 dead nodes and every debug print removed; remaining hitches measured as editor-only.
troubleshooting:
  - challenge: 27 of 29 Muties stopped moving after a refactor.
    tried: Navigation looked broken because a removed pathfinding plugin had also left the level without a navmesh.
    fix: Rebuilt navigation on the default navmesh and restored the missing AI Controller class.
  - challenge: Drones froze mid-air when killed.
    tried: The base class played a Mutie death montage that drones don't have, and dissolved the wrong mesh.
    fix: A physics fall with sparks, a first-impact handler, then a dissolve timed to finish before the actor is destroyed.
  - challenge: Combat music restarted itself.
    tried: FMOD's stop is asynchronous, so the track still reported playing for a few frames and was stopped again.
    fix: A stop-issued flag prevents repeat stops and the restart race.
credits:
  mine:
    - Ping system integration and ping pool fixes
    - Purge and dash rework
    - Enemy AI rework (shared senses, Muties, exploders, drone bridge, drone death physics)
    - Optimisation pass, keycards, enemy health bars and damage numbers
    - UI redesign, main menu, loading screen, pause menu
    - Tutorial (three versions), music director, bug fixing
  team:
    - name: Spandon Adhikary
      role: Project setup, core prototyping, VFX, wall tool, FMOD setup
    - name: Akil Shetty
      role: Level layout, blockout, asset dressing
    - name: Adarsh Gupta
      role: Explosive Mutant, lasers, doors and inventory, boss
    - name: Arpit Bendre
      role: Packaging, project settings, enemy spawner
    - name: Abizer Motorwala
      role: Early enemy chase, blockout, navmesh
    - name: Athul L
      role: Sliding doors, prison and lab rooms
    - name: Rajat Musale
      role: Ping value tuning
---

The protagonist is blind. The world is pitch black, and the only way to see is to fire electromagnetic pulses that flash geometry into existence for a moment. Every pulse is also a sound the monsters can hear, so every reveal is a decision.
```

- [ ] **Step 6: Light projects**

`src/content/projects/saridena-archviz.md`:
```md
---
order: 3
title: Saridena ArchViz
spine: green
tier: light
genre: Interactive real-estate visualisation
engine: UE5 · Blueprints · UMG
platform: Touchscreen kiosk · PC
role: UE5 Artist & Developer (Intern)
status: Delivered
dates: Oct 2024 – Apr 2025
client: Saridena Constructions
oneLine: Touchscreen walkthroughs of a luxury resort and a high-rise apartment for sales presentations.
videos:
  - youtubeId: fHqvVSAObmc
    title: Interactive Resort ArchViz
  - youtubeId: -wJpCFe_m3I
    title: Interactive Apartment ArchViz
features:
  - Touch-first UMG interface for kiosks and large panels
  - Real-time walkthrough of exterior and interior spaces
  - Tappable hotspots, material changers and info pop-ups
  - Lumen lighting and Nanite geometry, tuned for kiosk hardware
tools:
  - Unreal Engine 5
  - Blueprints
  - UMG
  - Lumen
  - Nanite
---

Two six-month internship projects for Saridena Constructions: a resort and an apartment that clients and sales teams explore themselves on a touchscreen, changing materials and opening information hotspots as they go.
```

`src/content/projects/ctrlaltexp-touch.md`:
```md
---
order: 4
title: CtrlAltExp Touch + PC
spine: purple
tier: light
genre: Interactive ArchViz
engine: UE5 · Blueprints · UMG
platform: Touchscreen · PC
role: Freelance UE5 Developer
status: Delivered
client: CtrlAltExp
oneLine: One architectural walkthrough with a touchscreen UI and a matching mouse-and-keyboard version.
videos:
  - youtubeId: 9SyqEm8Rqj8
    title: Interactive ArchViz Experience (Touch + PC)
features:
  - Responsive touch UI built in UMG
  - Same UI functions with mouse and keyboard on PC
  - Info hotspots, scene transitions and walkthrough controls
  - Performance tuned for touchscreen and desktop hardware
tools:
  - Unreal Engine 5
  - Blueprints
  - UMG
  - Lumen
  - Nanite
---

A freelance build for CtrlAltExp for exhibitions and client demos: the same site explored by tapping a kiosk or driving it from a PC, part of a suite that also includes a VR version.
```

`src/content/projects/ctrlaltexp-vr.md`:
```md
---
order: 5
title: CtrlAltExp VR
spine: teal
tier: light
genre: VR architectural walkthrough
engine: UE5 · Blueprints · VR template
platform: PC VR (Oculus / SteamVR)
role: Freelance UE5 Developer
status: Delivered
client: CtrlAltExp
oneLine: A 1:1-scale VR walkthrough of an architectural site with teleport, snap turn and interaction.
videos:
  - youtubeId: L4FsMwSXhO8
    title: Immersive VR ArchViz Experience
features:
  - Teleportation, rotation and object interaction with VR controllers
  - Accurate scale, lighting and materials
  - VR-specific UI and interaction logic in Blueprints
  - Delivered with project files, packaged build and a documentation video
tools:
  - Unreal Engine 5
  - Blueprints
  - Lumen
  - OpenXR (Oculus / SteamVR)
---

The VR half of the CtrlAltExp suite: clients walk the designed space at true scale instead of looking at renders of it.
```

`src/content/projects/trapped-in-terror.md`:
```md
---
order: 6
title: Trapped in Terror
spine: orange
tier: light
genre: Horror escape room
engine: UE5 · Blueprints
platform: Windows
role: Solo developer
status: Prototype
oneLine: A multi-room horror escape game where every door hides a puzzle.
videos:
  - youtubeId: kBL-PZOTD4E
    title: Trapped in Terror gameplay
features:
  - Multi-room progression with interlinked puzzles
  - Dynamic lighting, audio cues and horror ambience
  - Classic escape-room mechanics with a horror twist
tools:
  - Unreal Engine 5
  - Blueprints
---

You wake in an abandoned facility with no memory and one goal: escape. A solo project built end to end, from puzzle logic to sound design.
```

- [ ] **Step 7: Verify schema**

Run: `npx astro sync && npx astro check`
Expected: `0 errors`. Then temporarily set `chips: []` in `frequency-zero.md`, run `npx astro sync`, expect the error `full-tier projects need at least 4 chips`, and revert.

- [ ] **Step 8: Commit**

```bash
git add src/content.config.ts src/content src/data src/lib/spine.ts src/assets
git commit -m "feat: project content collection, profile data and six projects"
```

---

### Task 5: Home: Quick Start, profile sections, mode toggle

**Files:**
- Create: `src/components/QuickStart.astro`, `src/components/Profile.astro`, `tests/e2e/home.spec.ts`
- Modify: `src/pages/index.astro` (replace), `src/components/Header.astro` (add script)

**Interfaces:**
- Consumes: `profile`, `spineVar`, collection `projects`, `.panel`, `[data-show]`, `[data-mode-toggle]`.
- Produces: section ids `#projects`, `#about`, `#experience`, `#contact`; `QuickStart` props `{ projects: CollectionEntry<'projects'>[] }`; `index.astro` passes `projects` sorted by `data.order` to `Crate` in Task 6.

- [ ] **Step 1: Write the failing e2e tests** `tests/e2e/home.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test.describe('phone', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('Quick Start is forced and nothing scrolls sideways', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'quick');
    await expect(page.getByRole('heading', { level: 1, name: 'Atharva Shewale' })).toBeVisible();
    await expect(page.locator('#projects li')).toHaveCount(6);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test('reduced motion forces Quick Start on desktop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'quick');
});

test('toggle switches mode and survives reload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'full');
  await page.getByRole('button', { name: 'Quick start' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'quick');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'quick');
});

test('blocked localStorage still renders and toggles', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'full');
  await page.getByRole('button', { name: 'Quick start' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'quick');
});

test('contact links are real', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contact a[href="mailto:shatharva@gmail.com"]')).toHaveCount(1);
  await expect(page.locator('#contact a[href="https://wa.me/917041142749"]')).toHaveCount(1);
  await expect(page.locator('#contact a[href="tel:+917041142749"]')).toHaveCount(1);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx astro build && npx playwright test tests/e2e/home.spec.ts`
Expected: FAIL (no `#projects`, no toggle behaviour).

- [ ] **Step 3: `src/components/QuickStart.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { profile } from '../data/profile';
import { spineVar } from '../lib/spine';

interface Props { projects: CollectionEntry<'projects'>[] }
const { projects } = Astro.props;
---
<section class="quick container" data-show="quick" aria-labelledby="qs-name">
  <div class="intro">
    <div>
      <h1 id="qs-name" class="h-display">{profile.name}</h1>
      <p class="label role">{profile.role}</p>
      <p class="prompt">{profile.intro}</p>
      <p class="avail"><span class="dot" aria-hidden="true"></span>{profile.availability}</p>
    </div>
    <div class="ctas">
      <a class="btn btn-primary" href="/resume.pdf" download>Résumé (PDF)</a>
      <a class="btn btn-ghost" href={profile.contact.linkedin} rel="noopener">LinkedIn ↗</a>
      <a class="btn btn-ghost" href={`mailto:${profile.contact.email}`}>Email</a>
    </div>
  </div>

  <div class="panel list" id="projects">
    <div class="list-head label"><span>Cartridges · best first</span><span class="body-sm list-note">Quick start mode</span></div>
    <ol>
      {projects.map((p) => (
        <li style={`--spine:${spineVar(p.data.spine)}`}>
          <a href={`/work/${p.id}`}>
            <span class="bar" aria-hidden="true"></span>
            <span class="label idx">{String(p.data.order).padStart(2, '0')}</span>
            <span class="title name">{p.data.title}</span>
            <span class="meta body-sm">{p.data.role} · {p.data.status}<br /><span class="prompt">{p.data.oneLine}</span></span>
            <span class="view label">View →</span>
          </a>
        </li>
      ))}
    </ol>
  </div>
</section>

<style>
  .quick { padding-block: var(--spacing-2xl); display: grid; gap: var(--spacing-xl); }
  .intro { display: flex; justify-content: space-between; align-items: end; gap: var(--spacing-xl); flex-wrap: wrap; }
  .role { color: var(--color-primary-bright); margin-block: var(--spacing-md); }
  .intro p { max-width: 68ch; }
  .avail { display: flex; gap: var(--spacing-sm); align-items: center; }
  .dot { width: 8px; height: 8px; background: var(--color-primary); }
  .ctas { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }
  .list-head { display: flex; justify-content: space-between; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 15%, transparent); }
  .list-note { color: var(--color-ink-muted); text-transform: none; letter-spacing: 0; font-family: var(--font-body); }
  ol { list-style: none; margin: 0; padding: 0; }
  li + li { border-top: 1px solid color-mix(in srgb, var(--color-ink) 15%, transparent); }
  li a { display: grid; grid-template-columns: 8px 48px minmax(0, 1fr) minmax(0, 2fr) auto; gap: var(--spacing-lg); align-items: center; padding: var(--spacing-md) var(--spacing-lg); text-decoration: none; color: var(--color-ink); }
  .bar { width: 8px; height: 44px; background: var(--spine); }
  .idx { color: var(--color-ink-muted); }
  .meta { color: var(--color-ink-muted); }
  .meta .prompt { color: var(--color-ink); }
  .view { color: var(--spine); }
  li a:hover .name { text-decoration: underline; text-decoration-color: var(--spine); }
  @media (max-width: 767px) {
    li a { grid-template-columns: 8px minmax(0, 1fr); gap: var(--spacing-sm) var(--spacing-md); }
    .bar { grid-row: span 3; height: 100%; }
    .idx, .view { display: none; }
  }
</style>
```

- [ ] **Step 4: `src/components/Profile.astro`**

```astro
---
import { profile } from '../data/profile';
const c = profile.contact;
---
<section id="about" class="container block" aria-labelledby="about-h">
  <h2 id="about-h" class="h-lg">About</h2>
  <div class="about">
    <div class="bio">{profile.bio.map((p) => <p>{p}</p>)}</div>
    <dl class="skills">
      {profile.skills.map((s) => (<><dt class="label">{s.group}</dt><dd class="body-sm">{s.items.join(' · ')}</dd></>))}
    </dl>
  </div>
</section>

<section id="experience" class="container block" aria-labelledby="exp-h">
  <h2 id="exp-h" class="h-lg">Experience</h2>
  <ol class="timeline">
    {profile.experience.map((e) => (
      <li>
        <p class="label muted">{e.dates}</p>
        <h3 class="title">{e.role} · {e.org}</h3>
        <p class="body-sm muted">{e.place}</p>
        <ul>{e.points.map((pt) => <li class="body-sm">{pt}</li>)}</ul>
      </li>
    ))}
  </ol>
  <h3 class="title edu-h">Education & certification</h3>
  <ul class="edu">{profile.education.map((e) => <li class="body-sm">{e}</li>)}</ul>
</section>

<section id="contact" class="container block" aria-labelledby="contact-h">
  <h2 id="contact-h" class="h-lg">Contact</h2>
  <ul class="contact">
    <li><a class="btn btn-primary" href={`mailto:${c.email}`}>Email</a><span class="body-sm muted">{c.email}</span></li>
    <li><a class="btn btn-ghost" href={c.whatsapp} rel="noopener">WhatsApp ↗</a><a class="body-sm muted" href={`tel:${c.tel}`}>{c.phone}</a></li>
    <li><a class="btn btn-ghost" href={c.linkedin} rel="noopener">LinkedIn ↗</a></li>
    <li><a class="btn btn-ghost" href={c.youtube} rel="noopener">YouTube ↗</a></li>
    <li><a class="btn btn-ghost" href={c.itch} rel="noopener">itch.io ↗</a></li>
  </ul>
</section>

<style>
  .block { padding-block: var(--spacing-2xl); border-top: 1px solid var(--color-border); }
  .block > h2 { margin-bottom: var(--spacing-xl); }
  .about { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: var(--spacing-xl); }
  .bio p { max-width: 68ch; margin-top: 0; }
  .skills { margin: 0; display: grid; gap: var(--spacing-sm); }
  .skills dt { color: var(--color-primary-bright); margin-top: var(--spacing-md); }
  .skills dd { margin: 0; }
  .timeline { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--spacing-xl); }
  .timeline > li { border-left: 2px solid var(--color-border); padding-left: var(--spacing-lg); }
  .timeline h3 { margin-block: var(--spacing-sm); }
  .timeline ul, .edu { padding-left: var(--spacing-md); max-width: 72ch; }
  .edu-h { margin-top: var(--spacing-xl); }
  .contact { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: var(--spacing-md); }
  .contact li { display: flex; align-items: center; gap: var(--spacing-md); }
  @media (max-width: 1023px) { .about { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 5: Replace `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import QuickStart from '../components/QuickStart.astro';
import Profile from '../components/Profile.astro';
import { profile } from '../data/profile';

const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  jobTitle: 'Unreal Engine 5 Developer',
  email: `mailto:${profile.contact.email}`,
  address: { '@type': 'PostalAddress', addressRegion: 'Goa', addressCountry: 'IN' },
  sameAs: [profile.contact.linkedin, profile.contact.youtube, profile.contact.itch],
};
---
<Base title="Atharva Shewale · UE5 Developer" description={profile.intro} jsonLd={jsonLd}>
  <QuickStart projects={projects} />
  <Profile />
</Base>
```

- [ ] **Step 6: Wire the mode toggle** (append to `src/components/Header.astro`)

```astro
<script>
  const root = document.documentElement;
  document.querySelectorAll('[data-mode-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const next = root.dataset.mode === 'quick' ? 'full' : 'quick';
      root.dataset.mode = next;
      try { localStorage.setItem('mode', next); } catch {}
    }),
  );
</script>
```

- [ ] **Step 7: Run to verify pass**

Run: `npm run build && npx playwright test tests/e2e/home.spec.ts`
Expected: PASS (5 tests).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Quick Start home, profile sections and mode toggle"
```

---

### Task 6: Crate (full mode) and sound

**Files:**
- Create: `src/components/Cartridge.astro`, `src/components/Crate.astro`, `src/scripts/crate.ts`, `src/scripts/sound.ts`
- Modify: `src/pages/index.astro` (add Crate), `src/components/Header.astro` (sound toggle), `tests/e2e/home.spec.ts` (add tests)

**Interfaces:**
- Consumes: `wrapIndex`, `keyToIndex`, `createWheelStepper` (Task 2); `spineVar`; collection entries.
- Produces: `Cartridge` props `{ title: string; spine: Spine; cover?: ImageMetadata; youtubeId?: string; caption: string; size?: 'crate' | 'box' }`; `initCrate(root: HTMLElement): void`; `playBlip(kind: 'flip' | 'select'): void`; `initSoundToggle(): void`; DOM hooks `[data-crate]`, `[data-cart]` (with `data-title`), `[data-crate-card]`, `[data-crate-live]`.

- [ ] **Step 1: Write the failing e2e tests** (append to `tests/e2e/home.spec.ts`)

```ts
test.describe('crate', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('keyboard flips cartridges and clamps at the end', async ({ page }) => {
    await page.goto('/');
    const crate = page.locator('[data-crate]');
    await crate.focus();
    await expect(page.locator('[data-crate-live]')).toContainText('01 of 06');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-crate-live]')).toContainText('02 of 06, Frequency Zero');
    await expect(page.locator('[data-crate-card]:not([hidden])')).toContainText('Lead Gameplay Programmer');
    await page.keyboard.press('End');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-crate-live]')).toContainText('06 of 06');
  });

  test('a burst of wheel events flips once', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-crate]').hover();
    for (let i = 0; i < 8; i++) await page.mouse.wheel(0, 40);
    await expect(page.locator('[data-crate-live]')).toContainText('02 of 06');
  });

  test('pull out opens the project page', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-crate-card]:not([hidden])').getByRole('link', { name: /pull out/i }).click();
    await expect(page).toHaveURL(/\/work\/evacolregs/);
  });

  test('sound is off by default and toggles', async ({ page }) => {
    await page.goto('/');
    const snd = page.getByRole('button', { name: 'Sound effects' });
    await expect(snd).toHaveAttribute('aria-pressed', 'false');
    await snd.click();
    await expect(snd).toHaveAttribute('aria-pressed', 'true');
  });
});
```

(The pull-out test needs the project page from Task 7; it is expected to fail with a 404 until then. Mark it `test.fixme` in this task and remove `fixme` in Task 7 Step 7.)

- [ ] **Step 2: Run to verify failure**

Run: `npm run build && npx playwright test tests/e2e/home.spec.ts -g crate`
Expected: FAIL (`[data-crate]` not found).

- [ ] **Step 3: `src/scripts/sound.ts`**

```ts
const KEY = 'snd';
let ctx: AudioContext | null = null;

const enabled = (): boolean => {
  try { return localStorage.getItem(KEY) === 'on'; } catch { return false; }
};

// Square-wave blip; only ever called after a user gesture, so the AudioContext may start.
export function playBlip(kind: 'flip' | 'select'): void {
  if (!enabled()) return;
  ctx ??= new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = kind === 'flip' ? 220 : 660;
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

export function initSoundToggle(): void {
  let session = enabled();
  document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(session));
    btn.addEventListener('click', () => {
      session = !session;
      try { localStorage.setItem(KEY, session ? 'on' : 'off'); } catch {}
      btn.setAttribute('aria-pressed', String(session));
      if (session) playBlip('select');
    });
  });
}
```

Append to the `<script>` in `Header.astro`:
```ts
import { initSoundToggle } from '../scripts/sound';
initSoundToggle();
```

- [ ] **Step 4: `src/components/Cartridge.astro`**

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { spineVar, type Spine } from '../lib/spine';

interface Props { title: string; spine: Spine; cover?: ImageMetadata; youtubeId?: string; caption: string; size?: 'crate' | 'box' }
const { title, spine, cover, youtubeId, caption, size = 'crate' } = Astro.props;
---
<div class={`cartridge ${size}`} style={`--spine:${spineVar(spine)}`}>
  <div class="grooves" aria-hidden="true"></div>
  <div class="label-card">
    <p class="cart-title">{title}</p>
    <div class="window">
      {cover ? <Image src={cover} alt="" widths={[240, 480]} sizes="240px" /> :
       youtubeId ? <img src={`https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`} alt="" width="320" height="180" loading="lazy" decoding="async" /> :
       <span class="wave" aria-hidden="true"></span>}
    </div>
    <p class="caption">{caption}</p>
  </div>
</div>

<style>
  .cartridge { width: 260px; aspect-ratio: 0.82; background: var(--color-surface-raised); border-radius: var(--rounded-lg); padding: var(--spacing-md); box-shadow: 8px 10px 0 rgba(14, 13, 16, 0.55); border-top: 6px solid var(--spine); }
  .cartridge.box { width: 100%; max-width: 360px; }
  .grooves { height: 12px; margin-bottom: var(--spacing-md); background: repeating-linear-gradient(to bottom, var(--color-border) 0 1px, transparent 1px 4px); }
  .label-card { background: var(--color-ink); border-radius: var(--rounded-sm); overflow: hidden; }
  .cart-title { margin: 0; background: var(--spine); color: var(--color-paper); font: 700 16px/1.2 var(--font-display); letter-spacing: 0.1em; text-transform: uppercase; padding: var(--spacing-sm) var(--spacing-md); }
  .window { aspect-ratio: 16 / 10; display: grid; place-items: center; overflow: hidden; }
  .window :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .wave { width: 70%; height: 2px; background: var(--spine); box-shadow: 0 -10px 0 -1px var(--spine), 0 10px 0 -1px var(--spine); }
  .caption { margin: 0; background: var(--color-paper); color: var(--color-ink); font-size: 12px; padding: var(--spacing-xs) var(--spacing-md); text-transform: uppercase; letter-spacing: 0.1em; }
</style>
```

- [ ] **Step 5: `src/components/Crate.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import Cartridge from './Cartridge.astro';
import { spineVar } from '../lib/spine';

interface Props { projects: CollectionEntry<'projects'>[] }
const { projects } = Astro.props;
const n = String(projects.length).padStart(2, '0');
---
<section class="crate-view container" data-show="full" aria-labelledby="crate-h">
  <div class="intro">
    <h1 id="crate-h" class="h-display">Dig through my crate</h1>
    <p class="prompt">Every project I've shipped or prototyped, filed like records.</p>
    <p class="body-sm muted">Scroll, ← → or click a cartridge to flip through.</p>
  </div>

  <div class="crate" data-crate tabindex="0" role="group" aria-roledescription="carousel" aria-label="Projects crate">
    <p class="visually-hidden" aria-live="polite" data-crate-live></p>
    <div class="stack">
      {projects.map((p, i) => (
        <button class="cart" type="button" data-cart data-title={p.data.title} style={`--pos:${i}`} aria-label={`${String(i + 1).padStart(2, '0')} ${p.data.title}`} tabindex="-1">
          <Cartridge title={p.data.title} spine={p.data.spine} cover={p.data.cover} youtubeId={p.data.videos[0]?.youtubeId} caption={`${p.data.status.split(' ')[0]} · ${p.data.engine.split(' ')[0]}`} />
        </button>
      ))}
    </div>
    <div class="box-front" aria-hidden="true"><span class="label">Crate 01 · {projects.length} cartridges</span></div>
  </div>

  <div class="cards">
    {projects.map((p, i) => (
      <article class="panel card" data-crate-card hidden={i !== 0} style={`--spine:${spineVar(p.data.spine)}`}>
        <header class="panel-header label"><span>{String(i + 1).padStart(2, '0')} / {n} · Now flipped to</span></header>
        <div class="card-body">
          <h2 class="h-md">{p.data.title}</h2>
          <p class="body-sm">{p.data.genre} · {p.data.engine.split(' · ')[0]} · {p.data.platform.split(' · ')[0]}</p>
          <p class="role prompt">{p.data.role}</p>
          <p class="prompt">{p.data.oneLine}</p>
          <div class="actions">
            <a class="btn btn-primary" href={`/work/${p.id}`}>▶ Pull out</a>
            <a class="btn btn-ghost-paper" href="#projects" data-to-quick>List view</a>
          </div>
        </div>
      </article>
    ))}
  </div>
</section>

<script>
  import { initCrate } from '../scripts/crate';
  const root = document.querySelector<HTMLElement>('[data-crate]');
  if (root) initCrate(root);
  document.querySelectorAll('[data-to-quick]').forEach((a) =>
    a.addEventListener('click', () => {
      document.documentElement.dataset.mode = 'quick';
      try { localStorage.setItem('mode', 'quick'); } catch {}
    }),
  );
</script>

<style>
  .crate-view { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 4fr) minmax(0, 3fr); gap: var(--spacing-xl); align-items: center; min-height: calc(100vh - 120px); padding-block: var(--spacing-2xl); }
  .intro .prompt { margin-top: var(--spacing-lg); max-width: 40ch; }
  .crate { position: relative; height: 520px; perspective: 1400px; outline-offset: 8px; }
  .stack { position: absolute; inset: 0 0 120px; transform-style: preserve-3d; }
  .cart { position: absolute; left: 50%; bottom: 0; padding: 0; border: 0; background: none; cursor: pointer;
    transform: translateX(calc(-50% + var(--pos) * 26px)) translateZ(calc(var(--pos) * -40px)) rotateY(-24deg);
    transition: transform 280ms cubic-bezier(.2, .7, .2, 1); z-index: calc(10 - var(--pos)); }
  .cart[data-front] { transform: translateX(-60%) translateY(-60px) rotateY(-12deg) rotateX(8deg); }
  .box-front { position: absolute; left: 10%; right: 10%; bottom: 0; height: 180px; background: var(--color-surface-raised); border-radius: var(--rounded-md); transform: rotateX(8deg); box-shadow: 8px 10px 0 rgba(14, 13, 16, 0.55); display: flex; align-items: end; padding: var(--spacing-lg); z-index: 20; }
  .box-front .label { color: var(--color-on-surface-muted); }
  .card-body { padding: var(--spacing-lg); display: grid; gap: var(--spacing-sm); }
  .card-body p { margin: 0; }
  .role { color: var(--color-primary); }
  .actions { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; margin-top: var(--spacing-md); }
  @media (max-width: 1199px) { .crate-view { grid-template-columns: 1fr; } .crate { height: 460px; } }
</style>
```

- [ ] **Step 6: `src/scripts/crate.ts`**

```ts
import { wrapIndex, keyToIndex, createWheelStepper } from '../lib/crate';
import { playBlip } from './sound';

export function initCrate(root: HTMLElement): void {
  const carts = [...root.querySelectorAll<HTMLButtonElement>('[data-cart]')];
  const cards = [...document.querySelectorAll<HTMLElement>('[data-crate-card]')];
  const live = root.querySelector<HTMLElement>('[data-crate-live]');
  const n = carts.length;
  const wheel = createWheelStepper();
  let active = 0;

  const show = (i: number, silent = false) => {
    active = i;
    carts.forEach((cart, j) => {
      const pos = wrapIndex(j - active, n); // flipped-past cartridges go to the back of the crate
      cart.style.setProperty('--pos', String(pos));
      cart.toggleAttribute('data-front', pos === 0);
    });
    cards.forEach((card, j) => (card.hidden = j !== active));
    if (live) live.textContent = `${String(active + 1).padStart(2, '0')} of ${String(n).padStart(2, '0')}, ${carts[active].dataset.title}`;
    if (!silent) playBlip('flip');
  };

  carts.forEach((cart, j) => cart.addEventListener('click', () => show(j)));
  root.addEventListener('keydown', (e) => {
    const next = keyToIndex(e.key, active, n);
    if (next === null) return;
    e.preventDefault();
    if (next !== active) show(next);
  });
  root.addEventListener(
    'wheel',
    (e) => {
      const atEdge = (active === n - 1 && e.deltaY > 0) || (active === 0 && e.deltaY < 0);
      if (atEdge) return; // let the page scroll past the crate
      e.preventDefault();
      const step = wheel(e.deltaY, e.timeStamp);
      if (step) show(active + step);
    },
    { passive: false },
  );
  show(0, true);
}
```

- [ ] **Step 7: Add the crate to `src/pages/index.astro`**

Add `import Crate from '../components/Crate.astro';` and place `<Crate projects={projects} />` directly above `<QuickStart projects={projects} />`.

QuickStart's `h1` and Crate's `h1` are never visible at the same time (one per mode), so each mode has exactly one visible `h1`.

- [ ] **Step 8: Run to verify pass**

Run: `npm run build && npx playwright test tests/e2e/home.spec.ts`
Expected: all PASS except the `fixme` pull-out test (skipped).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: 3D crate home with keyboard, wheel and sound"
```

---

### Task 7: Project pages: back of box, videos, tabs

**Files:**
- Create: `src/components/LiteYouTube.astro`, `src/scripts/lite-youtube.ts`, `src/components/BackOfBox.astro`, `src/scripts/project.ts`, `src/pages/work/[slug].astro`, `tests/e2e/project.spec.ts`
- Modify: `tests/e2e/home.spec.ts` (remove `fixme`)

**Interfaces:**
- Consumes: `Cartridge`, `spineVar`, collection entries, `Base`.
- Produces: `LiteYouTube` props `{ id: string; title: string }`; `BackOfBox` props `{ project: CollectionEntry<'projects'> }` with a default slot for the Markdown body; `initTabs(): void` and `initTeardown(root: HTMLElement): void` exported from `src/scripts/project.ts` (`initTeardown` implemented in Task 8 — export a no-op here). Tab hooks: `[data-tabs]`, `[role=tab][aria-controls]`, `[role=tabpanel]`.

- [ ] **Step 1: Write the failing tests** `tests/e2e/project.spec.ts`

```ts
import { test, expect } from '@playwright/test';

const slugs = ['evacolregs', 'frequency-zero', 'saridena-archviz', 'ctrlaltexp-touch', 'ctrlaltexp-vr', 'trapped-in-terror'];

for (const slug of slugs) {
  test(`${slug} renders without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(`/work/${slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('light project hides blocks it has no data for', async ({ page }) => {
  await page.goto('/work/trapped-in-terror');
  await expect(page.locator('[data-block="team"]')).toHaveCount(0);
  await expect(page.locator('[data-block="dates"]')).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Manual' })).toHaveCount(0);
});

test('video loads only after click', async ({ page }) => {
  await page.goto('/work/ctrlaltexp-vr');
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('link', { name: /play video/i }).first().click();
  await expect(page.locator('iframe[src*="youtube-nocookie.com/embed/L4FsMwSXhO8"]')).toHaveCount(1);
});

test('tabs switch between back of box and manual', async ({ page }) => {
  await page.goto('/work/frequency-zero');
  await page.getByRole('tab', { name: 'Manual' }).click();
  await expect(page.getByRole('tab', { name: 'Manual' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-manual')).toBeVisible();
  await expect(page.locator('#panel-box')).toBeHidden();
});

test.describe('phone', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('project page has no horizontal scroll', async ({ page }) => {
    await page.goto('/work/evacolregs');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run build && npx playwright test tests/e2e/project.spec.ts`
Expected: FAIL (404s).

- [ ] **Step 3: `src/components/LiteYouTube.astro` and `src/scripts/lite-youtube.ts`**

```astro
---
interface Props { id: string; title: string }
const { id, title } = Astro.props;
---
<a class="lite-yt" href={`https://www.youtube.com/watch?v=${id}`} data-yt={id} data-title={title}>
  <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" width="480" height="360" loading="lazy" decoding="async" />
  <span class="play label"><span class="visually-hidden">Play video: </span>▶ {title}</span>
</a>

<script>
  import { initLiteYouTube } from '../scripts/lite-youtube';
  initLiteYouTube();
</script>

<style>
  .lite-yt { position: relative; display: block; aspect-ratio: 16 / 9; background: var(--color-ink); overflow: hidden; border-radius: var(--rounded-sm); }
  .lite-yt img { width: 100%; height: 100%; object-fit: cover; opacity: 0.75; }
  .play { position: absolute; left: var(--spacing-md); bottom: var(--spacing-md); background: var(--color-primary); color: var(--color-paper); padding: var(--spacing-sm) var(--spacing-md); }
  .lite-yt:hover img { opacity: 1; }
  .lite-yt :global(iframe) { width: 100%; height: 100%; border: 0; }
</style>
```

```ts
export function initLiteYouTube(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-yt]').forEach((a) => {
    if (a.dataset.bound) return;
    a.dataset.bound = '1';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${a.dataset.yt}?autoplay=1`;
      iframe.title = a.dataset.title ?? 'Video';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      a.replaceChildren(iframe);
      a.removeAttribute('href');
    });
  });
}
```

- [ ] **Step 4: `src/components/BackOfBox.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import Cartridge from './Cartridge.astro';
import LiteYouTube from './LiteYouTube.astro';

interface Props { project: CollectionEntry<'projects'> }
const d = Astro.props.project.data;
const rows = [
  ['role', 'Role', d.role],
  ['client', 'Client', d.client],
  ['engine', 'Engine', d.engine],
  ['platform', 'Platform', d.platform],
  ['team', 'Team', d.team],
  ['dates', 'Dates', d.dates],
  ['status', 'Status', d.status],
].filter(([, , v]) => v) as [string, string, string][];
---
<div class="back">
  <div class="box-art">
    <Cartridge size="box" title={d.title} spine={d.spine} cover={d.cover} youtubeId={d.videos[0]?.youtubeId} caption={d.tagline ?? d.genre} />
  </div>
  <div class="panel summary">
    <header class="panel-header label"><span>Back of box</span><span>{d.genre}</span></header>
    <div class="summary-body">
      <dl>{rows.map(([key, label, value]) => (<div data-block={key}><dt class="label">{label}</dt><dd>{value}</dd></div>))}</dl>
      <div class="pitch"><slot /></div>
      {d.facts.length > 0 && <ul class="facts" data-block="facts">{d.facts.map((f) => <li class="prompt">{f}</li>)}</ul>}
      {d.videos.length > 0 && <div class="videos" data-block="videos">{d.videos.map((v) => <LiteYouTube id={v.youtubeId} title={v.title} />)}</div>}
      {d.features.length > 0 && (
        <div data-block="features"><h2 class="title">Features</h2><ul>{d.features.map((f) => <li>{f}</li>)}</ul></div>
      )}
      {d.tools.length > 0 && <p class="body-sm tools" data-block="tools">{d.tools.join(' · ')}</p>}
    </div>
  </div>
</div>

<style>
  .back { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: var(--spacing-xl); align-items: start; }
  .box-art { transform: perspective(1200px) rotateY(14deg); }
  .summary-body { padding: var(--spacing-lg); display: grid; gap: var(--spacing-lg); }
  dl { margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--spacing-md); }
  dt { color: var(--color-primary); }
  dd { margin: var(--spacing-xs) 0 0; font-size: 14px; }
  .pitch :global(p) { margin: 0; max-width: 68ch; }
  .facts { list-style: none; padding: 0; margin: 0; font-weight: 600; }
  .videos { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--spacing-md); }
  .tools { color: var(--color-ink-muted); margin: 0; }
  @media (max-width: 1023px) { .back { grid-template-columns: 1fr; } .box-art { transform: none; max-width: 320px; } }
</style>
```

- [ ] **Step 5: `src/scripts/project.ts`**

```ts
export function initTabs(): void {
  const tablist = document.querySelector<HTMLElement>('[data-tabs]');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (tab: HTMLButtonElement) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')!);
      if (panel) panel.hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus();
      select(next);
    });
  });
  tablist.hidden = false;
  select(tabs[0]);
}

export function initTeardown(_root: HTMLElement): void {
  // Implemented in Task 8.
}
```

- [ ] **Step 6: `src/pages/work/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import BackOfBox from '../../components/BackOfBox.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({ params: { slug: project.id }, props: { project } }));
}

const { project } = Astro.props;
const d = project.data;
const { Content } = await render(project);
const hasManual = d.tier === 'full';
const ogImage = d.cover?.src ?? (d.videos[0] ? `https://i.ytimg.com/vi/${d.videos[0].youtubeId}/hqdefault.jpg` : '/og.png');
---
<Base title={`${d.title} · Atharva Shewale`} description={d.oneLine} image={ogImage}>
  <div class="container page">
    <a class="label muted back-link" href="/#projects">‹ Back to crate</a>
    <h1 class="h-lg">{d.title}</h1>
    <p class="prompt lede">{d.oneLine}</p>

    <div class="tabs" data-tabs role="tablist" aria-label="Project sections" hidden>
      <button class="btn btn-ghost" role="tab" id="tab-box" aria-controls="panel-box" type="button">Back of box</button>
      {hasManual && <button class="btn btn-ghost" role="tab" id="tab-manual" aria-controls="panel-manual" type="button">Manual</button>}
      {d.links.map((l) => <a class="btn btn-ghost" href={l.href} rel="noopener">{l.label} ↗</a>)}
    </div>

    <section id="panel-box" role="tabpanel" aria-labelledby="tab-box">
      <BackOfBox project={project}><Content /></BackOfBox>
    </section>
    {hasManual && (
      <section id="panel-manual" role="tabpanel" aria-labelledby="tab-manual">
        <p class="body-sm muted">Manual</p>
      </section>
    )}
  </div>
</Base>

<script>
  import { initTabs } from '../../scripts/project';
  initTabs();
</script>

<style>
  .page { padding-block: var(--spacing-xl) var(--spacing-3xl); display: grid; gap: var(--spacing-lg); }
  .back-link { text-decoration: none; }
  .lede { margin: 0; max-width: 68ch; }
  .tabs { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }
  .tabs [aria-selected="true"] { background: var(--color-paper); color: var(--color-ink); border-color: var(--color-paper); }
</style>
```

(Tabs stay `hidden` without JS, so no-JS readers see every panel in order. The manual panel body is filled in Task 8; the build would fail the placeholder check only on bracket text, and `Manual` is not a placeholder.)

- [ ] **Step 7: Un-skip the pull-out test**

In `tests/e2e/home.spec.ts` change `test.fixme('pull out opens the project page'` back to `test(`.

- [ ] **Step 8: Run to verify pass**

Run: `npm run build && npx playwright test`
Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: project pages with back of box, lite YouTube and tabs"
```

---

### Task 8: Manual: chip board, teardown, troubleshooting, credits

**Files:**
- Create: `src/components/ChipBoard.astro`, `src/components/Manual.astro`
- Modify: `src/scripts/project.ts` (implement `initTeardown`), `src/pages/work/[slug].astro` (render Manual), `tests/e2e/project.spec.ts` (add tests)

**Interfaces:**
- Consumes: `data.chips`, `data.troubleshooting`, `data.credits`, `playBlip`.
- Produces: `ChipBoard` props `{ chips: Chip[] }`; `Manual` props `{ project: CollectionEntry<'projects'> }`; DOM hooks `[data-board]`, `[data-chip="<id>"]`, `[data-chip-panel="<id>"]`, `[data-teardown-close]`.

- [ ] **Step 1: Write the failing tests** (append to `tests/e2e/project.spec.ts`)

```ts
test('selecting a chip shows its teardown; Esc returns to the board', async ({ page }) => {
  await page.goto('/work/frequency-zero');
  await page.getByRole('tab', { name: 'Manual' }).click();
  await page.locator('[data-chip="senses"]').click();
  await expect(page.locator('[data-chip="senses"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-chip-panel="senses"]')).toBeVisible();
  await expect(page.locator('[data-chip-panel="ping-pool"]')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-chip="senses"]')).toBeFocused();
});

test('arrow keys move between chips', async ({ page }) => {
  await page.goto('/work/evacolregs');
  await page.getByRole('tab', { name: 'Manual' }).click();
  await page.locator('[data-chip="multiplayer"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-chip="bam"]')).toBeFocused();
  await expect(page.locator('[data-chip-panel="bam"]')).toBeVisible();
});

test('credits list my work first', async ({ page }) => {
  await page.goto('/work/frequency-zero');
  await page.getByRole('tab', { name: 'Manual' }).click();
  await expect(page.locator('#credits li').first()).toContainText('Ping system integration');
});

test.describe('no JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('every chip panel and the manual are readable', async ({ page }) => {
    await page.goto('/work/evacolregs');
    await expect(page.locator('#panel-manual')).toBeVisible();
    await expect(page.locator('[data-chip-panel]:visible')).toHaveCount(6);
  });
  test('home falls back to Quick Start', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#projects li')).toHaveCount(6);
    await expect(page.locator('[data-crate]')).toBeHidden();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run build && npx playwright test tests/e2e/project.spec.ts`
Expected: FAIL (`[data-chip]` not found).

- [ ] **Step 3: `src/components/ChipBoard.astro`**

```astro
---
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
type Chip = CollectionEntry<'projects'>['data']['chips'][number];

interface Props { chips: Chip[] }
const { chips } = Astro.props;
const num = (i: number) => String(i + 1).padStart(2, '0');
---
<div class="teardown" data-board>
  <div class="board-wrap">
    <div class="board">
      <ul class="chips">
        {chips.map((c, i) => (
          <li><button class="chip label" type="button" data-chip={c.id} aria-pressed={i === 0 ? 'true' : 'false'} aria-controls={`chip-${c.id}`}>{c.title}</button></li>
        ))}
      </ul>
      <div class="contacts" aria-hidden="true"></div>
    </div>
    <p class="body-sm muted prompt">Every chip is a system I built. Select one to see how it works.</p>
  </div>

  <div class="panels">
    {chips.map((c, i) => (
      <article class="panel chip-panel" id={`chip-${c.id}`} data-chip-panel={c.id}>
        <header class="panel-header label"><span>Teardown · chip {num(i)}</span><button class="label close" type="button" data-teardown-close>Esc close</button></header>
        <div class="chip-body">
          <h3 class="h-md">{c.title}</h3>
          {c.still && <Image src={c.still} alt={`${c.title} in the editor`} widths={[480, 960]} sizes="(max-width: 1023px) 100vw, 640px" />}
          <dl>
            <dt>Problem</dt><dd>{c.problem}</dd>
            <dt>Approach</dt><dd>{c.approach}</dd>
            <dt>Result</dt><dd>{c.result}</dd>
          </dl>
        </div>
      </article>
    ))}
  </div>
</div>

<div class="panel spec">
  <h3 class="label spec-h">Spec sheet</h3>
  <table>
    <tbody>
      {chips.map((c, i) => (<tr><th scope="row">{num(i)} · {c.title}</th><td>{c.summary}</td></tr>))}
    </tbody>
  </table>
</div>

<style>
  .teardown { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--spacing-xl); align-items: start; }
  .board { background: var(--color-board); border-radius: var(--rounded-md); padding: var(--spacing-xl); background-image: radial-gradient(color-mix(in srgb, var(--color-contact) 25%, transparent) 1px, transparent 1px); background-size: 16px 16px; }
  .chips { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-lg); }
  .chip { width: 100%; min-height: 88px; background: var(--color-ink); color: var(--color-paper); border: 2px solid transparent; border-radius: var(--rounded-none); padding: var(--spacing-md); cursor: pointer;
    box-shadow: 0 -6px 0 -2px var(--color-contact), 0 6px 0 -2px var(--color-contact); }
  .chip[aria-pressed="true"] { background: var(--color-surface-raised); border-color: var(--color-primary); border-radius: var(--rounded-sm); }
  .contacts { height: 24px; margin-top: var(--spacing-xl); background: repeating-linear-gradient(to right, var(--color-contact) 0 8px, transparent 8px 14px); }
  .chip-body { padding: var(--spacing-lg); display: grid; gap: var(--spacing-md); }
  .close { background: none; border: 0; color: inherit; cursor: pointer; }
  dl { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: var(--spacing-sm) var(--spacing-md); }
  dt::before { content: '> '; }
  dt { font-weight: 600; }
  dd { margin: 0; }
  .spec { margin-top: var(--spacing-xl); padding: var(--spacing-lg); }
  .spec-h { color: var(--color-ink-muted); margin-bottom: var(--spacing-md); }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: var(--spacing-sm) 0; border-top: 1px solid color-mix(in srgb, var(--color-ink) 15%, transparent); vertical-align: top; }
  th { font-weight: 400; padding-right: var(--spacing-lg); width: 40%; }
  /* JS on: show only the selected panel. JS off: all panels stack, readable. */
  :global(html[data-mode]) .teardown[data-js] .chip-panel:not([data-active]) { display: none; }
  .teardown:not([data-js]) .close { display: none; }
  @media (max-width: 1023px) { .teardown { grid-template-columns: 1fr; } dl { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 4: `src/components/Manual.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import ChipBoard from './ChipBoard.astro';

interface Props { project: CollectionEntry<'projects'> }
const d = Astro.props.project.data;
---
<div class="manual">
  <section class="chapter" aria-labelledby="ch1">
    <p class="label chapter-no">Chapter 01</p>
    <h2 id="ch1" class="h-md">Systems I built</h2>
    <ChipBoard chips={d.chips} />
  </section>

  {d.troubleshooting.length > 0 && (
    <section class="panel chapter page" aria-labelledby="ch2">
      <p class="label chapter-no">Chapter 02</p>
      <h2 id="ch2" class="h-md">Troubleshooting</h2>
      <ol class="stories">
        {d.troubleshooting.map((t) => (
          <li><dl><dt>Challenge</dt><dd>{t.challenge}</dd><dt>Tried</dt><dd>{t.tried}</dd><dt>Fix</dt><dd>{t.fix}</dd></dl></li>
        ))}
      </ol>
    </section>
  )}

  <section class="panel chapter page" id="credits" aria-labelledby="ch3">
    <p class="label chapter-no">Chapter 03</p>
    <h2 id="ch3" class="h-md">Credits</h2>
    <h3 class="title">Atharva Shewale · {d.role}</h3>
    <ul>{d.credits.mine.map((m) => <li>{m}</li>)}</ul>
    {d.credits.team.length > 0 && (
      <ul class="team body-sm">{d.credits.team.map((t) => <li><strong>{t.name}</strong> · {t.role}</li>)}</ul>
    )}
  </section>
</div>

<style>
  .manual { display: grid; gap: var(--spacing-xl); }
  .chapter-no { color: var(--color-primary-bright); }
  .page .chapter-no { color: var(--color-primary); }
  .chapter > h2 { margin-block: var(--spacing-sm) var(--spacing-lg); }
  .page { padding: var(--spacing-xl); }
  .stories { padding-left: var(--spacing-lg); display: grid; gap: var(--spacing-lg); margin: 0; }
  dl { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: var(--spacing-xs) var(--spacing-md); }
  dt { font-weight: 600; }
  dt::before { content: '> '; }
  dd { margin: 0; max-width: 72ch; }
  .team { list-style: none; padding: 0; color: var(--color-ink-muted); display: grid; gap: var(--spacing-xs); }
  @media (max-width: 767px) { dl { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 5: Implement `initTeardown`** (replace the stub in `src/scripts/project.ts`; add the import at the top)

```ts
import { playBlip } from './sound';

export function initTeardown(root: HTMLElement): void {
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-chip]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-chip-panel]')];
  let active = 0;
  root.setAttribute('data-js', '');

  const select = (i: number, focus = false, silent = false) => {
    active = i;
    chips.forEach((c, j) => {
      c.setAttribute('aria-pressed', String(j === i));
      c.tabIndex = j === i ? 0 : -1;
    });
    panels.forEach((p, j) => p.toggleAttribute('data-active', j === i));
    if (focus) chips[i].focus();
    if (!silent) playBlip('select');
  };

  chips.forEach((c, i) => {
    c.addEventListener('click', () => select(i));
    c.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      select((i + d + chips.length) % chips.length, true);
    });
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') chips[active].focus();
  });
  root.querySelectorAll('[data-teardown-close]').forEach((b) => b.addEventListener('click', () => chips[active].focus()));
  select(0, false, true);
}
```

- [ ] **Step 6: Render the manual** in `src/pages/work/[slug].astro`

Add `import Manual from '../../components/Manual.astro';`, replace `<p class="body-sm muted">Manual</p>` with `<Manual project={project} />`, and extend the script:
```ts
import { initTabs, initTeardown } from '../../scripts/project';
initTabs();
const board = document.querySelector<HTMLElement>('[data-board]');
if (board) initTeardown(board);
```

- [ ] **Step 7: Run to verify pass**

Run: `npm run build && npx playwright test`
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: manual with chip teardown, troubleshooting and credits"
```

---

### Task 9: SEO, sharing image, robots, 404

**Files:**
- Create: `scripts/make-og.mjs`, `public/og.png` (generated), `src/pages/robots.txt.ts`, `src/pages/404.astro`
- Modify: `tests/e2e/site.spec.ts`

**Interfaces:**
- Consumes: `Astro.site`, `Base`.
- Produces: `/robots.txt`, `/sitemap-index.xml` (from @astrojs/sitemap), `/og.png`, `/404.html`.

- [ ] **Step 1: Write the failing tests** (append to `tests/e2e/site.spec.ts`)

```ts
test('robots and sitemap exist', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain('Sitemap: ');
  expect((await request.get('/sitemap-index.xml')).ok()).toBeTruthy();
  expect((await request.get('/og.png')).ok()).toBeTruthy();
});

test('home has Person JSON-LD and OG tags', async ({ page }) => {
  await page.goto('/');
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
  expect(ld['@type']).toBe('Person');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og\.png$/);
});

test('unknown route shows the 404 page', async ({ page }) => {
  const res = await page.goto('/nope');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /cartridge not found/i })).toBeVisible();
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run build && npx playwright test tests/e2e/site.spec.ts`
Expected: FAIL (no robots, og, 404).

- [ ] **Step 3: `scripts/make-og.mjs`**

```js
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
```

Run: `npm run og`

- [ ] **Step 4: `src/pages/robots.txt.ts`**

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap-index.xml', site)}\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
```

- [ ] **Step 5: `src/pages/404.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Cartridge not found · Atharva Shewale" description="This page doesn't exist.">
  <section class="container nf">
    <h1 class="h-lg">Cartridge not found</h1>
    <p class="prompt">That slot in the crate is empty.</p>
    <a class="btn btn-primary" href="/">Back to the crate</a>
  </section>
</Base>
<style>
  .nf { padding-block: var(--spacing-3xl); display: grid; gap: var(--spacing-lg); justify-items: start; }
</style>
```

- [ ] **Step 6: Run to verify pass**

Run: `npm run build && npx playwright test tests/e2e/site.spec.ts`
Expected: PASS. (`astro preview` serves `404.html` with status 404.)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: share image, robots, sitemap and 404 page"
```

---

### Task 10: Link crawl and Lighthouse budget

**Files:**
- Create: `lighthouserc.json`
- Modify: `tests/e2e/site.spec.ts`

**Interfaces:**
- Consumes: built `dist/`.

- [ ] **Step 1: Write the failing link-crawl test** (append to `tests/e2e/site.spec.ts`)

```ts
test('every internal link resolves', async ({ page, request }) => {
  const seen = new Set<string>();
  const queue = ['/'];
  while (queue.length) {
    const path = queue.shift()!;
    if (seen.has(path)) continue;
    seen.add(path);
    await page.goto(path);
    const hrefs = await page.$$eval('a[href^="/"]', (as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!));
    for (const h of hrefs) {
      const clean = h.split('#')[0] || '/';
      if (!seen.has(clean) && !clean.endsWith('.pdf')) queue.push(clean);
    }
  }
  for (const path of seen) expect((await request.get(path)).status(), path).toBe(200);
  expect((await request.get('/resume.pdf')).status()).toBe(200);
  expect(seen.size).toBeGreaterThanOrEqual(7);
});
```

- [ ] **Step 2: Run it**

Run: `npm run build && npx playwright test -g "every internal link"`
Expected: PASS. If a link 404s, fix the href in the component that produced it.

- [ ] **Step 3: `lighthouserc.json`**

```json
{
  "ci": {
    "collect": { "staticDistDir": "./dist", "url": ["/index.html", "/work/evacolregs/index.html"], "numberOfRuns": 1 },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    },
    "upload": { "target": "filesystem", "outputDir": ".lighthouseci" }
  }
}
```

- [ ] **Step 4: Run Lighthouse**

Run: `npm run lhci`
Expected: all assertions pass. Common fixes if not: add `width`/`height` to any `<img>` missing them; ensure only two font files load above the fold (`@fontsource` 400 for Silkscreen and Plex); contrast issues mean a token pair outside `DESIGN.md` components was used — switch to a listed pair.

- [ ] **Step 5: Check JS budget**

Run: `npx astro build && find dist/_astro -name "*.js" -exec sh -c 'gzip -c "$1" | wc -c' _ {} \;`
Expected: total under 20480 bytes per page (the site has at most four small modules).

- [ ] **Step 6: Run the whole suite and commit**

Run: `npm test && npm run build && npx playwright test`
Expected: all PASS.

```bash
git add -A
git commit -m "test: internal link crawl and Lighthouse budgets"
```

---

### Task 11: Deploy to Vercel and generate the QR code

**Files:**
- Create: `scripts/make-qr.mjs`, `public/qr.svg`, `public/qr.png`
- Modify: none

**Interfaces:**
- Consumes: production URL from Vercel.
- Produces: live site; `public/qr.svg`, `public/qr.png`.

The user does the account steps; the agent prepares and verifies.

- [ ] **Step 1: User creates the GitHub repo and pushes** (user runs, or authorises `gh`)

```bash
gh auth login
gh repo create atharva-portfolio --public --source . --push
```

- [ ] **Step 2: User imports into Vercel**

At vercel.com/new: import `atharva-portfolio`, framework preset Astro, project name `atharva-shewale` (gives `https://atharva-shewale.vercel.app`). Add env var `SITE_URL=https://atharva-shewale.vercel.app` (or the URL Vercel actually assigns). Deploy.

- [ ] **Step 3: Agent verifies production**

Run: `curl -sI https://atharva-shewale.vercel.app | head -1` and `curl -s https://atharva-shewale.vercel.app/robots.txt`
Expected: `HTTP/2 200`; robots contains `Sitemap: https://atharva-shewale.vercel.app/sitemap-index.xml`.

- [ ] **Step 4: `scripts/make-qr.mjs`**

```js
import QRCode from 'qrcode';

const url = process.argv[2];
if (!url?.startsWith('https://')) {
  console.error('Usage: npm run qr -- https://your-live-url');
  process.exit(1);
}
const opts = { errorCorrectionLevel: 'H', margin: 4, color: { dark: '#1c1b1fff', light: '#f1e8d4ff' } };
await QRCode.toFile('public/qr.svg', url, { ...opts, type: 'svg' });
await QRCode.toFile('public/qr.png', url, { ...opts, width: 1024 });
console.log(`QR for ${url} written to public/qr.svg and public/qr.png`);
```

Run: `npm run qr -- https://atharva-shewale.vercel.app`
Expected: both files written. (Dark ink on cream: scanners need dark modules on a light background.)

- [ ] **Step 5: Verify the QR decodes**

Open `public/qr.png` in the browser pane and scan it with a phone; it must open the live site on the phone in Quick Start mode.

- [ ] **Step 6: Commit and push**

```bash
git add scripts/make-qr.mjs public/qr.svg public/qr.png
git commit -m "chore: QR code for the live site"
git push
```

---

## Self-Review

1. **Spec coverage:** §1 success criteria → Tasks 5, 6, 8, 10. §2 scope → Tasks 5–9 (exploded view and code links excluded per spec). §3 stack → Task 1. §4 IA and spine table → Tasks 4, 5, 7. §5.1 → Task 6. §5.2 → Task 5. §5.3 → Tasks 7–8. §5.4 → Task 7. §6 content model → Task 4 (`blueprint` field implemented as `still`). §7 assets → Task 4 (FZ cover); eDOT assets wait on permission. §8 → Tasks 2, 5, 6, 8, 10. §9 → Tasks 5, 7, 9. §10 → Task 11. §11 → Tasks 1–10. §12 open items stay with the user.
2. **Placeholders:** none in the plan's code; content uses only facts from the source docs and résumé. Frequency Zero dates use the résumé value (Oct 2025 – Present) until the user confirms.
3. **Type consistency:** `keyToIndex`, `createWheelStepper(deltaY, now)`, `wrapIndex` match between Tasks 2 and 6; `initTeardown(root)` stub in Task 7 and implementation in Task 8 share the signature; `spineVar(Spine)` used by Tasks 5–6; DOM hooks match between components and tests.
4. **Review Focus:** each of the five lines has a test: missing data (Task 7), blocked storage (Task 5), wheel burst (Tasks 2, 6), 375px (Tasks 5, 7), no-JS (Task 8).
