# Career assets: GitHub profile + CV

This project is designed to strengthen your GitHub and CV. Below is a ready-to-use profile
README and CV bullet points. Nothing here is pushed automatically - copy what you want.

## 1. GitHub profile README

Create a repository named exactly **`NazmusSakib3`** (same as your username), add a `README.md`,
and paste this in. GitHub renders it on your profile page.

```markdown
### Hi, I'm Nazmus Sakib

Full-stack engineer from Bangladesh. I build production-shaped web apps across two ecosystems:
enterprise .NET and modern JavaScript.

- Backend: ASP.NET Core, Node.js/Express, REST APIs, JWT/RBAC, MongoDB, PostgreSQL
- Frontend: Angular, React, TypeScript, Tailwind CSS
- Tooling: Docker, GitHub Actions, automated testing

**Featured projects**
- DeshiCraft - multi-vendor MERN + TypeScript marketplace (JWT, RBAC, order lifecycle, admin) - [repo](https://github.com/NazmusSakib3/deshicraft)
- Tax Compliance Workflow Platform - ASP.NET Core 8 + Angular 18 modular monolith - [repo](https://github.com/NazmusSakib3/Tax-Compliance-Workflow-Platform-)

Open to full-stack / software engineer roles (remote + Dhaka).
```

## 2. Repository polish checklist

- [ ] Push DeshiCraft to `https://github.com/NazmusSakib3/deshicraft`
- [ ] Add repo topics: `mern`, `react`, `nodejs`, `express`, `mongodb`, `typescript`, `ecommerce`, `tailwindcss`
- [ ] Add a live demo URL to the repo "About" section and the README once deployed
- [ ] Pin DeshiCraft and Tax Compliance on your profile
- [ ] Capture screenshots into `docs/screenshots/` and uncomment the README table
- [ ] Add topics to Tax Compliance too: `aspnet-core`, `angular`, `clean-architecture`, `docker`

## 3. CV bullet points (truthful after you deploy)

**DeshiCraft - Multi-vendor E-commerce (MERN + TypeScript)**
- Built a full-stack marketplace with a React + TypeScript frontend and a Node.js/Express +
  MongoDB REST API, supporting three roles (customer, seller, admin).
- Implemented JWT access/refresh authentication with httpOnly-cookie refresh and role-based
  authorization middleware.
- Designed the MongoDB schema and a guarded order lifecycle with atomic stock updates using
  transactions.
- Added product search, filtering, pagination, verified-purchase reviews, wishlists, and seller
  and admin analytics dashboards.
- Set up GitHub Actions CI (typecheck, build, and API integration tests with an in-memory
  MongoDB) and deployed to Vercel + Render with MongoDB Atlas.

**Portfolio narrative (summary line for your CV)**
> Full-stack engineer comfortable in two stacks: enterprise ASP.NET Core + Angular and modern
> MERN + TypeScript. Strong on auth, RBAC, data modeling, Docker, and automated testing.

## 4. Suggested next skills (to keep growing)

- Add Stripe live payments (you already have the sandbox seam in checkout).
- Add image uploads via Cloudinary/S3 (currently image URLs).
- Add Playwright E2E tests and wire them into CI (matches your Tax Compliance setup).
- Learn a bit of cloud: deploy behind a custom domain, add basic observability/logging.
