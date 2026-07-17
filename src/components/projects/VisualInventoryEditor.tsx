"use client";

import { cn, capitalize } from "@/lib/utils";

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

interface VisualInventoryEditorProps {
  units: Unit[];
  maxFloor: number;
  selectedUnitIds: string[];
  onToggleUnit: (unitId: string) => void;
  onClearSelection: () => void;
}

const unitStatusColors: Record<string, string> = {
  available: "bg-emerald-500 hover:bg-emerald-400 text-white",
  sold: "bg-red-500 hover:bg-red-400 text-white",
  booked: "bg-purple-500 hover:bg-purple-400 text-white",
  hold: "bg-amber-500 hover:bg-amber-400 text-white",
};

export function VisualInventoryEditor({
  units,
  maxFloor,
  selectedUnitIds,
  onToggleUnit,
}: VisualInventoryEditorProps) {
  // Group units by floor
  const unitsByFloor: Record<number, Unit[]> = {};
  units.forEach((unit) => {
    if (!unitsByFloor[unit.floor]) unitsByFloor[unit.floor] = [];
    unitsByFloor[unit.floor].push(unit);
  });

  // Sort units within a floor by unit number
  Object.keys(unitsByFloor).forEach((floor) => {
    unitsByFloor[parseInt(floor)].sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
  });

  return (
    <div className="rounded-xl bg-[hsl(var(--card))] border p-5 overflow-x-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm">Visual Floor Plan</h2>
        <div className="flex items-center gap-3 text-[10px]">
          {Object.entries(unitStatusColors).map(([status, cls]) => (
            <span key={status} className="flex items-center gap-1">
              <span className={cn("w-3 h-3 rounded-sm", cls.split(" ")[0])} />
              {capitalize(status)}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-1 min-w-[600px]">
        {Array.from({ length: maxFloor }, (_, i) => maxFloor - i).map((floor) => {
          const floorUnits = unitsByFloor[floor] || [];
          return (
            <div key={floor} className="flex items-center gap-2">
              <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] w-10 text-right pr-2 border-r">
                F{floor}
              </span>
              <div className="flex-1 flex gap-1.5 py-0.5">
                {floorUnits.length > 0 ? (
                  floorUnits.map((unit) => {
                    const isSelected = selectedUnitIds.includes(unit.id);
                    return (
                      <button
                        key={unit.id}
                        onClick={() => onToggleUnit(unit.id)}
                        className={cn(
                          "flex-1 h-10 rounded-md text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center relative group",
                          unitStatusColors[unit.status] || "bg-gray-500",
                          isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-[hsl(var(--card))] scale-105 z-10 shadow-lg" : "hover:scale-105"
                        )}
                        title={`${unit.unitNumber} — ${unit.type}`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 border-2 border-white rounded-md z-20 pointer-events-none" />
                        )}
                        <span>{unit.unitNumber.slice(-2)}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex-1 h-10 border border-dashed rounded-md bg-[hsl(var(--accent))]/20 flex items-center justify-center text-[10px] text-[hsl(var(--muted-foreground))]">
                    No units
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-4 text-center">
        Tip: Click on units to select them for bulk actions, or to edit their details in the side panel.
      </p>
    </div>
  );
}
