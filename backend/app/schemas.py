from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


RiskLevel = Literal["Low", "Medium", "High"]
Severity = Literal["Low", "Medium", "High"]


class InventoryCreate(BaseModel):
    product_id: str = Field(min_length=1, max_length=64)
    product_name: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1, max_length=120)
    quantity: int = Field(ge=0)
    price: float = Field(ge=0)
    expiry_date: date
    warehouse: str = Field(min_length=1, max_length=160)
    daily_sales: float = Field(ge=0)

    @field_validator("product_id", "product_name", "category", "warehouse")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class InventoryRead(InventoryCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UploadRequest(BaseModel):
    records: list[InventoryCreate]


class UploadResponse(BaseModel):
    inserted: int
    inventory_count: int


class ForecastPoint(BaseModel):
    product_id: str
    product_name: str
    category: str
    forecast_date: date
    predicted_demand: float
    lower_bound: float
    upper_bound: float


class ExpiryRiskItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    warehouse: str
    quantity: int
    days_until_expiry: int
    demand_velocity: float
    risk_score: float
    risk_level: RiskLevel


class AnomalyItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    severity: Severity
    anomaly_type: str
    score: float
    description: str
    suggested_action: str


class RevenueTrendPoint(BaseModel):
    date: date
    actual_revenue: float
    projected_revenue: float


class RevenueCategory(BaseModel):
    category: str
    revenue: float
    share: float


class RevenueResponse(BaseModel):
    total_revenue: float
    trend: list[RevenueTrendPoint]
    categories: list[RevenueCategory]


class TransportRiskItem(BaseModel):
    id: int
    route_name: str
    status: Literal["on-time", "delayed", "high-risk"]
    eta_minutes: int
    risk_type: str
    location: str
    inventory_impact: str
    delay_minutes: int

class WarehouseRead(BaseModel):
    id:         int
    name:       str
    city:       str
    address:    str | None = None
    capacity:   int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class WarehouseCreate(BaseModel):
    name:     str = Field(min_length=1, max_length=100)
    city:     str = Field(min_length=1, max_length=100)
    address:  str | None = None
    capacity: int = Field(default=10_000, gt=0)


class WarehouseStats(BaseModel):
    warehouse_id:      int
    warehouse_name:    str
    total_items:       int
    total_units:       int
    inventory_value:   float
    utilisation_pct:   float
    capacity:          int
    low_stock_count:   int
    expiry_risk_count: int


class TransferRecommendation(BaseModel):
    from_warehouse_id:   int
    from_warehouse_name: str
    to_warehouse_id:     int
    to_warehouse_name:   str
    product_id:          str
    product_name:        str
    recommended_units:   int
    reason:              str
    urgency:             Literal["high", "medium", "low"]