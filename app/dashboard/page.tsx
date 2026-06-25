"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DemandForecast } from "@/components/dashboard/demand-forecast"
import { ExpiryRiskHeatmap } from "@/components/dashboard/expiry-risk-heatmap"
import { AnomalyAlerts } from "@/components/dashboard/anomaly-alerts"
import { ExpectedRevenue } from "@/components/dashboard/expected-revenue"
import { TransportRisks } from "@/components/dashboard/transport-risks"
import { InventoryOverview } from "@/components/dashboard/inventory-overview"
import { DashboardError, DashboardSkeleton } from "@/components/dashboard/states"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useState } from "react"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("inventory-overview")
  const { data, isLoading, error, refresh } = useDashboardData()

  const renderActiveSection = () => {
    if (isLoading) return <DashboardSkeleton />
    if (error) return <DashboardError message={error} />

    switch (activeSection) {
      case "inventory-overview":
        return <InventoryOverview data={data.inventory} />
      case "demand-forecast":
        return <DemandForecast inventory={data.inventory} forecast={data.forecast} onUploaded={refresh} />
      case "expiry-risk":
        return <ExpiryRiskHeatmap data={data.expiryRisk} />
      case "anomaly-alerts":
        return <AnomalyAlerts data={data.anomalies} />
      case "expected-revenue":
        return <ExpectedRevenue data={data.revenue} />
      case "transport-risks":
        return <TransportRisks data={data.transportRisks} />
      default:
        return <InventoryOverview data={data.inventory} />
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

        <div className="min-h-[600px]">{renderActiveSection()}</div>
      </div>
    </DashboardLayout>
  )
}
