# backend/migrations/versions/0003_add_users_table.py
"""add users table

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-01
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import Integer, String, Boolean

revision      = "0003"
down_revision = "0002"
branch_labels = None
depends_on    = None

# Pre-hashed bcrypt hash of "admin123"
# Generated with: passlib.context.CryptContext(schemes=["bcrypt"]).hash("admin123")
ADMIN_PASSWORD_HASH = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        "users",
        sa.Column("id",              sa.Integer(),              nullable=False),
        sa.Column("email",           sa.String(255),            nullable=False),
        sa.Column("full_name",       sa.String(255),            nullable=False),
        sa.Column("hashed_password", sa.String(255),            nullable=False),
        sa.Column("role",            sa.String(30),             nullable=False, server_default="analyst"),
        sa.Column("is_active",       sa.Integer(),              nullable=False, server_default="1"),
        sa.Column("warehouse_id",    sa.Integer(),              nullable=True),
        sa.Column("created_at",      sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at",      sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_users_id",    "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_role",  "users", ["role"])

    # 2. Seed default admin account
    users_table = table(
        "users",
        column("id",              Integer),
        column("email",           String),
        column("full_name",       String),
        column("hashed_password", String),
        column("role",            String),
        column("is_active",       Integer),
    )
    op.bulk_insert(users_table, [
        {
            "id":              1,
            "email":           "admin@logiflow.com",
            "full_name":       "LogiFlow Admin",
            "hashed_password": ADMIN_PASSWORD_HASH,
            "role":            "admin",
            "is_active":       1,
        }
    ])


def downgrade() -> None:
    op.drop_index("ix_users_role",  table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id",    table_name="users")
    op.drop_table("users")