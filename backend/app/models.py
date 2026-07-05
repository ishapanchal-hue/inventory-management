from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

class Warehouse(Base):
    __tablename__ = "warehouses"

    id:         Mapped[int]      = mapped_column(Integer, primary_key=True, index=True)
    name:       Mapped[str]      = mapped_column(String(100), nullable=False, unique=True)
    city:       Mapped[str]      = mapped_column(String(100), nullable=False)
    address:    Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    capacity:   Mapped[int]      = mapped_column(Integer, nullable=False, default=10_000)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # back-reference: warehouse.items → all Inventory rows for this warehouse
    items: Mapped[list["Inventory"]] = relationship("Inventory", back_populates="warehouse_rel", lazy="select")

    def __repr__(self) -> str:
        return f"<Warehouse id={self.id} name={self.name!r}>"

class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[str] = mapped_column(String(64), index=True)
    product_name: Mapped[str] = mapped_column(String(255), index=True)
    category: Mapped[str] = mapped_column(String(120), index=True)
    quantity: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column(Float)
    expiry_date: Mapped[date] = mapped_column(Date, index=True)
    warehouse: Mapped[str] = mapped_column(String(160), index=True)
    daily_sales: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    warehouse_id:  Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("warehouses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    warehouse_rel: Mapped[Optional["Warehouse"]] = relationship("Warehouse", back_populates="items")


class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[str] = mapped_column(String(64), index=True)
    forecast_date: Mapped[date] = mapped_column(Date, index=True)
    predicted_demand: Mapped[float] = mapped_column(Float)
    lower_bound: Mapped[float] = mapped_column(Float)
    upper_bound: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Revenue(Base):
    __tablename__ = "revenue"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    category: Mapped[str] = mapped_column(String(120), index=True)
    revenue_date: Mapped[date] = mapped_column(Date, index=True)
    actual_revenue: Mapped[float] = mapped_column(Float)
    projected_revenue: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[str] = mapped_column(String(64), index=True)
    alert_type: Mapped[str] = mapped_column(String(80), index=True)
    severity: Mapped[str] = mapped_column(String(20), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    """
    Application user.
    role:         "admin" | "warehouse_manager" | "analyst"
    warehouse_id: only set for warehouse_manager — locks them to one warehouse
    is_active:    soft-disable without deleting the account
    """
    __tablename__ = "users"

    id:             Mapped[int]           = mapped_column(Integer, primary_key=True, index=True)
    email:          Mapped[str]           = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name:      Mapped[str]           = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str]          = mapped_column(String(255), nullable=False)
    role:           Mapped[str]           = mapped_column(String(30), nullable=False, default="analyst")
    is_active:      Mapped[bool]          = mapped_column(Integer, nullable=False, default=True)
    warehouse_id:   Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True, index=True,
    )
    created_at:     Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:     Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    warehouse:      Mapped[Optional["Warehouse"]] = relationship("Warehouse")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role!r}>"


