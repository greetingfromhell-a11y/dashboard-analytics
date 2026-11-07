# Real-Time Collaborative Dashboard & Analytics App

A full-stack web application designed for interactive data analytics. Users can upload tabular datasets (CSV / Excel), and the backend automatically processes missing values, computes descriptive statistical metrics (mean, median, standard deviation, correlation matrices), and serves dynamic interactive charts (Bar, Line, Scatter) using Recharts.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Recharts, Axios, Lucide Icons
- **Backend**: Python 3.10+, FastAPI, Pandas, NumPy, OpenPyXL, Uvicorn
- **Database & Storage**: Supabase (PostgreSQL with JSONB + Supabase Storage)
- **Deployment Targets**: Vercel (Frontend), Render (Backend)

---

## 📁 Project Structure

```text
project67/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI entrypoint, CORS & route setup
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py               # Settings & environment variables
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py           # v1 API Router aggregator
│   │   │       └── endpoints/
│   │   │           ├── __init__.py
│   │   │           └── health.py       # Health check endpoint
│   │   ├── models/                     # Schemas & Pydantic models (Phase 2)
│   │   └── services/                   # Data processing & Supabase client (Phase 2)
│   ├── requirements.txt                # Python dependencies
│   ├── .env.example                    # Backend environment template
│   ├── .env                            # Local backend environment
│   └── .gitignore
├── frontend/
│   ├── app/
│   │   ├── globals.css                 # Tailwind directives & theme
│   │   ├── layout.tsx                  # Root Next.js layout
│   │   └── page.tsx                    # Landing page & health monitor
│   ├── components/                     # Reusable UI components
│   ├── lib/
│   │   └── utils.ts                    # Classnames & UI utility
│   ├── types/
│   │   └── index.ts                    # TypeScript types
│   ├── package.json                    # Node dependencies & scripts
│   ├── tsconfig.json                   # TypeScript config
│   ├── tailwind.config.ts              # Tailwind CSS config
│   ├── postcss.config.mjs              # PostCSS config
│   ├── next.config.mjs                 # Next.js config
│   ├── .env.example                    # Frontend environment template
│   ├── .env.local                      # Local frontend environment
│   └── .gitignore
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18.18 or higher (with `npm` or `pnpm`)

---

### 2. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Verify or adjust the `.env` file (copied from `.env.example`):
   ```env
   PROJECT_NAME="Real-Time Analytics Dashboard API"
   ENVIRONMENT="development"
   PORT=8000
   HOST="0.0.0.0"
   CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### 3. Frontend Setup (Next.js)

1. Open a separate terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Verify the `.env.local` file (configured for the local backend):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   - [http://localhost:3000](http://localhost:3000)

---

## 🗺️ Roadmap & Execution Phases

- [x] **Phase 1: Project Initialization** (Folder structure, configs, Tailwind CSS, CORS, health endpoint).
- [x] **Phase 2: Supabase Setup & Backend Core** (Supabase client, Pandas ingestion, statistical computations, Supabase table storage).
- [x] **Phase 3: Frontend Upload UI** (Drag-and-drop component, file validation, progress state, API integration).
- [x] **Phase 4: Data Visualization & Dashboard** (Recharts dynamic rendering for Bar, Line, Scatter charts, metric cards).
- [x] **Phase 5: Deployment Preparation** (Render.yaml, Dockerfile, vercel.json, production CORS, step-by-step deploy guide).

---

## 🌐 Cloud Deployment (Vercel & Render)

For full step-by-step instructions on deploying the frontend to **Vercel** and the backend to **Render**, see [DEPLOYMENT.md](file:///c:/Users/galih/OneDrive/Dokumen/project67/DEPLOYMENT.md).
