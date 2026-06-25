"""initial schema

Revision ID: 20260624_0001
Revises:
Create Date: 2026-06-24
"""
from alembic import op
import sqlalchemy as sa

revision = "20260624_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "inventory",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.String(length=64), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("expiry_date", sa.Date(), nullable=False),
        sa.Column("warehouse", sa.String(length=160), nullable=False),
        sa.Column("daily_sales", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_inventory_product_id", "inventory", ["product_id"])
    op.create_index("ix_inventory_category", "inventory", ["category"])
    op.create_index("ix_inventory_expiry_date", "inventory", ["expiry_date"])
    op.create_index("ix_inventory_warehouse", "inventory", ["warehouse"])

    op.create_table(
        "forecasts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.String(length=64), nullable=False),
        sa.Column("forecast_date", sa.Date(), nullable=False),
        sa.Column("predicted_demand", sa.Float(), nullable=False),
        sa.Column("lower_bound", sa.Float(), nullable=False),
        sa.Column("upper_bound", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_forecasts_product_id", "forecasts", ["product_id"])
    op.create_index("ix_forecasts_forecast_date", "forecasts", ["forecast_date"])

    op.create_table(
        "revenue",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("category", sa.String(length=120), nullable=False),
        sa.Column("revenue_date", sa.Date(), nullable=False),
        sa.Column("actual_revenue", sa.Float(), nullable=False),
        sa.Column("projected_revenue", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_revenue_category", "revenue", ["category"])
    op.create_index("ix_revenue_revenue_date", "revenue", ["revenue_date"])

    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.String(length=64), nullable=False),
        sa.Column("alert_type", sa.String(length=80), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_alerts_product_id", "alerts", ["product_id"])
    op.create_index("ix_alerts_alert_type", "alerts", ["alert_type"])
    op.create_index("ix_alerts_severity", "alerts", ["severity"])


def downgrade() -> None:
    op.drop_table("alerts")
    op.drop_table("revenue")
    op.drop_table("forecasts")
    op.drop_table("inventory")
