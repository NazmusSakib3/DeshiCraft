# Phase 3 — Feature roadmap

## 1. Cloudinary image uploads ✅ (implemented)

Sellers can upload product images from the seller dashboard instead of pasting URLs only.

### Setup (you do once)

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Dashboard → **API Keys** → copy **Cloud name**, **API Key**, **API Secret**.
3. Add to **Render** (deshicraft-api → Environment):

| Variable | Value |
|----------|--------|
| `CLOUDINARY_CLOUD_NAME` | your cloud name |
| `CLOUDINARY_API_KEY` | your API key |
| `CLOUDINARY_API_SECRET` | your API secret |

4. For local dev, add the same three vars to `server/.env`.
5. Redeploy Render (or restart local API).

### How it works

- `POST /api/uploads` — multipart field `image`, seller/admin only, max 5 MB.
- Images stored in Cloudinary folder `deshicraft/products`.
- `SellerProductForm` — upload button + previews; URL paste still works as fallback.

### Test

1. Sign in as seller (`rina@deshicraft.local` / `Seller123!`).
2. Seller dashboard → **New product** → click **Upload** and pick an image.
3. Save product → image should appear on the live shop.

---

## 2. Stripe + SSLCommerz payments ✅ (implemented)

Checkout supports three methods:

| Method | Flow |
|--------|------|
| **COD** | Order created immediately, pay on delivery |
| **Stripe** | Order created → redirect to Stripe Checkout → webhook marks paid |
| **SSLCommerz** | Order created → redirect to gateway → IPN/success callback marks paid |

### Stripe setup

1. [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → API keys** → copy **Secret key**.
2. **Developers → Webhooks** → add endpoint:
   - URL: `https://deshicraft-api.onrender.com/api/payments/stripe/webhook`
   - Events: `checkout.session.completed`
   - Copy **Signing secret**
3. Add to Render / `server/.env`:

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_...` or live key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

### SSLCommerz setup

1. Register at [sslcommerz.com](https://sslcommerz.com) (sandbox for testing).
2. Sandbox test credentials: store `testbox` / password `qwerty`.
3. Add to Render / `server/.env`:

| Variable | Value |
|----------|--------|
| `SSLCOMMERZ_STORE_ID` | your store ID |
| `SSLCOMMERZ_STORE_PASSWORD` | your store password |
| `SSLCOMMERZ_IS_LIVE` | `false` for sandbox, `true` for production |
| `API_URL` | `https://deshicraft-api.onrender.com` (public API URL for callbacks) |

### API endpoints

- `POST /api/payments/stripe/checkout` — `{ orderId }` → `{ url }`
- `POST /api/payments/stripe/webhook` — Stripe webhook (raw body)
- `POST /api/payments/sslcommerz/init` — `{ orderId }` → `{ url }`
- `POST /api/payments/sslcommerz/ipn` — SSLCommerz IPN callback
- `GET /api/payments/sslcommerz/success|fail|cancel` — redirect back to the client

### Test

1. Place an order with **Card (Stripe)** or **SSLCommerz** at checkout.
2. Complete payment on the gateway (Stripe test card: `4242 4242 4242 4242`).
3. Return to order detail — payment status should show **paid**.

---

## 4. Playwright E2E ✅ (implemented)

- `e2e/smoke.spec.ts` — home, shop, login page
- `e2e/checkout-cod.spec.ts` — customer COD order → seller confirms
- `npm run test:e2e` — runs against production by default
- CI job in `.github/workflows/ci.yml`
