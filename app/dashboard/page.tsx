// app/dashboard/page.tsx
"use client"

import { useState } from "react"
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

  // ── Destructure the two new values from the updated hook ─────────────────
  const {
    data,
    isLoading,
    error,
    refresh,
    selectedWarehouseId,
    setSelectedWarehouseId,
  } = useDashboardData()

  const renderActiveSection = () => {
    if (isLoading) return <DashboardSkeleton />
    if (error)     return <DashboardError message={error} />

    switch (activeSection) {
      case "inventory-overview": return <InventoryOverview data={data.inventory} />
      case "demand-forecast":    return <DemandForecast inventory={data.inventory} forecast={data.forecast} onUploaded={refresh} />
      case "expiry-risk":        return <ExpiryRiskHeatmap data={data.expiryRisk} />
      case "anomaly-alerts":     return <AnomalyAlerts data={data.anomalies} />
      case "expected-revenue":   return <ExpectedRevenue data={data.revenue} />
      case "transport-risks":    return <TransportRisks data={data.transportRisks} />
      default:                   return <InventoryOverview data={data.inventory} />
    }
  }

  return (
    <DashboardLayout activeSection={activeSection} setActiveSection={setActiveSection}>
      <div className="space-y-8">

        {/* Dashboard Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-foreground">LogiFlow Operations Dashboard</h1>
          <p className="text-muted-foreground">
            Upload inventory data, forecast demand, detect anomalies, and manage expiry risk from one workflow.
          </p>
        </div>

        {/* Warehouse filter bar */}
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

        {/* Warehouse overview cards — clicking one also sets the filter */}
        <WarehouseOverviewCards
          stats={data.warehouseStats ?? []}
          selectedId={selectedWarehouseId}
          onSelect={setSelectedWarehouseId}
        />

        {/* Active section (inventory, forecast, expiry, etc.) */}
        <div className="min-h-[600px]">{renderActiveSection()}</div>

        {/* Warehouse comparison + transfer recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WarehouseComparisonChart stats={data.warehouseStats ?? []} />
          <TransferRecommendations recommendations={data.transferRecs ?? []} />
        </div>

      </div>
    </DashboardLayout>
  )
}