"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Percent, CheckCircle, X } from "lucide-react"

const discountData = [
  {
    id: 1,
    product: "Tomatoes",
    sku: "VEG001",
    expiry: "2 days",
    currentPrice: 45,
    suggestedDiscount: 25,
    expectedSellThrough: 85,
    reasoning:
      "High elasticity product with strong price sensitivity. 25% discount should move 85% of inventory before expiry.",
  },
  {
    id: 2,
    product: "Bananas",
    sku: "FRT001",
    expiry: "1 day",
    currentPrice: 30,
    suggestedDiscount: 40,
    expectedSellThrough: 90,
    reasoning:
      "Critical expiry timeline. Aggressive discount needed to clear inventory. High demand elasticity supports quick turnover.",
  },
  {
    id: 3,
    product: "Milk",
    sku: "DAI001",
    expiry: "4 days",
    currentPrice: 60,
    suggestedDiscount: 15,
    expectedSellThrough: 70,
    reasoning:
      "Moderate discount sufficient due to consistent demand. Lower elasticity but steady consumption pattern.",
  },
  {
    id: 4,
    product: "Lettuce",
    sku: "VEG002",
    expiry: "3 days",
    currentPrice: 35,
    suggestedDiscount: 20,
    expectedSellThrough: 75,
    reasoning:
      "Seasonal demand patterns support moderate discount. Expected to clear majority of stock with 20% reduction.",
  },
]

export function DiscountActions() {
  const [appliedDiscounts, setAppliedDiscounts] = useState<number[]>([])
  const [ignoredItems, setIgnoredItems] = useState<number[]>([])

  const handleApplyDiscount = (id: number) => {
    setAppliedDiscounts([...appliedDiscounts, id])
  }

  const handleIgnore = (id: number) => {
    setIgnoredItems([...ignoredItems, id])
  }

  const getDiscountedPrice = (currentPrice: number, discount: number) => {
    return currentPrice * (1 - discount / 100)
  }

  return (
    <Card id="discount-actions" className="border-border/20 shadow-lg shadow-primary/10 floating-card bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2 font-sans">
          <Percent className="h-5 w-5 text-popover-foreground" />
          AI Discount Recommendations
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Smart pricing suggestions to maximize revenue and minimize waste
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {discountData.map((item) => {
            const isApplied = appliedDiscounts.includes(item.id)
            const isIgnored = ignoredItems.includes(item.id)

            return (
              <Card
                key={item.id}
                className={`border-border/20 floating-card bg-sidebar ${isApplied ? "bg-green-50" : isIgnored ? "bg-gray-50" : "bg-background"}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-foreground">{item.product}</h4>
                        <Badge variant="outline" className="text-xs">
                          {item.sku}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Expires in {item.expiry}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted">Current Price:</span>
                          <p className="font-medium text-foreground">₹{item.currentPrice}</p>
                        </div>
                        <div>
                          <span className="text-muted">Suggested Discount:</span>
                          <p className="font-medium text-lime-100">{item.suggestedDiscount}%</p>
                        </div>
                        <div>
                          <span className="text-muted">New Price:</span>
                          <p className="font-medium text-foreground">
                            ₹{getDiscountedPrice(item.currentPrice, item.suggestedDiscount).toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted">Expected Sell-through:</span>
                          <p className="font-medium text-secondary">{item.expectedSellThrough}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isApplied ? (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Applied
                        </Badge>
                      ) : isIgnored ? (
                        <Badge variant="secondary">
                          <X className="h-3 w-3 mr-1" />
                          Ignored
                        </Badge>
                      ) : (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View Reasoning
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>AI Discount Reasoning - {item.product}</DialogTitle>
                                <DialogDescription>Understanding the recommendation for {item.sku}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                  <p className="text-sm text-foreground">{item.reasoning}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-sidebar">Price Elasticity:</span>
                                    <p className="font-medium">High</p>
                                  </div>
                                  <div>
                                    <span className="text-sidebar">Demand Pattern:</span>
                                    <p className="font-medium">Seasonal</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => handleApplyDiscount(item.id)}
                          >
                            Apply Discount
                          </Button>

                          <Button className="text-foreground" size="sm" variant="outline" onClick={() => handleIgnore(item.id)}>
                            Ignore
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
