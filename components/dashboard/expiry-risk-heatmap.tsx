"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ExpiryRiskItem } from "@/lib/types"
import { EmptyState } from "./states"

export function ExpiryRiskHeatmap({ data }: { data: ExpiryRiskItem[] }) {
  const [selected, setSelected] = useState<ExpiryRiskItem | null>(null)

  const colorByRisk = {
    High: "bg-red-600 text-white hover:bg-red-700",
    Medium: "bg-amber-500 text-white hover:bg-amber-600",
    Low: "bg-emerald-600 text-white hover:bg-emerald-700",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Expiry Risk Heatmap
        </CardTitle>
        <CardDescription>Risk score from expiry timeline, stock quantity, and demand velocity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.length === 0 ? (
          <EmptyState title="No expiry risks yet" description="Upload inventory data to calculate expiry risk." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {data.map((item) => (
                <button
                  key={`${item.product_id}-${item.warehouse}`}
                  className={cn("rounded-md p-3 text-left transition", colorByRisk[item.risk_level])}
                  onClick={() => setSelected(item)}
                >
                  <p className="truncate text-sm font-semibold">{item.product_name}</p>
                  <p className="text-xs opacity-90">{item.days_until_expiry} days</p>
                  <p className="text-xs opacity-90">Score {item.risk_score}</p>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-red-600" /> High</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-amber-500" /> Medium</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-600" /> Low</span>
            </div>
            {selected && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{selected.product_name}</h3>
                  <Badge>{selected.risk_level}</Badge>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <p><span className="text-muted-foreground">Category:</span> {selected.category}</p>
                  <p><span className="text-muted-foreground">Warehouse:</span> {selected.warehouse}</p>
                  <p><span className="text-muted-foreground">Quantity:</span> {selected.quantity}</p>
                  <p><span className="text-muted-foreground">Daily sales:</span> {selected.demand_velocity}</p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
