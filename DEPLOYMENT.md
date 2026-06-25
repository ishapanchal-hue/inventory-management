# Deployment Guide

## Frontend: Vercel

1. Import this repository into Vercel.
2. Set the project root to `inventory_management`.
3. Add `NEXT_PUBLIC_API_URL` with your deployed FastAPI URL.
4. Use the default build command: `pnpm build`.

## Backend: Render or Railway

1. Create a Python web service from `backend/`.
2. Set the start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Add environment variables:
   ```env
   DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DB
   FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
   ```
4. Run migrations during deploy or from a one-off shell:
   ```bash
   alembic upgrade head
   ```

## Database: PostgreSQL

Use Render PostgreSQL, Railway PostgreSQL, Neon, Supabase, or any managed PostgreSQL provider.

The schema includes:
- `inventory`
- `forecasts`
- `revenue`
- `alerts`

## Local Docker

```bash
docker compose up --build
```

Open:
- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs
