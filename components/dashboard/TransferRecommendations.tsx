// components/dashboard/TransferRecommendations.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TruckIcon } from "lucide-react"
import type { TransferRecommendation } from "@/lib/types"

interface Props {
  recommendations: TransferRecommendation[]
}

const urgencyVariant: Record
  TransferRecommendation["urgency"],
  "destructive" | "secondary" | "outline"
> = {
  high:   "destructive",
  medium: "secondary",
  low:    "outline",
}

export function TransferRecommendations({ recommendations }: Props) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TruckIcon className="h-4 w-4" />
            Transfer Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No transfer recommendations at this time. Stock levels look balanced.
          </p>
        </CardContent>
      </Card>
    )
  }

  const urgencyOrder = { high: 0, medium: 1, low: 2 }
  const sorted = [...recommendations]
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
    .slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TruckIcon className="h-4 w-4" />
          Transfer Recommendations
          <Badge variant="secondary" className="ml-auto">
            {recommendations.length} suggestion{recommendations.length !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {sorted.map((r, idx) => (
            <li
              key={`${r.product_id}-${r.from_warehouse_id}-${r.to_warehouse_id}-${idx}`}
              className="rounded-lg border p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-medium truncate max-w-[200px]">{r.product_name}</span>
                <Badge variant={urgencyVariant[r.urgency]}>{r.urgency}</Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
                <span>{r.from_warehouse_name}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                <span>{r.to_warehouse_name}</span>
                <span className="ml-auto font-semibold text-foreground">
                  {r.recommended_units} units
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{r.reason}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}