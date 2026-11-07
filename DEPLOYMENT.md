# 🚀 Deployment Guide: Vercel (Frontend) & Render (Backend)

This guide covers deploying the **Real-Time Collaborative Dashboard & Analytics App** to production using 100% free-tier cloud services.

```
┌────────────────────────────────────────────────────────┐
│                   Production Architecture              │
│                                                        │
│  [ Users / Browser ]                                   │
│          │                                             │
│          ▼                                             │
│   [ Vercel (Next.js) ] ──(REST API)──> [ Render (FastAPI) ]
│          │                                     │       │
│          │ (Public Anon Access)                │       │ (Admin Access)
│          ▼                                     ▼       ▼
│  [ Supabase Storage ] <────────────── [ Supabase PostgreSQL ]
└────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites Before Deploying

1. A **[GitHub](https://github.com)** account with this repository pushed.
2. A **[Render](https://render.com)** account (Free Web Service for FastAPI).
3. A **[Vercel](https://vercel.com)** account (Free Hobby plan for Next.js).
4. Your **Supabase Project** with:
   - Tables created (`datasets`, `analysis_results`)
   - Bucket created (`datasets`)
   - `SUPABASE_URL` and `SUPABASE_KEY` (service_role)

---

## 📦 Step 1: Push Project to GitHub

Initialize and push your codebase to a new GitHub repository:

```bash
git init
git add .
git commit -m "feat: complete real-time dashboard analytics app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## 🐍 Step 2: Deploy Backend to Render

1. Log into **[dashboard.render.com](https://dashboard.render.com)**.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Name**: `analytics-dashboard-api` (or your choice)
   - **Region**: Choose the region closest to your Supabase project (e.g., `Oregon (US West)` or `Singapore`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: `Free`

5. Scroll down to **Environment Variables** and add:
   | Key | Value | Notes |
   |---|---|---|
   | `PYTHON_VERSION` | `3.11.0` | Ensures compatible Python runtime |
   | `ENVIRONMENT` | `production` | Enables production security & logging |
   | `CORS_ORIGINS` | `*` | Or specify your Vercel URL once deployed |
   | `SUPABASE_URL` | `https://ykneamwumnnlkkjoseyo.supabase.co` | Your Supabase Project URL |
   | `SUPABASE_KEY` | `eyJhbGciOi...` | Your Supabase `service_role` key |

6. Expand **Advanced** settings:
   - **Health Check Path**: `/api/v1/health`
   - **Auto-Deploy**: `Yes`

7. Click **Create Web Service**.
   - Render will build dependencies and start FastAPI.
   - Once completed, copy your backend URL (e.g. `https://analytics-dashboard-api.onrender.com`).
   - Test it in your browser: `https://<your-backend>.onrender.com/api/v1/health`.

> [!NOTE]
> On the free tier, Render automatically spins down services after 15 minutes of inactivity. When a request arrives, it wakes up automatically in ~30–50 seconds. The frontend includes automatic connection retries.

---

## ⚡ Step 3: Deploy Frontend to Vercel

1. Log into **[vercel.com](https://vercel.com)**.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - **Project Name**: `analytics-dashboard` (or your choice)
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose `frontend` (Important!).

5. Expand **Environment Variables** and add:
   | Key | Value | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | `https://analytics-dashboard-api.onrender.com` | Your live Render backend URL from Step 2 |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://ykneamwumnnlkkjoseyo.supabase.co` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Your Supabase public `anon` key |

6. Click **Deploy**.
   - Vercel will build the Next.js app, optimize static pages, and assign a production URL (e.g. `https://analytics-dashboard.vercel.app`).

---

## ✅ Step 4: Verification & Smoke Test

1. Open your live Vercel frontend URL.
2. Verify that the **FastAPI Backend** badge at the top shows:
   `🟢 Online (healthy)`
3. Drag and drop any test CSV (e.g., `sample_datasets/sales_data.csv` or any Kaggle CSV).
4. Verify:
   - File uploads and progress bar advances to 100%.
   - Statistical table renders with Mean, Median, Min, Max, and Missing counts.
   - Interactive Bar, Line, Scatter, and Correlation Matrix charts render seamlessly.
   - Dataset is saved in the Supabase history list.

---

## 🛠️ Production Maintenance Tips

- **Updating Code**: Every `git push origin main` will trigger automatic builds on both Render and Vercel.
- **CORS Support**: The backend automatically allows all requests originating from any `https://*.vercel.app` domain.
- **Large Files**: The app accommodates datasets up to 150 MB with in-memory analysis and database synchronization.
