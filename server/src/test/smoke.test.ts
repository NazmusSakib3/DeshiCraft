import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { MongoMemoryServer } from 'mongodb-memory-server';

// These must be set before importing modules that read env at load time.
let mongod: MongoMemoryServer;
let server: Server;
let baseUrl = '';

// Dynamically imported after env is configured.
let mongoose: typeof import('mongoose');

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-32-characters-long';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-characters-long';
  process.env.NODE_ENV = 'test';

  mongoose = (await import('mongoose')).default as unknown as typeof import('mongoose');
  const { connectDB } = await import('../config/db.js');
  const { createApp } = await import('../app.js');
  await connectDB();

  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await mongoose.disconnect();
  await mongod.stop();
});

interface ApiOptions {
  method?: string;
  token?: string;
  body?: unknown;
}

async function apiFetch(path: string, options: ApiOptions = {}) {
  const res = await fetch(`${baseUrl}/api${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

test('health endpoint responds', async () => {
  const { status, data } = await apiFetch('/health');
  assert.equal(status, 200);
  assert.equal(data.status, 'ok');
});

test('full commerce flow: seed -> login -> product -> order -> status -> stats', async () => {
  const { User } = await import('../models/User.js');
  const { Category } = await import('../models/Category.js');
  const { slugify } = await import('../utils/slug.js');

  // Seed an admin, a seller and a category directly.
  await User.create({ name: 'Admin', email: 'admin@test.local', password: 'Admin123!', role: 'admin' });
  await User.create({
    name: 'Seller',
    email: 'seller@test.local',
    password: 'Seller123!',
    role: 'seller',
    sellerProfile: { shopName: 'Test Shop', approved: true },
  });
  const category = await Category.create({ name: 'Pottery', slug: slugify('Pottery') });

  // Seller logs in.
  const sellerLogin = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: 'seller@test.local', password: 'Seller123!' },
  });
  assert.equal(sellerLogin.status, 200);
  const sellerToken = sellerLogin.data.accessToken as string;
  assert.equal(sellerLogin.data.user.role, 'seller');

  // Seller creates a product.
  const createProduct = await apiFetch('/products', {
    method: 'POST',
    token: sellerToken,
    body: {
      title: 'Clay Pot',
      description: 'A lovely handmade clay pot for testing.',
      price: 500,
      images: ['https://example.com/pot.jpg'],
      category: String(category._id),
      stock: 5,
    },
  });
  assert.equal(createProduct.status, 201);
  const product = createProduct.data.product;
  assert.equal(product.stock, 5);

  // Public product listing includes it.
  const list = await apiFetch('/products');
  assert.equal(list.status, 200);
  assert.equal(list.data.total, 1);

  // Customer registers.
  const register = await apiFetch('/auth/register', {
    method: 'POST',
    body: { name: 'Buyer', email: 'buyer@test.local', password: 'Buyer123!' },
  });
  assert.equal(register.status, 201);
  const customerToken = register.data.accessToken as string;

  // Customer places an order for 2 units.
  const order = await apiFetch('/orders', {
    method: 'POST',
    token: customerToken,
    body: {
      items: [{ product: product._id, quantity: 2 }],
      shippingAddress: {
        fullName: 'Buyer',
        phone: '+8801700000000',
        street: '1 Test Road',
        city: 'Dhaka',
        district: 'Dhaka',
      },
      paymentMethod: 'cod',
    },
  });
  assert.equal(order.status, 201);
  assert.equal(order.data.order.total, 500 * 2 + 60);
  const orderId = order.data.order._id as string;

  // Stock should have decremented from 5 to 3.
  const productAfter = await apiFetch(`/products/${product.slug}`);
  assert.equal(productAfter.data.product.stock, 3);

  // Customer sees the order.
  const myOrders = await apiFetch('/orders/mine', { token: customerToken });
  assert.equal(myOrders.data.orders.length, 1);

  // Seller advances the order status pending -> confirmed.
  const statusUpdate = await apiFetch(`/orders/${orderId}/status`, {
    method: 'PATCH',
    token: sellerToken,
    body: { status: 'confirmed' },
  });
  assert.equal(statusUpdate.status, 200);
  assert.equal(statusUpdate.data.order.status, 'confirmed');

  // Invalid transition is rejected (confirmed -> delivered).
  const badTransition = await apiFetch(`/orders/${orderId}/status`, {
    method: 'PATCH',
    token: sellerToken,
    body: { status: 'delivered' },
  });
  assert.equal(badTransition.status, 400);

  // Admin can read stats.
  const adminLogin = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: 'admin@test.local', password: 'Admin123!' },
  });
  const adminToken = adminLogin.data.accessToken as string;
  const stats = await apiFetch('/admin/stats', { token: adminToken });
  assert.equal(stats.status, 200);
  assert.equal(stats.data.stats.orderCount, 1);

  // Customer cannot access admin stats (RBAC).
  const forbidden = await apiFetch('/admin/stats', { token: customerToken });
  assert.equal(forbidden.status, 403);
});
