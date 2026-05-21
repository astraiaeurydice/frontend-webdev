# Deploy Frontend to Vercel

Backend (Railway): `https://backend-webdev-production.up.railway.app`

## 1. Push to GitHub

### Option A — Frontend-only repo (recommended)
```powershell
cd c:\Users\Licht\WebdevProj\Frontend
git init
git add .
git commit -m "Prepare frontend for Vercel"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_FRONTEND_REPO.git
git push -u origin main
```

### Option B — Whole project repo
Push `WebdevProj` and set Vercel **Root Directory** to `Frontend`.

---

## 2. Import on Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repo
3. **Root Directory:** `Frontend` (if whole monorepo) or leave empty (if Frontend-only repo)

| Setting | Value |
|---------|--------|
| Framework Preset | Create React App |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Install Command | `npm install` |

---

## 3. Environment variable (required)

**Project → Settings → Environment Variables**

| Name | Value |
|------|--------|
| `REACT_APP_API_URL` | `https://backend-webdev-production.up.railway.app` |

No trailing slash. Apply to **Production**, **Preview**, and **Development**.

Redeploy after adding this variable.

---

## 4. Link Railway backend to Vercel

On **Railway → backend-webdev → Variables**:

| Name | Value |
|------|--------|
| `FRONTEND_URL` | `https://YOUR-PROJECT.vercel.app` |

(no trailing slash — use your real Vercel URL after first deploy)

Redeploy the backend on Railway.

---

## 5. Google OAuth (web login)

Google Cloud Console → OAuth client:

- **Authorized JavaScript origins:** `https://YOUR-PROJECT.vercel.app`
- **Authorized redirect URIs:**  
  `https://backend-webdev-production.up.railway.app/connect/google/check`

---

## 6. Test after deploy

| URL | Expected |
|-----|----------|
| `https://YOUR-PROJECT.vercel.app` | Home / login |
| Login with email | Works → dashboard |
| Google login | Redirects back to Vercel `/oauth/callback` |
| Customer shop | Products load from Railway API |

---

## 7. Local dev (unchanged)

```powershell
cd Frontend
# optional: copy .env.example to .env.local
npm start
```

Default API stays `http://127.0.0.1:8000` when `REACT_APP_API_URL` is not set.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page after refresh on `/admin/...` | `vercel.json` rewrites are included — redeploy |
| API calls still go to `127.0.0.1` | Set `REACT_APP_API_URL` on Vercel and **redeploy** |
| CORS errors | Backend `nelmio_cors` allows `*` on `/api/` — should work |
| Google login wrong redirect | Update `FRONTEND_URL` on Railway + Google redirect URI |
| Product images broken | Image URLs use `assetUrl()` → Railway domain |
