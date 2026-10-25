import { test, expect } from '@playwright/test';

test.describe('phone', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('phones get the 3D crate and nothing scrolls sideways', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'full');
    await expect(page.locator('[data-crate]')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('list view is one tap away and has no sideways scroll', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-crate-card]:not([hidden])').getByRole('link', { name: 'List view' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'quick');
    await expect(page.locator('#projects li')).toHaveCount(6);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.getByRole('button', { name: '▶ 3D crate' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'full');
  });

  test('header is one compact row plus nav', async ({ page }) => {
    await page.goto('/');
    const h = await page.locator('.site-header').evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeLessThanOrEqual(110);
  });
});

test.describe('touch phone', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  test('first tap picks a cartridge, second tap opens it', async ({ page }) => {
    await page.goto('/');
    const title = page.locator('[data-cart]').nth(1).locator('.cart-title');
    const side = page.locator('[data-cart]').nth(1).locator('.side');
    const box = (await side.boundingBox())!;
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator('[data-crate-live]')).toContainText('02 of 06, Frequency Zero');
    await expect(page).toHaveURL(/\/$/);
    await title.tap();
    await expect(page).toHaveURL(/\/work\/frequency-zero/);
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
  await page.locator('header').getByRole('button', { name: 'List view' }).click();
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
  await page.locator('header').getByRole('button', { name: 'List view' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'quick');
});

test('contact links are real', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contact a[href="mailto:shatharva@gmail.com"]')).toHaveCount(1);
  await expect(page.locator('#contact a[href="https://wa.me/917041142749"]')).toHaveCount(1);
  await expect(page.locator('#contact a[href="tel:+917041142749"]')).toHaveCount(1);
});

test('hero CTAs are résumé and contact only (no repeats of the contact section)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#main .ctas a')).toHaveCount(2);
  await expect(page.locator('#main .ctas a[href="#contact"]')).toHaveCount(1);
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

  test('hovering a cartridge pulls it up and shows its card', async ({ page }) => {
    await page.goto('/');
    // The visible strip of a rear cartridge is its side face; move the mouse there like a user would.
    const box = (await page.locator('[data-cart]').nth(2).locator('.side').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator('[data-crate-live]')).toContainText('03 of 06, Saridena ArchViz');
    await expect(page.locator('[data-cart]').nth(2)).toHaveAttribute('data-active', '');
    await expect(page.locator('[data-crate-card]:not([hidden])')).toContainText('Saridena ArchViz');
  });

  test('scrolling over the crate scrolls the page', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-crate]').hover({ position: { x: 20, y: 20 } });
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test('clicking a cartridge opens its project', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-cart]').first().locator('.cart-title').click();
    await expect(page).toHaveURL(/\/work\/evacolregs/);
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

test('turning on reduced motion after load switches to the list', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'full');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'quick');
  await expect(page.locator('[data-crate]')).toBeHidden();
});
