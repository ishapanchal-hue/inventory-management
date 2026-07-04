// app/dashboard/page.tsx
"use client"

import { useState } from "react"
import { useAuth, canUpload, canSeeRevenue, canSeeAllWarehouses } from "@/lib/auth-context"
import { WarehouseSelector }        from "@/components/dashboard/WarehouseSelector"
import { WarehouseOverviewCards }   from "@/components/dashboard/WarehouseOverviewCards"
import { WarehouseComparisonChart } from "@/components/dashboard/WarehouseComparisonChart"
import { TransferRecommendations }  from "@/components/dashboard/TransferRecommendations"
import { DashboardLayout }          from "@/components/dashboard-layout"
import { DemandForecast }           from "@/components/dashboard/demand-forecast"
import { ExpiryRiskHeatmap }        from "@/components/dashboard/expiry-risk-heatmap"
import { AnomalyAlerts }            from "@/components/dashboard/anomaly-alerts"
import { ExpectedRevenue }          from "@/components/dashboard/expected-revenue"
import { TransportRisks }           from "@/components/dashboard/transport-risks"
import { InventoryOverview }        from "@/components/dashboard/inventory-overview"
import { DashboardError, DashboardSkeleton } from "@/components/dashboard/states"
import { useDashboardData }         from "@/hooks/use-dashboard-data"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("inventory-overview")
  const { user } = useAuth()

  const {
    data,
    isLoading,
    error,
    refresh,
    selectedWarehouseId,
    setSelectedWarehouseId,
    isWarehouseManagerLocked,
  } = useDashboardData()

  // ── Role-aware section filter ──────────────────────────────────────────────
  // If a manager somehow lands on revenue (e.g. via URL), redirect to inventory
  const resolvedSection =
    activeSection === "expected-revenue" && !canSeeRevenue(user)
      ? "inventory-overview"
      : activeSection

  const renderActiveSection = () => {
    if (isLoading) return <DashboardSkeleton />
    if (error)     return <DashboardError message={error} />

    switch (resolvedSection) {
      case "inventory-overview": return <InventoryOverview data={data.inventory} />
      case "demand-forecast":
        return (
          <DemandForecast
            inventory={data.inventory}
            forecast={data.forecast}
            onUploaded={refresh}
          />
        )
      case "expiry-risk":      return <ExpiryRiskHeatmap data={data.expiryRisk} />
      case "anomaly-alerts":   return <AnomalyAlerts data={data.anomalies} />
      case "expected-revenue": return <ExpectedRevenue data={data.revenue} />
      case "transport-risks":  return <TransportRisks data={data.transportRisks} />
      default:                 return <InventoryOverview data={data.inventory} />
    }
  }

  // ── Role-aware greeting ────────────────────────────────────────────────────
  const greeting = user
    ? `Welcome back, ${user.full_name.split(" ")[0]}`
    : "LogiFlow Operations Dashboard"

  const subheading = user?.role === "warehouse_manager" && user.warehouse_id
    ? `Managing warehouse · ${data.warehouseStats?.find(s => s.warehouse_id === user.warehouse_id)?.warehouse_name ?? "your warehouse"}`
    : user?.role === "analyst"
    ? "Read-only access · Analytics & Reports"
    : "Upload inventory data, forecast demand, detect anomalies, and manage expiry risk."

  return (
    <DashboardLayout
      activeSection={resolvedSection}
      setActiveSection={setActiveSection}
    >
      <div className="space-y-8">

        {/* Dashboard Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{greeting}</h1>
          <p className="text-muted-foreground">{subheading}</p>
        </div>

        {/* Warehouse filter bar — hidden for managers (they're locked to one) */}
        {!isWarehouseManagerLocked && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Warehouse:</span>
            <WarehouseSelector
              warehouses={data.warehouses ?? []}
              selectedId={selectedWarehouseId}
              onChange={setSelectedWarehouseId}
              disabled={isLoading}
            />
            {selectedWarehouseId != null && (
              <button
                onClick={() => setSelectedWarehouseId(undefined)}
                className="text-xs text-muted-foreground underline underline-offset-2"
              >
                Clear filter
              </button>
            )}
          </div>
        )}

        {/* Warehouse overview cards */}
        <WarehouseOverviewCards
          stats={data.warehouseStats ?? []}
          selectedId={selectedWarehouseId}
          onSelect={isWarehouseManagerLocked ? () => {} : setSelectedWarehouseId}
        />

        {/* Active section */}
        <div className="min-h-[600px]">{renderActiveSection()}</div>

        {/* Comparison chart + transfer recommendations
            Managers see only transfer recs for their warehouse
            Analysts and admins see the full comparison chart too */}
        <div className={
          canSeeAllWarehouses(user)
            ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
            : "grid grid-cols-1 gap-6"
        }>
          {canSeeAllWarehouses(user) && (
            <WarehouseComparisonChart stats={data.warehouseStats ?? []} />
          )}
          <TransferRecommendations recommendations={data.transferRecs ?? []} />
        </div>

      </div>
    </DashboardLayout>
  )
}