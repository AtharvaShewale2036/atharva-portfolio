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
