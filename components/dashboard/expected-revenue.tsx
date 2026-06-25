"use client"

import { DollarSign } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RevenueResponse } from "@/lib/types"
import { EmptyState } from "./states"

const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"]

export function ExpectedRevenue({ data }: { data: RevenueResponse }) {
  const trend = data.trend.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    actual: Math.round(point.actual_revenue),
    projected: Math.round(point.projected_revenue),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue Analytics
        </CardTitle>
        <CardDescription>Projected revenue from current price and demand velocity.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.total_revenue === 0 ? (
          <EmptyState title="No revenue data" description="Upload inventory data to calculate revenue projections." />
        ) : (
          <div className="space-y-6">
            <p className="text-3xl font-bold">Rs {data.total_revenue.toLocaleString()}</p>
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" minTickGap={24} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="projected" stroke="#16a34a" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.categories} dataKey="share" nameKey="category" outerRadius={90} label>
                        {data.categories.map((category, index) => (
                          <Cell key={category.category} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.categories}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" name="Revenue">
                        {data.categories.map((category, index) => (
                          <Cell key={category.category} fill={colors[index % colors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
