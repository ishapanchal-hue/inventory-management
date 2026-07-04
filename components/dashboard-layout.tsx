// components/dashboard-layout.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Brain, Menu, TrendingUp, AlertTriangle, Bell,
  DollarSign, MapPin, LogOut, Boxes, Loader2,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useAuth, canUpload, canSeeRevenue, canSeeAllWarehouses } from "@/lib/auth-context"
import type { Role } from "@/lib/types"

// ── Sidebar item definitions ──────────────────────────────────────────────────

const ALL_SIDEBAR_ITEMS = [
  {
    name:     "Inventory Overview",
    id:       "inventory-overview",
    icon:     Boxes,
    roles:    ["admin", "warehouse_manager", "analyst"] as Role[],
  },
  {
    name:     "Demand Forecast",
    id:       "demand-forecast",
    icon:     TrendingUp,
    roles:    ["admin", "warehouse_manager", "analyst"] as Role[],
  },
  {
    name:     "Expiry Risk Heatmap",
    id:       "expiry-risk",
    icon:     AlertTriangle,
    roles:    ["admin", "warehouse_manager", "analyst"] as Role[],
  },
  {
    name:     "Anomaly Alerts",
    id:       "anomaly-alerts",
    icon:     Bell,
    roles:    ["admin", "warehouse_manager", "analyst"] as Role[],
  },
  {
    name:     "Revenue Analytics",
    id:       "expected-revenue",
    icon:     DollarSign,
    roles:    ["admin", "analyst"] as Role[],   // managers excluded
  },
  {
    name:     "Transport Risks",
    id:       "transport-risks",
    icon:     MapPin,
    roles:    ["admin", "warehouse_manager", "analyst"] as Role[],
  },
]

// ── Role badge styling ────────────────────────────────────────────────────────

const ROLE_LABELS: Record<Role, string> = {
  admin:             "Admin",
  warehouse_manager: "Manager",
  analyst:           "Analyst",
}

const ROLE_BADGE_CLASSES: Record<Role, string> = {
  admin:             "bg-red-500/20 text-red-400 border-red-500/30",
  warehouse_manager: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  analyst:           "bg-green-500/20 text-green-400 border-green-500/30",
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children:         React.ReactNode
  activeSection:    string
  setActiveSection: (section: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardLayout({ children, activeSection, setActiveSection }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, isLoading: authLoading } = useAuth()

  // Filter sidebar items to only those the current role can see
  const sidebarItems = ALL_SIDEBAR_ITEMS.filter(
    (item) => user && item.roles.includes(user.role as Role),
  )

  const handleLogout = async () => {
    await logout()
  }

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

      {/* User info block */}
{/* REPLACE with: */}
      {user && (
        <div className="px-4 py-3 border-b border-sidebar-border space-y-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {user.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-medium text-sidebar-foreground truncate min-w-0">
              {user.full_name}
            </p>
          </div>
          <p className="text-xs text-muted-foreground truncate pl-9">
            {user.email}
          </p>
          <div className="pl-9">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                ROLE_BADGE_CLASSES[user.role as Role],
              )}
            >
              {ROLE_LABELS[user.role as Role]}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
            transition={{ delay: index * 0.05 }}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.name}</span>
          </motion.button>
        ))}
      </nav>

      {/* Footer: logout */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => void handleLogout()}
            disabled={authLoading}
          >
            {authLoading
              ? <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              : <LogOut className="h-5 w-5 mr-3" />
            }
            Logout
          </Button>
        </motion.div>

        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:bg-sidebar-accent"
          >
            ← Back to Home
          </Button>
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
        <div className="bg-sidebar border-r border-sidebar-border h-full">
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