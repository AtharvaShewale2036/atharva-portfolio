import { test, expect } from '@playwright/test';

test('home renders with title and résumé link', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Atharva Shewale/);
  await expect(page.locator('header').getByRole('link', { name: 'Résumé (PDF)' })).toHaveAttribute('href', '/resume.pdf');
});
