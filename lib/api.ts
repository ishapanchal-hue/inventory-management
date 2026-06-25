import type {
  AnomalyItem,
  DashboardData,
  ExpiryRiskItem,
  ForecastPoint,
  InventoryRecord,
  RevenueResponse,
  TransportRiskItem,
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
  uploadInventory(records: InventoryRecord[]) {
    return request<{ inserted: number; inventory_count: number }>("/upload", {
      method: "POST",
      body: JSON.stringify({ records }),
    })
  },
  inventory() {
    return request<InventoryRecord[]>("/inventory")
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
  async dashboard(): Promise<DashboardData> {
    const [inventory, forecast, expiryRisk, anomalies, revenue, transportRisks] = await Promise.all([
      this.inventory(),
      this.forecast(),
      this.expiryRisk(),
      this.anomalies(),
      this.revenue(),
      this.transportRisks(),
    ])

    return { inventory, forecast, expiryRisk, anomalies, revenue, transportRisks }
  },
}
