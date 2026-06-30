# backend/migrations/versions/0002_add_warehouse_table.py
"""add warehouses table and warehouse_id fk to inventory

Revision ID: 0002
Revises: REPLACE_WITH_CURRENT_REVISION
Create Date: 2026-06-25
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import Integer, String

revision      = "0002"
down_revision = "20260624_0001"
branch_labels = None
depends_on    = None

DEFAULT_WAREHOUSES = [
    {"id": 1, "name": "Mumbai",    "city": "Mumbai",    "capacity": 15000},
    {"id": 2, "name": "Delhi",     "city": "Delhi",     "capacity": 12000},
    {"id": 3, "name": "Pune",      "city": "Pune",      "capacity": 8000},
    {"id": 4, "name": "Bangalore", "city": "Bangalore", "capacity": 10000},
]


def upgrade() -> None:
    # 1. Create warehouses table
    op.create_table(
        "warehouses",
        sa.Column("id",         sa.Integer(),              nullable=False),
        sa.Column("name",       sa.String(100),            nullable=False),
        sa.Column("city",       sa.String(100),            nullable=False),
        sa.Column("address",    sa.Text(),                 nullable=True),
        sa.Column("capacity",   sa.Integer(),              nullable=False, server_default="10000"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_warehouses_id", "warehouses", ["id"])

    # 2. Seed the 4 default warehouses
    warehouses_table = table(
        "warehouses",
        column("id",       Integer),
        column("name",     String),
        column("city",     String),
        column("capacity", Integer),
    )
    op.bulk_insert(warehouses_table, DEFAULT_WAREHOUSES)

    # 3. Add warehouse_id FK to inventory (nullable first — backfill next)
    op.add_column(
        "inventory",
        sa.Column(
            "warehouse_id",
            sa.Integer(),
            sa.ForeignKey("warehouses.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_inventory_warehouse_id", "inventory", ["warehouse_id"])

    # 4. Backfill warehouse_id by matching existing warehouse text → warehouses.name
    op.execute("""
        UPDATE inventory
        SET warehouse_id = w.id
        FROM warehouses w
        WHERE LOWER(TRIM(inventory.warehouse)) = LOWER(TRIM(w.name))
    """)

    # 5. Any unmatched rows fall back to Mumbai (id=1)
    op.execute("""
        UPDATE inventory
        SET warehouse_id = 1
        WHERE warehouse_id IS NULL
    """)


def downgrade() -> None:
    op.drop_index("ix_inventory_warehouse_id", table_name="inventory")
    op.drop_column("inventory", "warehouse_id")
    op.drop_index("ix_warehouses_id", table_name="warehouses")
    op.drop_table("warehouses")