// components/dashboard/WarehouseSelector.tsx

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Warehouse } from "@/lib/types";

interface Props {
  warehouses: Warehouse[];
  selectedId: number | undefined;
  onChange: (id: number | undefined) => void;
  disabled?: boolean;
}

export function WarehouseSelector({ warehouses, selectedId, onChange, disabled }: Props) {
  return (
    <Select
      disabled={disabled}
      value={selectedId != null ? String(selectedId) : "all"}
      onValueChange={(val) => onChange(val === "all" ? undefined : Number(val))}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All Warehouses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Warehouses</SelectItem>
        {warehouses.map((wh) => (
          <SelectItem key={wh.id} value={String(wh.id)}>
            {wh.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}