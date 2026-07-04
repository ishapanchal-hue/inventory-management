// lib/auth-context.tsx

"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import type { AuthState, LoginRequest, SignupRequest, TokenResponse, User } from "@/lib/types"

// ── API calls (inline here to avoid circular imports with lib/api.ts) ─────────

// REPLACE the top of auth-context.tsx:
const API_BASE = "http://localhost:8000"  // hardcode for local dev — no process.env

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method:      "POST",
    credentials: "include",   // ← sends/receives httpOnly cookies
    headers:     { "Content-Type": "application/json" },
    body:        JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }))
    throw new Error(err.detail ?? "Request failed")
  }
  return res.json() as Promise<T>
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method:      "GET",
    credentials: "include",
  })
  if (!res.ok) throw new Error("Unauthenticated")
  return res.json() as Promise<T>
}

// ── Context definition ────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login:   (credentials: LoginRequest)  => Promise<void>
  signup:  (data: SignupRequest)         => Promise<void>
  logout:  ()                            => Promise<void>
  refresh: ()                            => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user,      setUser]      = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: attempt to restore session from existing cookie
  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const me = await apiGet<User>("/auth/me")
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginRequest) => {
    const res = await apiPost<TokenResponse>("/auth/login", credentials)
    setUser(res.user)
    // Redirect based on role
    router.push("/dashboard")
  }, [router])

  // ── Signup ───────────────────────────────────────────────────────────────
  const signup = useCallback(async (data: SignupRequest) => {
    const res = await apiPost<TokenResponse>("/auth/signup", data)
    setUser(res.user)
    router.push("/dashboard")
  }, [router])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout", {})
    } finally {
      setUser(null)
      router.push("/login")
    }
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}

// ── Role helpers (use these in components) ────────────────────────────────────

export function isAdmin(user: User | null): boolean {
  return user?.role === "admin"
}

export function isWarehouseManager(user: User | null): boolean {
  return user?.role === "warehouse_manager"
}

export function isAnalyst(user: User | null): boolean {
  return user?.role === "analyst"
}

export function canUpload(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "warehouse_manager"
}

export function canSeeRevenue(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "analyst"
}

export function canSeeAllWarehouses(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "analyst"
}