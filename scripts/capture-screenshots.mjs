import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const customerPassword = process.env.E2E_CUSTOMER_PASSWORD ?? 'Customer123!'; // NOSONAR screenshot script fixture

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseURL = 'https://deshicraft.vercel.app';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto(`${baseURL}/login`);
await page.getByRole('heading', { name: 'Welcome back' }).waitFor();
await page.getByPlaceholder('you@example.com').fill('customer@deshicraft.local');
await page.getByPlaceholder('********').fill(customerPassword);
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL((url) => !url.pathname.endsWith('/login'));

await page.evaluate(() => localStorage.removeItem('deshicraft-cart'));
await page.goto(`${baseURL}/shop`);
await page.locator('a[href^="/product/"]').first().click();
await page.getByRole('button', { name: /Add to cart/i }).click();

await page.goto(`${baseURL}/checkout`);
await page.getByRole('heading', { name: 'Checkout' }).waitFor();
await page.getByPlaceholder('you@example.com').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
const fullName = page.locator('input').nth(0);
if (await fullName.inputValue() === '') {
  await fullName.fill('Ayesha Rahman');
  await page.getByPlaceholder('+8801...').fill('+8801712345678');
  await page.locator('select').selectOption({ label: 'Dhaka' });
  await page.locator('input').nth(3).fill('15 Green Road, Flat 4B');
  await page.locator('input').nth(4).fill('Dhaka');
  await page.locator('input').nth(5).fill('1205');
}
await page.getByRole('button', { name: /SSLCommerz/i }).click();

await page.screenshot({
  path: path.join(root, 'docs/screenshots/07-checkout.png'),
  fullPage: true,
});

const orderResponsePromise = page.waitForResponse(
  (res) => res.url().includes('/orders') && res.request().method() === 'POST',
  { timeout: 60_000 },
);
await page.getByRole('button', { name: 'Continue to payment' }).click();
const orderResponse = await orderResponsePromise;
if (!orderResponse.ok()) {
  throw new Error(`Order failed: ${orderResponse.status()} ${await orderResponse.text()}`);
}

const initResponse = await page.waitForResponse(
  (res) => res.url().includes('/payments/sslcommerz/init') && res.request().method() === 'POST',
  { timeout: 60_000 },
);
if (!initResponse.ok()) {
  throw new Error(`SSLCommerz init failed: ${initResponse.status()} ${await initResponse.text()}`);
}

await page.waitForURL(/sandbox\.sslcommerz\.com|securepay\.sslcommerz\.com/, { timeout: 60_000 });

await page.waitForLoadState('networkidle');
await page.screenshot({
  path: path.join(root, 'docs/screenshots/08-sslcommerz.png'),
  fullPage: true,
});

await browser.close();
console.log('Saved checkout and SSLCommerz screenshots');
