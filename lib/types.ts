export type RiskLevel = "Low" | "Medium" | "High"
export type Severity = "Low" | "Medium" | "High"

export interface InventoryRecord {
  id?: number
  product_id: string
  product_name: string
  category: string
  quantity: number
  price: number
  expiry_date: string
  warehouse: string
  daily_sales: number
  created_at?: string
}

export interface ForecastPoint {
  product_id: string
  product_name: string
  category: string
  forecast_date: string
  predicted_demand: number
  lower_bound: number
  upper_bound: number
}

export interface ExpiryRiskItem {
  product_id: string
  product_name: string
  category: string
  warehouse: string
  quantity: number
  days_until_expiry: number
  demand_velocity: number
  risk_score: number
  risk_level: RiskLevel
}

export interface AnomalyItem {
  product_id: string
  product_name: string
  category: string
  severity: Severity
  anomaly_type: string
  score: number
  description: string
  suggested_action: string
}

export interface RevenueTrendPoint {
  date: string
  actual_revenue: number
  projected_revenue: number
}

export interface RevenueCategory {
  category: string
  revenue: number
  share: number
}

export interface RevenueResponse {
  total_revenue: number
  trend: RevenueTrendPoint[]
  categories: RevenueCategory[]
}

export interface TransportRiskItem {
  id: number
  route_name: string
  status: "on-time" | "delayed" | "high-risk"
  eta_minutes: number
  risk_type: string
  location: string
  inventory_impact: string
  delay_minutes: number
}

export interface DashboardData {
  inventory: InventoryRecord[]
  forecast: ForecastPoint[]
  expiryRisk: ExpiryRiskItem[]
  anomalies: AnomalyItem[]
  revenue: RevenueResponse
  transportRisks: TransportRiskItem[]
}
