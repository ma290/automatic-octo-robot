"use client";

import { useState } from "react";
import { cn, capitalize, formatPrice, formatArea } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface Unit {
  id: string;
  unitNumber: string;
  floor: number;
  type: string;
  superArea: number;
  carpetArea: number | null;
  price: number;
  status: string;
}

interface InventoryDataTableProps {
  units: Unit[];
  selectedUnitIds: string[];
  onToggleUnit: (unitId: string) => void;
  onToggleAll: (unitIds: string[]) => void;
}

export function InventoryDataTable({
  units,
  selectedUnitIds,
  onToggleUnit,
  onToggleAll,
}: InventoryDataTableProps) {
  const [sortField, setSortField] = useState<keyof Unit>("unitNumber");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof Unit) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedUnits = [...units].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (aVal === null || aVal === undefined) return sortDir === "asc" ? 1 : -1;
    if (bVal === null || bVal === undefined) return sortDir === "asc" ? -1 : 1;

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    
    return sortDir === "asc" 
      ? String(aVal).localeCompare(String(bVal)) 
      : String(bVal).localeCompare(String(aVal));
  });

  const allSelected = units.length > 0 && selectedUnitIds.length === units.length;
  const someSelected = selectedUnitIds.length > 0 && !allSelected;

  const SortIcon = ({ field }: { field: keyof Unit }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  const statusColors: Record<string, string> = {
    available: "text-emerald-500 bg-emerald-500/10",
    sold: "text-red-500 bg-red-500/10",
    booked: "text-purple-500 bg-purple-500/10",
    hold: "text-amber-500 bg-amber-500/10",
  };

  return (
    <div className="rounded-xl bg-[hsl(var(--card))] border overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-[hsl(var(--muted-foreground))] uppercase bg-[hsl(var(--accent))]/50 border-b">
            <tr>
              <th className="p-4 w-12">
                <button
                  onClick={() => onToggleAll(allSelected ? [] : units.map((u) => u.id))}
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    allSelected ? "bg-brand-500 border-brand-500 text-white" : someSelected ? "bg-brand-500/50 border-brand-500 text-white" : "border-[hsl(var(--muted-foreground))] hover:border-brand-500"
                  )}
                >
                  {(allSelected || someSelected) && <Check className="w-3 h-3" />}
                </button>
              </th>
              <th className="p-4 cursor-pointer hover:text-brand-500 transition-colors" onClick={() => handleSort("unitNumber")}>
                Unit No <SortIcon field="unitNumber" />
              </th>
              <th className="p-4 cursor-pointer hover:text-brand-500 transition-colors" onClick={() => handleSort("floor")}>
                Floor <SortIcon field="floor" />
              </th>
              <th className="p-4 cursor-pointer hover:text-brand-500 transition-colors" onClick={() => handleSort("type")}>
                Type <SortIcon field="type" />
              </th>
              <th className="p-4 cursor-pointer hover:text-brand-500 transition-colors" onClick={() => handleSort("superArea")}>
                Super Area <SortIcon field="superArea" />
              </th>
              <th className="p-4 cursor-pointer hover:text-brand-500 transition-colors" onClick={() => handleSort("price")}>
                Price <SortIcon field="price" />
              </th>
              <th className="p-4 cursor-pointer hover:text-brand-500 transition-colors" onClick={() => handleSort("status")}>
                Status <SortIcon field="status" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {sortedUnits.length > 0 ? (
              sortedUnits.map((unit) => {
                const isSelected = selectedUnitIds.includes(unit.id);
                return (
                  <tr 
                    key={unit.id} 
                    className={cn(
                      "hover:bg-[hsl(var(--accent))]/50 transition-colors cursor-pointer",
                      isSelected && "bg-brand-500/5 hover:bg-brand-500/10"
                    )}
                    onClick={() => onToggleUnit(unit.id)}
                  >
                    <td className="p-4">
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          isSelected ? "bg-brand-500 border-brand-500 text-white" : "border-[hsl(var(--muted-foreground))] group-hover:border-brand-500"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{unit.unitNumber}</td>
                    <td className="p-4">{unit.floor}</td>
                    <td className="p-4">{unit.type}</td>
                    <td className="p-4">{formatArea(unit.superArea)}</td>
                    <td className="p-4 font-mono">{formatPrice(unit.price)}</td>
                    <td className="p-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusColors[unit.status] || "bg-gray-500/10 text-gray-500")}>
                        {capitalize(unit.status)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                  No units found. Try adjusting your filters or generating units.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
