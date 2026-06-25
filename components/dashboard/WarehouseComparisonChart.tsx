// components/dashboard/WarehouseComparisonChart.tsx

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WarehouseStats } from "@/lib/types";

interface Props {
  stats: WarehouseStats[];
}

export function WarehouseComparisonChart({ stats }: Props) {
  if (stats.length === 0) return null;

  const data = stats.map((s) => ({
    name:       s.warehouse_name,
    "Value (₹K)": parseFloat((s.inventory_value / 1000).toFixed(1)),
    "Units":      s.total_units,
    "Util %":     s.utilisation_pct,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Warehouse Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left"  tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend />
            <Bar yAxisId="left"  dataKey="Value (₹K)" fill="hsl(var(--primary))"    radius={[4,4,0,0]} />
            <Bar yAxisId="left"  dataKey="Units"       fill="hsl(221 83% 63%)"       radius={[4,4,0,0]} />
            <Bar yAxisId="right" dataKey="Util %"      fill="hsl(142 71% 45%)"       radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}