/**
 * Dashboard Layout Component
 * 
 * Provides the main dashboard layout with responsive sidebar navigation,
 * mobile menu support, and animated section transitions.
 * 
 * Features:
 * - Desktop: Fixed left sidebar (260px width)
 * - Mobile: Collapsible hamburger menu with slide-in sidebar
 * - Smooth animations with Framer Motion
 * - Section-based navigation system
 * 
 * @example
 * <DashboardLayout activeSection="demand-forecast" setActiveSection={setActive}>
 *   <DashboardContent />
 * </DashboardLayout>
 */

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Brain, Menu, TrendingUp, AlertTriangle, Bell, DollarSign, MapPin, LogOut, Boxes } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

/**
 * Navigation items for the dashboard sidebar.
 * Each item maps to a dashboard feature/component.
 */
const sidebarItems = [
  { name: "Inventory Overview", id: "inventory-overview", icon: Boxes },
  { name: "Demand Forecast", id: "demand-forecast", icon: TrendingUp },
  { name: "Expiry Risk Heatmap", id: "expiry-risk", icon: AlertTriangle },
  { name: "Anomaly Alerts", id: "anomaly-alerts", icon: Bell },
  { name: "Revenue Analytics", id: "expected-revenue", icon: DollarSign },
  { name: "Transport Risks", id: "transport-risks", icon: MapPin },
]

/**
 * Props for the DashboardLayout component
 */
interface DashboardLayoutProps {
  /** Child components to render in the main content area */
  children: React.ReactNode
  /** Currently active dashboard section ID */
  activeSection: string
  /** Callback to update active section */
  setActiveSection: (section: string) => void
}

/**
 * Main dashboard layout wrapper
 * Manages sidebar state and section navigation
 */
export function DashboardLayout({ children, activeSection, setActiveSection }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <motion.div
        className="flex items-center space-x-2 p-6 border-b border-sidebar-border"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Brain className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold text-sidebar-foreground">LogiFlow</span>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item, index) => (
          <motion.button
            key={item.id}
            onClick={() => {
              setActiveSection(item.id)
              setSidebarOpen(false)
            }}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              activeSection === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            )}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Link href="/">
          <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Back to Home
            </Button>
          </motion.div>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
            className="fixed left-4 top-4 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              size="icon"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </motion.div>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-sidebar border-sidebar-border">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="bg-sidebar border-r border-sidebar-border">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
