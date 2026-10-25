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
