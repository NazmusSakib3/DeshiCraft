import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEV_JWT_ACCESS_SECRET,
  DEV_JWT_REFRESH_SECRET,
  DEV_SEED_ADMIN_PASSWORD,
  DEV_SEED_CUSTOMER_PASSWORD,
  DEV_SEED_SELLER_PASSWORD,
} from './devDefaults.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(serverRoot, '.env') });

function required(name: string, fallback?: string): string {
  const raw = process.env[name] ?? fallback;
  const value = typeof raw === 'string' ? raw.trim().replace(/^['"]|['"]$/g, '') : raw;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function mongoUri(name: string, fallback?: string): string {
  const value = required(name, fallback);
  if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
    throw new Error(
      `${name} must start with mongodb:// or mongodb+srv:// (check for typos, quotes, or angle brackets around the password in Render env vars)`,
    );
  }
  return value;
}

function clientUrl(name: string, fallback?: string): string {
  const value = required(name, fallback);
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    throw new Error(
      `${name} must be an http(s) URL like https://deshicraft.vercel.app (not a database connection string)`,
    );
  }
  return value.replace(/\/$/, '');
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
  mongoUri: mongoUri('MONGO_URI', 'mongodb://127.0.0.1:27017/deshicraft'),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', DEV_JWT_ACCESS_SECRET),
    refreshSecret: required('JWT_REFRESH_SECRET', DEV_JWT_REFRESH_SECRET),
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  },
  clientUrl: clientUrl('CLIENT_URL', 'http://localhost:5173'),
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL ?? 'admin@deshicraft.local',
    adminPassword: process.env.SEED_ADMIN_PASSWORD ?? DEV_SEED_ADMIN_PASSWORD,
    customerPassword: process.env.SEED_CUSTOMER_PASSWORD ?? DEV_SEED_CUSTOMER_PASSWORD,
    sellerPassword: process.env.SEED_SELLER_PASSWORD ?? DEV_SEED_SELLER_PASSWORD,
  },
  serverUrl: (() => {
    let url = (process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 5000}`).trim();
    if (url.startsWith('//')) url = `https:${url}`;
    return url.replace(/\/$/, '');
  })(),
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY?.trim() ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? '',
    get isConfigured(): boolean {
      return Boolean(this.secretKey);
    },
  },
  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID?.trim() ?? '',
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD?.trim() ?? '',
    isLive: process.env.SSLCOMMERZ_IS_LIVE === 'true',
    get apiBase(): string {
      return this.isLive ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com';
    },
    get isConfigured(): boolean {
      return Boolean(this.storeId && this.storePassword);
    },
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY?.trim() ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET?.trim() ?? '',
    get isConfigured(): boolean {
      return Boolean(this.cloudName && this.apiKey && this.apiSecret);
    },
  },
};
