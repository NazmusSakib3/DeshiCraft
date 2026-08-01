import { test, expect } from '@playwright/test';
import { customer, login, seller } from './helpers/auth';

const apiBase = (baseURL: string) =>
  baseURL.includes('localhost') ? 'http://localhost:5000/api' : 'https://deshicraft-api.onrender.com/api';

test.describe('Storefront checkout', () => {
  test('checkout page shows COD and online payment options', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('deshicraft-cart'));

    await login(page, customer.email, customer.password);
    await page.goto('/shop');
    await page.locator('a[href^="/product/"]').first().click();
    await page.getByRole('button', { name: /Add to cart/i }).click();

    await page.goto('/checkout');
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Cash on delivery/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Card \(Stripe\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /SSLCommerz/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Place order' })).toBeVisible();
  });

  test('seller confirms a COD order', async ({ page, request, baseURL }) => {
    const api = apiBase(baseURL!);

    const loginRes = await request.post(`${api}/auth/login`, {
      data: { email: customer.email, password: customer.password },
    });
    expect(loginRes.ok()).toBeTruthy();
    const { accessToken } = (await loginRes.json()) as { accessToken: string };

    const productsRes = await request.get(`${api}/products?limit=30`);
    expect(productsRes.ok()).toBeTruthy();
    const { items } = (await productsRes.json()) as {
      items: { _id: string; stock: number }[];
    };
    const product = items.find((p) => p.stock > 0);
    expect(product, 'Need an in-stock product for E2E').toBeTruthy();

    const orderRes = await request.post(`${api}/orders`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        items: [{ product: product!._id, quantity: 1 }],
        shippingAddress: {
          fullName: 'E2E Customer',
          phone: '01700000001',
          street: '15 Green Road',
          city: 'Dhaka',
          district: 'Dhaka',
          postalCode: '1205',
        },
        paymentMethod: 'cod',
      },
    });
    expect(orderRes.ok(), `Order create failed: ${orderRes.status()}`).toBeTruthy();
    const { order } = (await orderRes.json()) as { order: { orderNumber: string } };

    await login(page, seller.email, seller.password);
    await page.goto('/seller/orders');

    const orderCard = page.locator('.card', { hasText: order.orderNumber });
    await expect(orderCard).toBeVisible({ timeout: 30_000 });
    await orderCard.getByRole('button', { name: 'Confirm' }).click();
    await expect(orderCard.getByText('confirmed', { exact: true })).toBeVisible();
  });
});
