import { test, expect } from '@playwright/test';

test.describe('Public pages', () => {
  test('home and shop load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'DeshiCraft' })).toBeVisible();

    await page.goto('/shop');
    await expect(page.locator('a[href^="/product/"]').first()).toBeVisible();
  });

  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });
});
