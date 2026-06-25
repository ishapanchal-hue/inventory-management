"use client"

import { Clock, MapPin, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TransportRiskItem } from "@/lib/types"
import { EmptyState } from "./states"

export function TransportRisks({ data }: { data: TransportRiskItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Transport Risks
        </CardTitle>
        <CardDescription>Route risk derived from current warehouse inventory pressure.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState title="No route data" description="Upload inventory data to generate transport risk summaries." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.map((route) => (
              <div key={route.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{route.route_name}</h3>
                    <p className="text-sm text-muted-foreground">{route.location}</p>
                  </div>
                  <Badge variant={route.status === "high-risk" ? "destructive" : "secondary"}>{route.status}</Badge>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <p className="flex items-center gap-2"><Truck className="h-4 w-4" /> {route.risk_type}</p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> ETA {route.eta_minutes}m</p>
                  <p>Delay {route.delay_minutes}m</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{route.inventory_impact}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
