# backend/app/main.py

from datetime import date, timedelta
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import Base, engine, get_db
from app.dependencies import get_current_user, get_warehouse_scope, require_min_role, require_role
from app.models import Inventory, User, Warehouse
from app.routers.auth import router as auth_router
from app.schemas import (
    AnomalyItem,
    ExpiryRiskItem,
    ForecastPoint,
    InventoryRead,
    RevenueResponse,
    TransferRecommendation,
    TransportRiskItem,
    UploadRequest,
    UploadResponse,
    WarehouseCreate,
    WarehouseRead,
    WarehouseStats,
)
from app.services.analytics import build_expiry_risk, build_forecast, build_revenue, detect_anomalies

settings = get_settings()

app = FastAPI(title=settings.app_name, version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register auth router
app.include_router(auth_router)


@app.on_event("startup")
def create_tables_for_local_dev() -> None:
    Base.metadata.create_all(bind=engine)


# ── HEALTH (public) ───────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# ── WAREHOUSE ROUTES (admin + analyst read, admin write) ──────────────────────

@app.get("/warehouses", response_model=list[WarehouseRead])
def list_warehouses(
    db: Session = Depends(get_db),
    _: User = Depends(require_min_role("analyst")),
) -> list[Warehouse]:
    return db.query(Warehouse).order_by(Warehouse.name).all()


@app.post("/warehouses", response_model=WarehouseRead, status_code=201)
def create_warehouse(
    payload: WarehouseCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
) -> Warehouse:
    wh = Warehouse(**payload.model_dump())
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh


@app.get("/warehouses/stats", response_model=list[WarehouseStats])
def all_warehouse_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_min_role("analyst")),
) -> list[WarehouseStats]:
    """
    Admins and analysts see all warehouses.
    Warehouse managers see only their own warehouse stats.
    """
    if current_user.role == "warehouse_manager" and current_user.warehouse_id:
        wh = db.query(Warehouse).filter(Warehouse.id == current_user.warehouse_id).first()
        return [_compute_stats(db, wh)] if wh else []
    warehouses = db.query(Warehouse).order_by(Warehouse.name).all()
    return [_compute_stats(db, wh) for wh in warehouses]


@app.get("/warehouses/{warehouse_id}/stats", response_model=WarehouseStats)
def single_warehouse_stats(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_min_role("analyst")),
) -> WarehouseStats:
    # Managers can only view their own warehouse stats
    if current_user.role == "warehouse_manager" and current_user.warehouse_id != warehouse_id:
        raise HTTPException(status_code=403, detail="Access denied to this warehouse.")
    wh = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return _compute_stats(db, wh)


@app.get("/transfer-recommendations", response_model=list[TransferRecommendation])
def transfer_recommendations(
    db: Session = Depends(get_db),
    _: User = Depends(require_min_role("analyst")),
) -> list[TransferRecommendation]:
    return _build_transfer_recommendations(db)


# ── INVENTORY ─────────────────────────────────────────────────────────────────

@app.post("/upload", response_model=UploadResponse)
def upload_inventory(
    payload: UploadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "warehouse_manager")),
) -> UploadResponse:
    """
    Admins can upload for any warehouse.
    Warehouse managers can only upload for their assigned warehouse —
    any records not matching their warehouse are silently skipped.
    """
    wh_lookup: dict[str, int] = {
        wh.name.lower(): wh.id
        for wh in db.query(Warehouse).all()
    }

    db.query(Inventory).delete()
    items = []
    for record in payload.records:
        wh_id = wh_lookup.get(record.warehouse.strip().lower())

        # Warehouse managers can only insert for their own warehouse
        if current_user.role == "warehouse_manager":
            if wh_id != current_user.warehouse_id:
                continue

        data = record.model_dump()
        data["warehouse_id"] = wh_id
        items.append(Inventory(**data))

    db.add_all(items)
    db.commit()
    count = db.query(func.count(Inventory.id)).scalar() or 0
    return UploadResponse(inserted=len(items), inventory_count=count)


@app.get("/inventory", response_model=list[InventoryRead])
def inventory(
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse id"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_min_role("analyst")),
) -> list[Inventory]:
    q = db.query(Inventory).order_by(Inventory.product_name.asc())

    # Managers are always scoped to their warehouse regardless of query param
    if current_user.role == "warehouse_manager":
        q = q.filter(Inventory.warehouse_id == current_user.warehouse_id)
    elif warehouse_id is not None:
        q = q.filter(Inventory.warehouse_id == warehouse_id)

    return q.all()


# ── ANALYTICS (all authenticated users) ──────────────────────────────────────

@app.get("/forecast", response_model=list[ForecastPoint])
def forecast(
    db: Session = Depends(get_db),
    _: User = Depends(require_min_role("analyst")),
) -> list[ForecastPoint]:
    return build_forecast(db)


@app.get("/expiry-risk", response_model=list[ExpiryRiskItem])
def expiry_risk(
    db: Session = Depends(get_db),
    _: User = Depends(require_min_role("analyst")),
) -> list[ExpiryRiskItem]:
    return build_expiry_risk(db)


@app.get("/anomalies", response_model=list[AnomalyItem])
def anomalies(
    db: Session = Depends(get_db),
    _: User = Depends(require_min_role("analyst")),
) -> list[AnomalyItem]:
    return detect_anomalies(db)


@app.get("/revenue", response_model=RevenueResponse)
def revenue(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_min_role("analyst")),
) -> RevenueResponse:
    # Warehouse managers don't have access to revenue analytics
    if current_user.role == "warehouse_manager":
        raise HTTPException(
            status_code=403,
            detail="Warehouse managers do not have access to revenue analytics.",
        )
    return build_revenue(db)


@app.get("/transport-risks", response_model=list[TransportRiskItem])
def transport_risks(
    db: Session = Depends(get_db),
    _: User = Depends(require_min_role("analyst")),
) -> list[TransportRiskItem]:
    rows = db.query(Inventory).all()
    warehouses = sorted({row.warehouse for row in rows}) or ["Central Warehouse"]
    high_risk = {row.warehouse for row in build_expiry_risk(db) if row.risk_level == "High"}
    return [
        TransportRiskItem(
            id=index + 1,
            route_name=f"{warehouse} to Store {index + 1}",
            status="high-risk" if warehouse in high_risk else "delayed" if index % 3 == 1 else "on-time",
            eta_minutes=35 + index * 8,
            risk_type="Expiry-sensitive load" if warehouse in high_risk else "Traffic",
            location=warehouse,
            inventory_impact="Prioritize cold-chain handling for high-risk inventory."
            if warehouse in high_risk
            else "No critical inventory impact detected.",
            delay_minutes=25 if warehouse in high_risk else 10 if index % 3 == 1 else 0,
        )
        for index, warehouse in enumerate(warehouses)
    ]


# ── PRIVATE HELPERS ───────────────────────────────────────────────────────────

def _compute_stats(db: Session, wh: Warehouse) -> WarehouseStats:
    today            = date.today()
    expiry_threshold = today + timedelta(days=30)
    items            = db.query(Inventory).filter(Inventory.warehouse_id == wh.id).all()
    total_units      = sum(i.quantity for i in items)
    inventory_value  = sum(i.quantity * i.price for i in items)
    return WarehouseStats(
        warehouse_id      = wh.id,
        warehouse_name    = wh.name,
        total_items       = len(items),
        total_units       = total_units,
        inventory_value   = round(inventory_value, 2),
        utilisation_pct   = round(total_units / wh.capacity * 100, 1) if wh.capacity else 0.0,
        capacity          = wh.capacity,
        low_stock_count   = sum(1 for i in items if i.quantity < 10),
        expiry_risk_count = sum(
            1 for i in items
            if i.expiry_date and today <= i.expiry_date <= expiry_threshold
        ),
    )


def _build_transfer_recommendations(db: Session) -> list[TransferRecommendation]:
    warehouses = {wh.id: wh for wh in db.query(Warehouse).all()}
    if len(warehouses) < 2:
        return []

    rows = db.query(Inventory).filter(Inventory.warehouse_id.isnot(None)).all()
    product_map: dict[str, list[Inventory]] = {}
    for item in rows:
        product_map.setdefault(item.product_id, []).append(item)

    wh_stats     = {wh_id: _compute_stats(db, wh) for wh_id, wh in warehouses.items()}
    seen:         dict[tuple, TransferRecommendation] = {}
    urgency_rank = {"high": 0, "medium": 1, "low": 2}

    for product_id, items in product_map.items():
        if len(items) < 2:
            continue
        for dest in items:
            for src in items:
                if src.warehouse_id == dest.warehouse_id:
                    continue
                # Guard: skip if either warehouse_id is None (satisfies Pylance)
                if src.warehouse_id is None or dest.warehouse_id is None:
                    continue
                src_wh    = warehouses[src.warehouse_id]
                dest_wh   = warehouses[dest.warehouse_id]
                src_stat  = wh_stats.get(src.warehouse_id)
                dest_stat = wh_stats.get(dest.warehouse_id)
                rec: Optional[TransferRecommendation] = None

                if dest.quantity == 0 and src.quantity > 50:
                    rec = TransferRecommendation(
                        from_warehouse_id=src.warehouse_id,   from_warehouse_name=src_wh.name,
                        to_warehouse_id=dest.warehouse_id,    to_warehouse_name=dest_wh.name,
                        product_id=product_id,                product_name=dest.product_name,
                        recommended_units=max(1, int(src.quantity * 0.30)),
                        reason=f"{dest_wh.name} has zero stock; {src_wh.name} has {src.quantity} units.",
                        urgency="high",
                    )
                elif dest.quantity < 10 and src.quantity > 100:
                    rec = TransferRecommendation(
                        from_warehouse_id=src.warehouse_id,   from_warehouse_name=src_wh.name,
                        to_warehouse_id=dest.warehouse_id,    to_warehouse_name=dest_wh.name,
                        product_id=product_id,                product_name=dest.product_name,
                        recommended_units=max(1, int(src.quantity * 0.20)),
                        reason=f"{dest_wh.name} is critically low ({dest.quantity} units).",
                        urgency="medium",
                    )
                elif (src_stat and src_stat.utilisation_pct > 85
                      and dest_stat and dest_stat.utilisation_pct < 40
                      and src.quantity > 50):
                    rec = TransferRecommendation(
                        from_warehouse_id=src.warehouse_id,   from_warehouse_name=src_wh.name,
                        to_warehouse_id=dest.warehouse_id,    to_warehouse_name=dest_wh.name,
                        product_id=product_id,                product_name=dest.product_name,
                        recommended_units=max(1, int(src.quantity * 0.15)),
                        reason=f"{src_wh.name} at {src_stat.utilisation_pct}% capacity.",
                        urgency="low",
                    )

                if rec:
                    key = (rec.product_id, rec.from_warehouse_id, rec.to_warehouse_id)
                    if key not in seen or urgency_rank[rec.urgency] < urgency_rank[seen[key].urgency]:
                        seen[key] = rec

    return list(seen.values())