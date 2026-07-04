# LogiFlow — AI-Powered Inventory & Demand Intelligence

> Full-stack inventory management system with multi-warehouse support, ML-driven analytics, and role-based access control.

---

## Live Demo

**Demo credentials**
| Role | Email | Password |
|---|---|---|
| Admin | admin@logiflow.com | admin123 |

---

## What LogiFlow Does

LogiFlow is a production-grade inventory management platform built for perishable goods supply chains. Upload a CSV of your inventory, and the system automatically generates demand forecasts, flags expiry risks, detects stock anomalies, and recommends inter-warehouse stock transfers — all in one dashboard.

### Core Features

**Multi-Warehouse Management**
- Four pre-configured warehouses: Mumbai, Delhi, Pune, Bangalore
- Per-warehouse inventory value, utilisation %, and stock counts
- Warehouse comparison charts across all locations
- Rule-based inter-warehouse stock transfer recommendations (stockout detection, low-stock alerts, utilisation rebalancing)
- Clickable warehouse cards that filter the entire dashboard

**AI-Powered Analytics**
- Demand forecasting using Facebook Prophet with 30-day horizon and seasonality modelling
- Expiry risk heatmap scoring items on days-to-expiry, demand velocity, and stock pressure
- Anomaly detection using Isolation Forest to surface unusual demand spikes, overstock, and supply chain disruptions
- Revenue analytics with 30-day trend projection and category breakdown

**Role-Based Access Control (RBAC)**
- JWT authentication with httpOnly cookies (XSS-proof)
- Three roles with enforced permissions at both API and UI level:
  - **Admin** — full access, user management, all warehouses
  - **Warehouse Manager** — scoped to their assigned warehouse only, can upload inventory
  - **Analyst** — read-only access to all analytics and reports, no upload
- Role-aware sidebar navigation (items hidden based on role)
- Backend route protection via FastAPI dependency injection

**Inventory Management**
- CSV upload with real-time preview and validation
- Bulk upsert by product + warehouse
- Inventory overview table with category, quantity, price, expiry, and warehouse columns
- Transport risk assessment per warehouse route

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework with server-side routing |
| TypeScript | Type safety across all components and API calls |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui + Radix UI | Accessible component primitives |
| Recharts | Dashboard charts and visualisations |
| Framer Motion | Sidebar and page transition animations |
| React Hook Form + Zod | Form validation |
| PapaParse | Client-side CSV parsing |
| Sonner | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | High-performance Python API framework |
| PostgreSQL | Primary database |
| SQLAlchemy 2.0 | ORM with typed mapped columns |
| Alembic | Database migrations |
| python-jose | JWT creation and verification |
| bcrypt | Password hashing |
| Facebook Prophet | Demand forecasting |
| scikit-learn (Isolation Forest) | Anomaly detection |
| pandas | Data manipulation for analytics |
| pydantic-settings | Environment variable management |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | PostgreSQL container |
| uvicorn | ASGI server for FastAPI |
| pnpm | Frontend package manager |

---

## Project Structure

```
inventory_management/
├── app/                          # Next.js App Router
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard (role-aware)
│   ├── login/
│   │   └── page.tsx              # Login + signup page
│   └── layout.tsx                # Root layout with AuthProvider
├── components/
│   ├── dashboard/
│   │   ├── WarehouseSelector.tsx
│   │   ├── WarehouseOverviewCards.tsx
│   │   ├── WarehouseComparisonChart.tsx
│   │   ├── TransferRecommendations.tsx
│   │   ├── demand-forecast.tsx
│   │   ├── expiry-risk-heatmap.tsx
│   │   ├── anomaly-alerts.tsx
│   │   ├── expected-revenue.tsx
│   │   ├── transport-risks.tsx
│   │   └── inventory-overview.tsx
│   └── dashboard-layout.tsx      # Sidebar with role-aware navigation
├── hooks/
│   ├── use-dashboard-data.ts     # Central data hook with warehouse scope
│   └── use-auth.ts               # Auth hook re-export
├── lib/
│   ├── api.ts                    # All API calls with credentials
│   ├── auth-context.tsx          # AuthProvider + useAuth hook
│   ├── types.ts                  # Shared TypeScript interfaces
│   └── csv.ts                    # CSV parser and validator
├── middleware.ts                 # Next.js route protection
└── backend/
    ├── app/
    │   ├── core/
    │   │   ├── config.py         # Settings (JWT, DB, CORS)
    │   │   └── security.py       # bcrypt + JWT utilities
    │   ├── db/
    │   │   └── session.py        # SQLAlchemy engine + session
    │   ├── routers/
    │   │   └── auth.py           # Auth routes (login, signup, logout, users)
    │   ├── services/
    │   │   └── analytics.py      # Forecast, expiry, anomaly, revenue logic
    │   ├── dependencies.py       # get_current_user, require_role
    │   ├── models.py             # SQLAlchemy models (User, Warehouse, Inventory...)
    │   ├── schemas.py            # Pydantic request/response schemas
    │   └── main.py               # FastAPI app + all routes
    ├── migrations/
    │   └── versions/
    │       ├── 20260624_0001_initial_schema.py
    │       ├── 0002_add_warehouse_table.py
    │       └── 0003_add_users_table.py
    └── requirements.txt
```

---

## Database Schema

```
users
  id, email, full_name, hashed_password, role, is_active, warehouse_id, created_at

warehouses
  id, name, city, address, capacity, created_at

inventory
  id, product_id, product_name, category, quantity, price,
  expiry_date, warehouse (text), warehouse_id (FK), daily_sales, created_at

forecasts, revenue, alerts  (supporting tables)
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+ and pnpm
- Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/ishapanchal-hue/inventory-management.git
cd inventory-management
```

### 2. Start the database

```bash
docker run -d \
  --name logiflow-db \
  --restart always \
  -e POSTGRES_USER=logiflow \
  -e POSTGRES_PASSWORD=logiflow \
  -e POSTGRES_DB=logiflow \
  -p 5432:5432 \
  postgres:15
```

### 3. Set up the backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv --upgrade-deps
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### 4. Set up the frontend

```bash
cd ..   # back to project root

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Frontend runs at `http://localhost:3000`

### 5. Log in

Go to `http://localhost:3000/login` and use:
- **Email:** `admin@logiflow.com`
- **Password:** `admin123`

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login with email + password |
| POST | `/auth/signup` | Public | Self-register (analyst role) |
| POST | `/auth/logout` | Authenticated | Clear auth cookie |
| GET | `/auth/me` | Authenticated | Get current user profile |
| GET | `/auth/users` | Admin only | List all users |
| POST | `/auth/users` | Admin only | Create user with role |
| PATCH | `/auth/users/{id}` | Admin only | Update role / warehouse / status |

### Inventory
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/upload` | Admin, Manager | Upload inventory records |
| GET | `/inventory` | All | List inventory (managers scoped to their warehouse) |

### Warehouses
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/warehouses` | All | List all warehouses |
| POST | `/warehouses` | Admin | Create warehouse |
| GET | `/warehouses/stats` | All | Stats for all warehouses |
| GET | `/warehouses/{id}/stats` | All | Stats for one warehouse |
| GET | `/transfer-recommendations` | All | Inter-warehouse transfer suggestions |

### Analytics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/forecast` | All | 30-day demand forecast |
| GET | `/expiry-risk` | All | Expiry risk scores per item |
| GET | `/anomalies` | All | Detected stock anomalies |
| GET | `/revenue` | Admin, Analyst | Revenue trend and category breakdown |
| GET | `/transport-risks` | All | Transport risk per warehouse route |

---

## Role Permissions

| Feature | Admin | Warehouse Manager | Analyst |
|---|---|---|---|
| All warehouses | ✅ | ❌ Own only | ✅ |
| Upload CSV | ✅ | ✅ Own only | ❌ |
| Inventory Overview | ✅ | ✅ Own only | ✅ |
| Demand Forecast | ✅ | ✅ Own only | ✅ |
| Expiry Risk | ✅ | ✅ Own only | ✅ |
| Anomaly Alerts | ✅ | ✅ Own only | ✅ |
| Revenue Analytics | ✅ | ❌ | ✅ |
| Transport Risks | ✅ | ✅ Own only | ✅ |
| Transfer Recommendations | ✅ | ✅ Own only | ✅ |
| Warehouse Comparison Chart | ✅ | ❌ | ✅ |
| User Management | ✅ | ❌ | ❌ |

---

## CSV Upload Format

The inventory CSV must have these exact column names:

```csv
product_id,product_name,category,quantity,price,expiry_date,warehouse,daily_sales
SKU-001,Basmati Rice 5kg,Grains,1200,420.50,2026-12-15,Mumbai,18
SKU-002,Basmati Rice 5kg,Grains,0,420.50,2026-12-15,Delhi,22
```

**Accepted warehouse values:** Mumbai, Delhi, Pune, Bangalore (case-insensitive)

**Date format:** YYYY-MM-DD

---

## Transfer Recommendation Rules

The engine runs three rules across all products present in multiple warehouses:

| Rule | Condition | Urgency |
|---|---|---|
| Stockout | Destination has 0 units, source has 50+ | High |
| Low Stock | Destination has under 10 units, source has 100+ | Medium |
| Utilisation Rebalance | Source over 85% capacity, destination under 40% | Low |

---

## Environment Variables

All settings have safe defaults for local development. Override via `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://logiflow:logiflow@localhost:5432/logiflow
FRONTEND_ORIGIN=http://localhost:3000
JWT_SECRET_KEY=your-long-random-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480
```

For production, generate a secure JWT secret:
```bash
openssl rand -hex 32
```

---

## Author

**Isha Panchal**
Built as a full-stack portfolio project demonstrating FastAPI, Next.js, PostgreSQL, ML analytics, and production-ready auth patterns.
