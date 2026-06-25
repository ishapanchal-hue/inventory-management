"use client"

import { useCallback, useEffect, useState } from "react"

import { api } from "@/lib/api"
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
  const [data, setData]                           = useState<DashboardData>(emptyData)
  const [isLoading, setIsLoading]                 = useState(true)
  const [error, setError]                         = useState<string | null>(null)
  // ── new: selected warehouse filter ───────────────────────────────────────
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setData(await api.dashboard(selectedWarehouseId))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }, [selectedWarehouseId])   // ← re-fetches whenever warehouse filter changes

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    data,
    isLoading,
    error,
    refresh,
    // ── new exports ───────────────────────────────────────────────────────
    selectedWarehouseId,
    setSelectedWarehouseId,
  }
}