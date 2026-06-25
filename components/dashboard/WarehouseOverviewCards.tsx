// components/dashboard/WarehouseOverviewCards.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, IndianRupee, AlertTriangle, Warehouse } from "lucide-react";
import type { WarehouseStats } from "@/lib/types";

interface Props {
  stats: WarehouseStats[];
  selectedId?: number;
  onSelect: (id: number | undefined) => void;
}

function utilisationColor(pct: number): string {
  if (pct >= 85) return "text-red-500";
  if (pct >= 60) return "text-amber-500";
  return "text-emerald-500";
}

function utilisationBadge(pct: number): "destructive" | "secondary" | "outline" {
  if (pct >= 85) return "destructive";
  if (pct >= 60) return "secondary";
  return "outline";
}

export function WarehouseOverviewCards({ stats, selectedId, onSelect }: Props) {
  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s) => {
        const isSelected = selectedId === s.warehouse_id;
        return (
          <Card
            key={s.warehouse_id}
            onClick={() => onSelect(isSelected ? undefined : s.warehouse_id)}
            className={[
              "cursor-pointer transition-all hover:shadow-md",
              isSelected ? "ring-2 ring-primary" : "",
            ].join(" ")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                {s.warehouse_name}
              </CardTitle>
              <Badge variant={utilisationBadge(s.utilisation_pct)}>
                {s.utilisation_pct}%
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Items:</span>
                <span className="font-semibold">{s.total_items.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Value:</span>
                <span className="font-semibold">
                  ₹{(s.inventory_value / 1000).toFixed(1)}K
                </span>
              </div>
              {s.low_stock_count > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{s.low_stock_count} low stock</span>
                </div>
              )}
              {/* Utilisation bar */}
              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={[
                      "h-1.5 rounded-full transition-all",
                      s.utilisation_pct >= 85
                        ? "bg-red-500"
                        : s.utilisation_pct >= 60
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                    ].join(" ")}
                    style={{ width: `${Math.min(s.utilisation_pct, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${utilisationColor(s.utilisation_pct)}`}>
                  {s.total_units.toLocaleString()} / {s.capacity.toLocaleString()} units
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}