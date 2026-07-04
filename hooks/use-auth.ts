// hooks/use-auth.ts
// Thin re-export — useAuth lives in lib/auth-context.tsx
// This file exists for import path flexibility

export { useAuth, isAdmin, isAnalyst, isWarehouseManager, canUpload, canSeeRevenue, canSeeAllWarehouses } from "@/lib/auth-context"