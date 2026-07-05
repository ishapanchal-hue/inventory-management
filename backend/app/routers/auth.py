# backend/app/routers/auth.py

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.dependencies import get_current_user, require_role
from app.models import User, Warehouse
from app.schemas import LoginRequest, SignupRequest, Token, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


# ── LOGIN ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> Token:
    """
    Authenticate with email + password.
    On success: sets an httpOnly cookie and returns the token + user in the body.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Contact your administrator.",
        )

    token_data = {
        "sub":          user.email,
        "user_id":      user.id,
        "role":         user.role,
        "full_name":    user.full_name,
        "warehouse_id": user.warehouse_id,
    }
    access_token = create_access_token(token_data)

    # Set httpOnly cookie — JS cannot read this, protects against XSS
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=True,
        max_age=60 * 60 * 8,
        domain=None,        # ← let browser decide, don't pin to a domain
        path="/",           # ← cookie available on all paths
    )

    return Token(access_token=access_token, token_type="bearer", user=UserRead.model_validate(user))


# ── LOGOUT ────────────────────────────────────────────────────────────────────

@router.post("/logout")
def logout(response: Response) -> dict:
    """Clear the auth cookie."""
    response.delete_cookie(key="access_token", samesite="lax")
    return {"message": "Logged out successfully"}


# ── SIGNUP (self-registration → always analyst) ───────────────────────────────

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, response: Response, db: Session = Depends(get_db)) -> Token:
    """
    Public self-registration. New accounts are always created as 'analyst'.
    Admins can upgrade roles via /auth/users/{id}/role.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email           = str(payload.email),
        full_name       = payload.full_name,
        hashed_password = hash_password(payload.password),
        role            = "analyst",
        is_active       = True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token_data = {
        "sub":          user.email,
        "user_id":      user.id,
        "role":         user.role,
        "full_name":    user.full_name,
        "warehouse_id": user.warehouse_id,
    }
    access_token = create_access_token(token_data)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 8,
    )

    return Token(access_token=access_token, token_type="bearer", user=UserRead.model_validate(user))


# ── ME ────────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> UserRead:
    """Return the currently authenticated user's profile."""
    return UserRead.model_validate(current_user)


# ── ADMIN: LIST ALL USERS ─────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserRead])
def list_users(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
) -> list[User]:
    """Admin only — list all users."""
    return db.query(User).order_by(User.created_at.desc()).all()


# ── ADMIN: CREATE USER WITH EXPLICIT ROLE ─────────────────────────────────────

@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
) -> User:
    """
    Admin only — create a user with any role.
    Warehouse managers must have a warehouse_id assigned.
    """
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    if payload.role == "warehouse_manager" and payload.warehouse_id is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Warehouse managers must be assigned a warehouse_id.",
        )

    if payload.warehouse_id:
        wh = db.query(Warehouse).filter(Warehouse.id == payload.warehouse_id).first()
        if not wh:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Warehouse id={payload.warehouse_id} not found.",
            )

    user = User(
        email           = str(payload.email),
        full_name       = payload.full_name,
        hashed_password = hash_password(payload.password),
        role            = payload.role,
        is_active       = True,
        warehouse_id    = payload.warehouse_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── ADMIN: UPDATE USER ROLE + WAREHOUSE ───────────────────────────────────────

@router.patch("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    role:         Optional[str] = None,
    warehouse_id: Optional[int] = None,
    is_active:    Optional[bool] = None,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
) -> User:
    """Admin only — update a user's role, warehouse assignment, or active status."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if role is not None:
        valid_roles = ["admin", "warehouse_manager", "analyst"]
        if role not in valid_roles:
            raise HTTPException(status_code=422, detail=f"Role must be one of {valid_roles}")
        user.role = role

    if warehouse_id is not None:
        wh = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
        if not wh:
            raise HTTPException(status_code=404, detail=f"Warehouse id={warehouse_id} not found.")
        user.warehouse_id = warehouse_id

    if is_active is not None:
        user.is_active = is_active

    db.commit()
    db.refresh(user)
    return user