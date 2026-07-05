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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// Token stored in memory (not localStorage — avoids XSS on sensitive data)
// For cross-domain production deployment
let memoryToken: string | null = null

async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }))
    throw new Error(err.detail ?? "Request failed")
  }
  return res.json() as Promise<T>
}

async function apiGet<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {}
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers,
  })
  if (!res.ok) throw new Error("Unauthenticated")
  return res.json() as Promise<T>
}

interface AuthContextValue extends AuthState {
  login:   (credentials: LoginRequest) => Promise<void>
  signup:  (data: SignupRequest)        => Promise<void>
  logout:  ()                           => Promise<void>
  refresh: ()                           => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user,      setUser]      = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: restore token from localStorage and verify it
  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      // Restore token from localStorage on page reload
      if (!memoryToken) {
        memoryToken = localStorage.getItem("logiflow_token")
      }
      if (!memoryToken) throw new Error("No token")
      const me = await apiGet<User>("/auth/me", memoryToken)
      setUser(me)
    } catch {
      memoryToken = null
      localStorage.removeItem("logiflow_token")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (credentials: LoginRequest) => {
    const res = await apiPost<TokenResponse>("/auth/login", credentials)
    memoryToken = res.access_token
    localStorage.setItem("logiflow_token", res.access_token)
    setUser(res.user)
    router.push("/dashboard")
  }, [router])

  const signup = useCallback(async (data: SignupRequest) => {
    const res = await apiPost<TokenResponse>("/auth/signup", data)
    memoryToken = res.access_token
    localStorage.setItem("logiflow_token", res.access_token)
    setUser(res.user)
    router.push("/dashboard")
  }, [router])

  const logout = useCallback(async () => {
    try {
      if (memoryToken) {
        await apiPost("/auth/logout", {}, memoryToken)
      }
    } finally {
      memoryToken = null
      localStorage.removeItem("logiflow_token")
      setUser(null)
      router.push("/login")
    }
  }, [router])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      refresh,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}

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