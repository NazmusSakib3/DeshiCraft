import type { Page } from '@playwright/test';

export const customer = {
  email: process.env.E2E_CUSTOMER_EMAIL ?? 'customer@deshicraft.local',
  password: process.env.E2E_CUSTOMER_PASSWORD ?? 'Customer123!',
};

export const seller = {
  email: process.env.E2E_SELLER_EMAIL ?? 'rina@deshicraft.local',
  password: process.env.E2E_SELLER_PASSWORD ?? 'Seller123!',
};

export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByRole('heading', { name: 'Welcome back' }).waitFor();
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('********').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 30_000 });
}
