# LogiFlow Inventory Management

LogiFlow is a production-ready inventory analytics project built with Next.js 14, TypeScript, FastAPI, PostgreSQL, Recharts, and ML-powered forecasting.

## Features

- CSV inventory upload with PapaParse validation and preview
- PostgreSQL-backed inventory records
- FastAPI backend with OpenAPI docs
- 30-day demand forecasting using Prophet with a robust fallback
- Anomaly detection using Isolation Forest with a statistical fallback
- Expiry risk scoring from days until expiry, stock quantity, and demand velocity
- Data-driven Recharts dashboards
- Loading, empty, error, and toast states
- Docker Compose setup for frontend, backend, and database

## CSV Schema

Required columns:

```text
product_id,product_name,category,quantity,price,expiry_date,warehouse,daily_sales
```

Date format must be `YYYY-MM-DD`. A sample file is included at `sample_inventory.csv`.

## Local Setup

### Frontend

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

Frontend runs at http://localhost:3000.

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

Backend runs at http://localhost:8000. API docs are available at http://localhost:8000/docs.

### PostgreSQL

Use Docker for the database:

```bash
docker compose up db
```

Default local connection:

```env
postgresql+psycopg://logiflow:logiflow@localhost:5432/logiflow
```

## Full Docker Run

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

## API Endpoints

- `POST /upload`
- `GET /inventory`
- `GET /forecast`
- `GET /expiry-risk`
- `GET /anomalies`
- `GET /revenue`
- `GET /transport-risks`
- `GET /health`

## Project Structure

```text
app/                    Next.js routes
components/dashboard/   Data-driven dashboard modules
components/ui/          Reusable UI primitives
hooks/                  Client-side data hooks
lib/                    API client, CSV parser, shared types
backend/app/            FastAPI application
backend/migrations/     Alembic migrations
public/                 Static assets
```

## Production Notes

- Frontend deploys cleanly to Vercel.
- Backend can deploy to Render or Railway.
- PostgreSQL can run on Render, Railway, Neon, Supabase, or another managed provider.
- Set `NEXT_PUBLIC_API_URL` in Vercel and `DATABASE_URL` / `FRONTEND_ORIGIN` in the backend host.

See `DEPLOYMENT.md` for deployment steps.
