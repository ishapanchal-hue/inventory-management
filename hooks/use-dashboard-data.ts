// hooks/use-dashboard-data.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { DashboardData } from "@/lib/types"

const emptyRevenue = { total_revenue: 0, trend: [], categories: [] }

const emptyData: DashboardData = {
  inventory:      [],
  forecast:       [],
  expiryRisk:     [],
  anomalies:      [],
  revenue:        emptyRevenue,
  transportRisks: [],
  warehouses:     [],
  warehouseStats: [],
  transferRecs:   [],
}

export function useDashboardData() {
  const { user } = useAuth()

  // ── Warehouse filter ───────────────────────────────────────────────────────
  // Managers are locked to their warehouse; everyone else can freely filter
  const isManager        = user?.role === "warehouse_manager"
  const managerWarehouse = user?.warehouse_id ?? undefined

  const [selectedWarehouseId, _setSelectedWarehouseId] = useState<number | undefined>(
    isManager ? managerWarehouse : undefined,
  )

  // Re-lock if user changes (e.g. token refresh returns a different user)
  useEffect(() => {
    if (isManager) {
      _setSelectedWarehouseId(managerWarehouse)
    }
  }, [isManager, managerWarehouse])

  // Public setter — managers cannot override their scope
  const setSelectedWarehouseId = useCallback(
    (id: number | undefined) => {
      if (isManager) return   // silently ignore — UI should not show the selector anyway
      _setSelectedWarehouseId(id)
    },
    [isManager],
  )

  // ── Data fetching ──────────────────────────────────────────────────────────
  const [data,      setData]      = useState<DashboardData>(emptyData)
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const warehouseId = isManager ? managerWarehouse : selectedWarehouseId
      setData(await api.dashboard(warehouseId))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load dashboard data",
      )
    } finally {
      setIsLoading(false)
    }
  }, [selectedWarehouseId, isManager, managerWarehouse])

  useEffect(() => {
    // Only fetch once we know who the user is (avoids a double-fetch on mount)
    if (user !== undefined) {
      void refresh()
    }
  }, [refresh, user])

  return {
    data,
    isLoading,
    error,
    refresh,
    selectedWarehouseId,
    setSelectedWarehouseId,
    isWarehouseManagerLocked: isManager,   // ← lets UI hide the selector for managers
  }
}