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

test('light page has no tablist tabs', async ({ page }) => {
  await page.goto('/work/trapped-in-terror');
  await expect(page.getByRole('tab')).toHaveCount(0);
});

test.describe('no JS', () => {
  test.use({ javaScriptEnabled: false });
  test('external links stay visible', async ({ page }) => {
    await page.goto('/work/frequency-zero');
    await expect(page.getByRole('link', { name: 'Play on itch.io ↗' })).toBeVisible();
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('box art is not tilted', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/work/frequency-zero');
    const t = await page.locator('.box-art').first().evaluate((el) => getComputedStyle(el).transform);
    expect(t).toBe('none');
  });
});
