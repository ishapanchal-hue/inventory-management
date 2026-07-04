// lib/api.ts

import type {
  AnomalyItem,
  DashboardData,
  ExpiryRiskItem,
  ForecastPoint,
  InventoryRecord,
  LoginRequest,
  RevenueResponse,
  SignupRequest,
  TokenResponse,
  TransferRecommendation,
  TransportRiskItem,
  User,
  Warehouse,
  WarehouseStats,
} from "@/lib/types"

const API_BASE_URL = "http://localhost:8000"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",   // ← sends httpOnly cookie on every request
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const detail = await response.json().catch(() => ({ detail: "Request failed" }))
    throw new Error(detail.detail ?? `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  // ── AUTH ──────────────────────────────────────────────────────────────────

  auth: {
    login(credentials: LoginRequest) {
      return request<TokenResponse>("/auth/login", {
        method: "POST",
        body:   JSON.stringify(credentials),
      })
    },

    signup(data: SignupRequest) {
      return request<TokenResponse>("/auth/signup", {
        method: "POST",
        body:   JSON.stringify(data),
      })
    },

    logout() {
      return request<{ message: string }>("/auth/logout", { method: "POST" })
    },

    me() {
      return request<User>("/auth/me")
    },
  },

  // ── INVENTORY ─────────────────────────────────────────────────────────────

  uploadInventory(records: InventoryRecord[]) {
    return request<{ inserted: number; inventory_count: number }>("/upload", {
      method: "POST",
      body:   JSON.stringify({ records }),
    })
  },

  inventory(warehouseId?: number) {
    const qs = warehouseId != null ? `?warehouse_id=${warehouseId}` : ""
    return request<InventoryRecord[]>(`/inventory${qs}`)
  },

  // ── ANALYTICS ─────────────────────────────────────────────────────────────

  forecast() {
    return request<ForecastPoint[]>("/forecast")
  },

  expiryRisk() {
    return request<ExpiryRiskItem[]>("/expiry-risk")
  },

  anomalies() {
    return request<AnomalyItem[]>("/anomalies")
  },

  revenue() {
    return request<RevenueResponse>("/revenue")
  },

  transportRisks() {
    return request<TransportRiskItem[]>("/transport-risks")
  },

  // ── WAREHOUSES ────────────────────────────────────────────────────────────

  warehouses() {
    return request<Warehouse[]>("/warehouses")
  },

  createWarehouse(payload: Omit<Warehouse, "id" | "created_at">) {
    return request<Warehouse>("/warehouses", {
      method: "POST",
      body:   JSON.stringify(payload),
    })
  },

  warehouseStats() {
    return request<WarehouseStats[]>("/warehouses/stats")
  },

  transferRecommendations() {
    return request<TransferRecommendation[]>("/transfer-recommendations")
  },

  // ── DASHBOARD (all in one) ────────────────────────────────────────────────

  async dashboard(warehouseId?: number): Promise<DashboardData> {
    const [
      inventory,
      forecast,
      expiryRisk,
      anomalies,
      revenue,
      transportRisks,
      warehouses,
      warehouseStats,
      transferRecs,
    ] = await Promise.allSettled([
      this.inventory(warehouseId),
      this.forecast(),
      this.expiryRisk(),
      this.anomalies(),
      this.revenue(),
      this.transportRisks(),
      this.warehouses(),
      this.warehouseStats(),
      this.transferRecommendations(),
    ])

    // Use Promise.allSettled so one 403 (e.g. revenue for managers)
    // doesn't crash the entire dashboard load
    function unwrap<T>(result: PromiseSettledResult<T>, fallback: T): T {
      return result.status === "fulfilled" ? result.value : fallback
    }

    const emptyRevenue = { total_revenue: 0, trend: [], categories: [] }

    return {
      inventory:      unwrap(inventory,      []),
      forecast:       unwrap(forecast,       []),
      expiryRisk:     unwrap(expiryRisk,     []),
      anomalies:      unwrap(anomalies,      []),
      revenue:        unwrap(revenue,        emptyRevenue),
      transportRisks: unwrap(transportRisks, []),
      warehouses:     unwrap(warehouses,     []),
      warehouseStats: unwrap(warehouseStats, []),
      transferRecs:   unwrap(transferRecs,   []),
    }
  },
}