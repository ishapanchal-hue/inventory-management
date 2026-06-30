"use client"

import { useMemo, useState } from "react"
import { Upload, Wand2 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { parseInventoryCsv } from "@/lib/csv"
import type { ForecastPoint, InventoryRecord } from "@/lib/types"
import { EmptyState } from "./states"

interface DemandForecastProps {
  inventory: InventoryRecord[]
  forecast: ForecastPoint[]
  onUploaded: () => Promise<void>
}

export function DemandForecast({ inventory, forecast, onUploaded }: DemandForecastProps) {
  const [preview, setPreview] = useState<InventoryRecord[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const categoryData = useMemo(() => {
    const grouped = new Map<string, { category: string; quantity: number; dailySales: number }>()
    inventory.forEach((item) => {
      const existing = grouped.get(item.category) ?? { category: item.category, quantity: 0, dailySales: 0 }
      existing.quantity += item.quantity
      existing.dailySales += item.daily_sales
      grouped.set(item.category, existing)
    })
    return Array.from(grouped.values())
  }, [inventory])

  const forecastData = useMemo(
    () =>
      forecast.slice(0, 30).map((point) => ({
        date: new Date(point.forecast_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        demand: Math.round(point.predicted_demand),
      })),
    [forecast],
  )

  async function handleFileChange(file?: File) {
    if (!file) return
    const result = await parseInventoryCsv(file)
    setPreview(result.records.slice(0, 8))
    setErrors(result.errors)
    if (result.errors.length) {
      toast.error("CSV validation failed")
      return
    }
    toast.success(`${result.records.length} records parsed`)
  }

  async function uploadPreview() {
    if (!preview.length || errors.length) return
    setIsUploading(true)
    try {
      await api.uploadInventory(preview)
      await onUploaded()
      toast.success("Inventory uploaded and dashboard refreshed")
      setPreview([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CSV Inventory Upload
          </CardTitle>
          <CardDescription>Upload product inventory with expiry and daily sales data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="csv-upload">CSV file</Label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            className="block w-full text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            onChange={(event) => void handleFileChange(event.target.files?.[0])}
          />
          {errors.length > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {errors.slice(0, 8).map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
          {preview.length > 0 && (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Daily Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((item) => (
                      <TableRow key={`${item.product_id}-${item.warehouse}`}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>Rs {item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.expiry_date}</TableCell>
                        <TableCell>{item.warehouse}</TableCell>
                        <TableCell>{item.daily_sales}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button onClick={() => void uploadPreview()} disabled={isUploading || errors.length > 0}>
                {isUploading ? "Uploading..." : "Upload and Refresh Dashboard"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Demand Forecast
          </CardTitle>
          <CardDescription>30-day demand projection generated from uploaded sales velocity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {inventory.length === 0 ? (
            <EmptyState title="No inventory data" description="Upload a CSV to generate demand forecasts." />
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" name="Inventory" fill="var(--chart-1)" />
                    <Bar dataKey="dailySales" name="Daily sales" fill="var(--chart-2)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" minTickGap={24} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="demand" name="Predicted demand" stroke="var(--chart-4)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
