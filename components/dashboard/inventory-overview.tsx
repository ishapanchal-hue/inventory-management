"use client"

import { Boxes, PackageCheck, Warehouse } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { InventoryRecord } from "@/lib/types"
import { EmptyState } from "./states"

export function InventoryOverview({ data }: { data: InventoryRecord[] }) {
  const totalUnits = data.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = data.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const warehouses = new Set(data.map((item) => item.warehouse)).size

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Boxes className="h-8 w-8 text-primary" />
            <div><p className="text-sm text-muted-foreground">Total units</p><p className="text-2xl font-bold">{totalUnits.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <PackageCheck className="h-8 w-8 text-primary" />
            <div><p className="text-sm text-muted-foreground">Inventory value</p><p className="text-2xl font-bold">Rs {totalValue.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Warehouse className="h-8 w-8 text-primary" />
            <div><p className="text-sm text-muted-foreground">Warehouses</p><p className="text-2xl font-bold">{warehouses}</p></div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>Latest uploaded products used by all dashboard analytics.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <EmptyState title="No inventory uploaded" description="Start from Demand Forecast and upload a CSV file." />
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Daily sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={`${item.product_id}-${item.warehouse}`}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.warehouse}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>Rs {item.price.toFixed(2)}</TableCell>
                      <TableCell>{item.expiry_date}</TableCell>
                      <TableCell>{item.daily_sales}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
