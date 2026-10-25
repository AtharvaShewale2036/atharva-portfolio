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
  test('header keeps résumé and nav on phones', async ({ page }) => {
    await page.goto('/work/evacolregs');
    await expect(page.locator('header').getByRole('link', { name: 'Résumé (PDF)' })).toBeVisible();
    await expect(page.locator('header nav').getByRole('link', { name: 'Contact' })).toBeVisible();
  });
});

test('mode toggle on a project page goes home in that mode', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/work/frequency-zero');
  await page.getByRole('button', { name: 'List view' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'quick');
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

test('selecting a chip shows its teardown; Esc returns to the board', async ({ page }) => {
  await page.goto('/work/frequency-zero');
  await page.getByRole('tab', { name: 'Manual' }).click();
  await page.locator('[data-chip="senses"]').click();
  await expect(page.locator('[data-chip="senses"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-chip-panel="senses"]')).toBeVisible();
  await expect(page.locator('[data-chip-panel="ping-pool"]')).toBeHidden();
  await page.locator('[data-chip-panel="senses"] [data-teardown-close]').focus();
  await expect(page.locator('[data-chip="senses"]')).not.toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-chip="senses"]')).toBeFocused();
});

test('Home and End jump to first and last chip', async ({ page }) => {
  await page.goto('/work/evacolregs');
  await page.getByRole('tab', { name: 'Manual' }).click();
  const chips = page.locator('[data-chip]');
  const n = await chips.count();
  await chips.nth(2).focus();
  await page.keyboard.press('End');
  await expect(chips.nth(n - 1)).toBeFocused();
  await page.keyboard.press('Home');
  await expect(chips.first()).toBeFocused();
});

test('arrow keys move between chips', async ({ page }) => {
  await page.goto('/work/evacolregs');
  await page.getByRole('tab', { name: 'Manual' }).click();
  await page.locator('[data-chip="multiplayer"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-chip="bam"]')).toBeFocused();
  await expect(page.locator('[data-chip-panel="bam"]')).toBeVisible();
});

test('systems chapter lists my work, without spec sheet or troubleshooting', async ({ page }) => {
  await page.goto('/work/evacolregs');
  await page.getByRole('tab', { name: 'Manual' }).click();
  await expect(page.locator('#my-work li')).toHaveCount(7);
  await expect(page.locator('#my-work li').first()).toContainText('Multiplayer layer from prototype to completion');
  await expect(page.getByText('Spec sheet')).toHaveCount(0);
  await expect(page.getByText('Troubleshooting')).toHaveCount(0);
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
