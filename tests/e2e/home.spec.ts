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

test('quick start CTAs include WhatsApp', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#main .ctas a[href="https://wa.me/917041142749"]')).toHaveCount(1);
});

test('crate headline fits two lines at 1440', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const r = await page.locator('#crate-h').evaluate((el) => ({ h: el.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(el).lineHeight) }));
  expect(r.h).toBeLessThanOrEqual(r.lh * 2.2);
});

for (const width of [1200, 1440]) {
  test(`crate card is wide enough for its content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const r = await page.locator('[data-crate-card]:not([hidden])').evaluate((el) => ({ w: el.getBoundingClientRect().width, sw: el.scrollWidth, cw: el.clientWidth }));
    expect(r.w).toBeGreaterThanOrEqual(300);
    expect(r.sw).toBeLessThanOrEqual(r.cw + 1);
  });
}

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

test('narrowing the window after load forces Quick Start', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'full');
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'quick');
  await expect(page.locator('[data-crate]')).toBeHidden();
});

test('widening the window after a narrow load restores full mode', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'quick');
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'full');
  await expect(page.locator('[data-crate]')).toBeVisible();
});
