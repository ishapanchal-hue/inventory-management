from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import Base, engine, get_db
from app.models import Inventory
from app.schemas import (
    AnomalyItem,
    ExpiryRiskItem,
    ForecastPoint,
    InventoryRead,
    TransportRiskItem,
    UploadRequest,
    UploadResponse,
)
from app.schemas import RevenueResponse
from app.services.analytics import build_expiry_risk, build_forecast, build_revenue, detect_anomalies

settings = get_settings()

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables_for_local_dev() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/upload", response_model=UploadResponse)
def upload_inventory(payload: UploadRequest, db: Session = Depends(get_db)) -> UploadResponse:
    db.query(Inventory).delete()
    db.add_all([Inventory(**record.model_dump()) for record in payload.records])
    db.commit()
    count = db.query(func.count(Inventory.id)).scalar() or 0
    return UploadResponse(inserted=len(payload.records), inventory_count=count)


@app.get("/inventory", response_model=list[InventoryRead])
def inventory(db: Session = Depends(get_db)) -> list[Inventory]:
    return db.query(Inventory).order_by(Inventory.product_name.asc()).all()


@app.get("/forecast", response_model=list[ForecastPoint])
def forecast(db: Session = Depends(get_db)) -> list[ForecastPoint]:
    return build_forecast(db)


@app.get("/expiry-risk", response_model=list[ExpiryRiskItem])
def expiry_risk(db: Session = Depends(get_db)) -> list[ExpiryRiskItem]:
    return build_expiry_risk(db)


@app.get("/anomalies", response_model=list[AnomalyItem])
def anomalies(db: Session = Depends(get_db)) -> list[AnomalyItem]:
    return detect_anomalies(db)


@app.get("/revenue", response_model=RevenueResponse)
def revenue(db: Session = Depends(get_db)) -> RevenueResponse:
    return build_revenue(db)


@app.get("/transport-risks", response_model=list[TransportRiskItem])
def transport_risks(db: Session = Depends(get_db)) -> list[TransportRiskItem]:
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
