"use client"

import { useState } from "react"
import { AlertCircle, Bell, ChevronDown, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { AnomalyItem } from "@/lib/types"
import { EmptyState } from "./states"

export function AnomalyAlerts({ data }: { data: AnomalyItem[] }) {
  const [open, setOpen] = useState<string[]>([])

  function toggle(id: string) {
    setOpen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Anomaly Alerts
        </CardTitle>
        <CardDescription>Isolation Forest detections for demand, inventory, and supply chain abnormalities.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState title="No anomalies detected" description="The current inventory upload has no unusual records." />
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const id = `${item.product_id}-${item.anomaly_type}`
              const isOpen = open.includes(id)
              return (
                <Collapsible key={id} open={isOpen} onOpenChange={() => toggle(id)}>
                  <div className="rounded-lg border bg-card">
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-start justify-between gap-4 p-4 text-left">
                        <div className="flex gap-3">
                          <AlertCircle className="mt-1 h-5 w-5 text-destructive" />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium">{item.product_name}</h3>
                              <Badge variant={item.severity === "High" ? "destructive" : "secondary"}>{item.severity}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">{isOpen ? <ChevronDown /> : <ChevronRight />}</Button>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-3 border-t p-4 text-sm">
                        <p><span className="font-medium">Type:</span> {item.anomaly_type}</p>
                        <p><span className="font-medium">Score:</span> {item.score}</p>
                        <p><span className="font-medium">Suggested action:</span> {item.suggested_action}</p>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
