"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts"

const areaData = [
  { month: "Jan", inventory: 400, demand: 350 },
  { month: "Feb", inventory: 300, demand: 280 },
  { month: "Mar", inventory: 600, demand: 550 },
  { month: "Apr", inventory: 800, demand: 750 },
  { month: "May", inventory: 700, demand: 680 },
  { month: "Jun", inventory: 900, demand: 850 },
]

const lineData = [
  { month: "Jan", demand: 400 },
  { month: "Feb", demand: 300 },
  { month: "Mar", demand: 600 },
  { month: "Apr", demand: 800 },
  { month: "May", demand: 700 },
  { month: "Jun", demand: 900 },
]

export function MiniDashboardPreview() {
  return (
    <Card className="border-border/20 shadow-2xl shadow-primary/20 bg-yellow-50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-card-foreground">Live Dashboard Preview</CardTitle>
        <CardDescription className="text-muted-foreground">Interactive analytics powered by AI</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Inventory vs Demand</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="inventoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#065f46" />
                <YAxis stroke="#065f46" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inventory"
                  stackId="1"
                  stroke="#22c55e"
                  fill="url(#inventoryGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="demand"
                  stackId="2"
                  stroke="#3b82f6"
                  fill="url(#demandGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Demand Forecast</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <XAxis dataKey="month" stroke="#065f46" />
                <YAxis stroke="#065f46" />
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke="#800000" // Updated to maroon color
                  strokeWidth={3}
                  dot={{ fill: "#800000", strokeWidth: 2, r: 4 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
