// lib/api.ts

import type {
  AnomalyItem,
  DashboardData,
  ExpiryRiskItem,
  ForecastPoint,
  InventoryRecord,
  RevenueResponse,
  TransferRecommendation,
  TransportRiskItem,
  Warehouse,
  WarehouseStats,
} from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  // ── EXISTING (unchanged) ────────────────────────────────────────────────

  uploadInventory(records: InventoryRecord[]) {
    return request<{ inserted: number; inventory_count: number }>("/upload", {
      method: "POST",
      body: JSON.stringify({ records }),
    })
  },

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

  // ── MODIFIED: accepts optional warehouseId filter ────────────────────────

  inventory(warehouseId?: number) {
    const qs = warehouseId != null ? `?warehouse_id=${warehouseId}` : ""
    return request<InventoryRecord[]>(`/inventory${qs}`)
  },

  // ── NEW: warehouse endpoints ─────────────────────────────────────────────

  warehouses() {
    return request<Warehouse[]>("/warehouses")
  },

  createWarehouse(payload: Omit<Warehouse, "id" | "created_at">) {
    return request<Warehouse>("/warehouses", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  warehouseStats() {
    return request<WarehouseStats[]>("/warehouses/stats")
  },

  transferRecommendations() {
    return request<TransferRecommendation[]>("/transfer-recommendations")
  },

  // ── MODIFIED dashboard: now includes warehouse data ──────────────────────

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
    ] = await Promise.all([
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

    return {
      inventory,
      forecast,
      expiryRisk,
      anomalies,
      revenue,
      transportRisks,
      warehouses,
      warehouseStats,
      transferRecs,
    }
  },
}