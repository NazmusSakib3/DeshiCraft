# Deployment guide

DeshiCraft is deployed as three pieces:

| Piece    | Host          | Notes |
|----------|---------------|-------|
| Database | MongoDB Atlas | Free M0 cluster is enough for a demo |
| API      | Render        | Node web service (see `render.yaml`) |
| Frontend | Vercel        | Static Vite build (see `client/vercel.json`) |

## 1. MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/atlas.
2. Add a database user and allow access from anywhere (`0.0.0.0/0`) for the demo.
3. Copy the connection string, e.g.
   `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/deshicraft`.

## 2. API on Render

1. Push this repo to GitHub.
2. In Render, choose **New > Blueprint** and point it at the repo; it reads `render.yaml`.
3. Set the environment variables marked `sync: false`:
   - `MONGO_URI` - the Atlas string above
   - `CLIENT_URL` - your Vercel URL, e.g. `https://deshicraft.vercel.app`
   - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`
   The JWT secrets are generated automatically.
4. Deploy. The health check is `GET /api/health`.
5. Seed the production DB once from your machine:
   ```bash
   MONGO_URI="<atlas-uri>" npm run seed --workspace server
   ```

## 3. Frontend on Vercel

1. In Vercel, **Add New Project** and select the repo.
2. Set the **Root Directory** to `client`.
3. Add an environment variable:
   - `VITE_API_URL` = `https://<your-render-service>.onrender.com/api`
4. Deploy. `client/vercel.json` handles SPA routing.

## 4. CORS and cookies

- The API restricts CORS to `CLIENT_URL` and sends the refresh token as an httpOnly cookie.
- In production the cookie uses `SameSite=None; Secure`, so both apps must be served over HTTPS
  (Vercel and Render both provide TLS by default).

## Alternative: single-host Docker

The API ships with a `Dockerfile`. You can build and run it anywhere that hosts containers:

```bash
docker build -t deshicraft-api ./server
docker run -p 5000:5000 --env-file server/.env deshicraft-api
```
