# backend/app/dependencies.py

from typing import Optional

from fastapi import Cookie, Depends, Header, HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import User

# ── Role hierarchy ────────────────────────────────────────────────────────────
# Higher index = more permissions
ROLE_HIERARCHY = ["analyst", "warehouse_manager", "admin"]


def _role_rank(role: str) -> int:
    try:
        return ROLE_HIERARCHY.index(role)
    except ValueError:
        return -1


# ── Core auth dependency ──────────────────────────────────────────────────────

async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    access_token: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    """
    Accepts JWT from either:
    - Authorization: Bearer <token> header (production cross-domain)
    - access_token httpOnly cookie (local development)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Try Authorization header first (production)
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    # Fall back to cookie (local dev)
    elif access_token:
        token = access_token

    if not token:
        raise credentials_exception

    try:
        payload = decode_access_token(token)
        email: Optional[str] = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise credentials_exception

    return user

# ── Role enforcement factory ──────────────────────────────────────────────────

def require_role(*allowed_roles: str):
    """
    Usage:
        @app.get("/admin-only")
        def admin_route(user: User = Depends(require_role("admin"))):
            ...

        @app.get("/managers-and-admins")
        def route(user: User = Depends(require_role("admin", "warehouse_manager"))):
            ...
    """
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {list(allowed_roles)}",
            )
        return current_user
    return _check


def require_min_role(min_role: str):
    """
    Usage:
        @app.get("/analysts-and-above")
        def route(user: User = Depends(require_min_role("analyst"))):
            ...
    Allows the given role AND any role higher in the hierarchy.
    """
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if _role_rank(current_user.role) < _role_rank(min_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Minimum role required: {min_role}",
            )
        return current_user
    return _check


# ── Warehouse scope helper ────────────────────────────────────────────────────

def get_warehouse_scope(
    current_user: User = Depends(get_current_user),
) -> Optional[int]:
    """
    Returns the warehouse_id the current user is scoped to.
    - Admin / Analyst → None (sees all warehouses)
    - Warehouse Manager → their assigned warehouse_id
    If a manager has no warehouse assigned, raises 403.
    """
    if current_user.role == "warehouse_manager":
        if current_user.warehouse_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Warehouse Manager has no warehouse assigned. Contact admin.",
            )
        return current_user.warehouse_id
    return None