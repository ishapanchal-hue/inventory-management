"use client"

import { useCallback, useEffect, useState } from "react"

import { api } from "@/lib/api"
import type { DashboardData } from "@/lib/types"

const emptyRevenue = { total_revenue: 0, trend: [], categories: [] }

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    inventory: [],
    forecast: [],
    expiryRisk: [],
    anomalies: [],
    revenue: emptyRevenue,
    transportRisks: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setData(await api.dashboard())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, isLoading, error, refresh }
}
