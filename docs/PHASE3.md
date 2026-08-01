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

## 2. Stripe Checkout (next)

- Wire Stripe Checkout Session + webhook for `paymentStatus: paid`.
- Keep COD as alternative.

## 3. Playwright E2E (after Stripe or in parallel)

- Smoke: login → cart → COD order → seller confirms.
- Add job to `.github/workflows/ci.yml`.
