# CampusFlow Frontend

React 18 · Vite · React Router · Axios · Recharts · Lucide.

## Configuration

One variable, read at **build time**:

```
VITE_API_BASE_URL=https://<your-backend>.onrender.com/api/v1
```

(include `/api/v1`, no trailing slash). Changing it requires a rebuild/redeploy.

## Run locally

```bash
cp .env.example .env        # points to http://localhost:8080/api/v1
npm install
npm run dev                 # http://localhost:5173
```

Start the backend first (see its README). Production check: `npm ci && npm run build && npm run preview`.

## Deploy on Render (Static Site)

New → Static Site → connect this repo, then:

| Setting | Value |
|---|---|
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |
| Environment | `VITE_API_BASE_URL` = `https://<your-backend>.onrender.com/api/v1` |
| Redirects/Rewrites | Source `/*` → Destination `/index.html` → Action **Rewrite** |

The rewrite rule is required so refreshing `/projects/3` does not 404. (`render.yaml` includes it if you use Blueprints.)

Finally copy the static site's URL into the backend's `FRONTEND_ORIGIN` variable, otherwise browser requests are blocked by CORS.
