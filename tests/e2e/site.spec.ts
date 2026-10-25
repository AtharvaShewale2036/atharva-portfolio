import { test, expect } from '@playwright/test';

test('home renders with title and résumé link', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Atharva Shewale/);
  await expect(page.locator('header').getByRole('link', { name: 'Résumé (PDF)' })).toHaveAttribute('href', '/resume.pdf');
});

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

const ogSlugs = ['evacolregs', 'frequency-zero', 'saridena-archviz', 'ctrlaltexp-touch', 'ctrlaltexp-vr', 'trapped-in-terror'];
test('per-project OG images exist and are wired', async ({ page, request }) => {
  for (const s of ogSlugs) expect((await request.get(`/og/${s}.png`)).status(), s).toBe(200);
  await page.goto('/work/evacolregs');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/evacolregs\.png$/);
});
