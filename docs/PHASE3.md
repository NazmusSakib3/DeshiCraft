# Phase 3 — Next feature (chosen)

**First pick: Cloudinary image uploads** (recommended in the roadmap)

## Why Cloudinary first
- Sellers currently paste image URLs in `SellerProductForm` — weak for a marketplace demo.
- Shows file handling, third-party API integration, and env-var config on Render/Vercel.
- COD checkout already proves orders; uploads make the seller flow feel complete.

## Scope (when you start)
1. Cloudinary account + upload preset (unsigned or signed).
2. API: `POST /api/uploads` with multer → Cloudinary SDK → return secure URL.
3. Client: file picker in `SellerProductForm` instead of raw URL inputs.
4. Env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` on Render.

## After Cloudinary
- **Stripe Checkout** + webhook (`paymentStatus: paid`) — second Phase 3 item.
- **Playwright E2E** — login → cart → COD order → seller confirms.
