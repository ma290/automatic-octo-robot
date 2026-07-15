"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { cn, formatPrice, formatArea, capitalize } from "@/lib/utils";
import { ArrowLeft, Building2, MapPin, Download, Layers } from "lucide-react";

interface Unit {
  id: string;
  unitNumber: string;
  floor: number;
  type: string;
  area: number;
  price: number;
  status: string;
  bedrooms: number | null;
  bathrooms: number | null;
}

interface Tower {
  id: string;
  name: string;
  totalFloors: number;
  units: Unit[];
}

interface Project {
  id: string;
  name: string;
  builder: string;
  description: string | null;
  location: string;
  status: string;
  brochureUrl: string | null;
  priceSheetUrl: string | null;
  towers: Tower[];
  stats: {
    total: number;
    available: number;
    sold: number;
    booked: number;
    hold: number;
  };
}

const unitStatusColors: Record<string, string> = {
  available: "bg-emerald-500 hover:bg-emerald-400 text-white",
  sold: "bg-red-500 hover:bg-red-400 text-white",
  booked: "bg-purple-500 hover:bg-purple-400 text-white",
  hold: "bg-amber-500 hover:bg-amber-400 text-white",
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTower, setActiveTower] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then(setProject)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-[hsl(var(--card))] rounded animate-pulse" />
        <div className="h-96 bg-[hsl(var(--card))] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) return null;

  const tower = project.towers[activeTower];
  const maxFloor = tower ? tower.totalFloors : 0;
  const unitsPerFloor = tower ? Math.ceil(tower.units.length / tower.totalFloors) : 0;

  // Group units by floor
  const unitsByFloor: Record<number, Unit[]> = {};
  tower?.units.forEach((unit) => {
    if (!unitsByFloor[unit.floor]) unitsByFloor[unit.floor] = [];
    unitsByFloor[unit.floor].push(unit);
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              by {project.builder} · <MapPin className="w-3 h-3 inline" /> {project.location}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {project.brochureUrl && (
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Brochure</span>
            </button>
          )}
          {project.priceSheetUrl && (
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Price Sheet</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: project.stats.total, color: "text-[hsl(var(--foreground))]" },
          { label: "Available", value: project.stats.available, color: "text-emerald-500" },
          { label: "Sold", value: project.stats.sold, color: "text-red-500" },
          { label: "Booked", value: project.stats.booked, color: "text-purple-500" },
          { label: "Hold", value: project.stats.hold, color: "text-amber-500" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-[hsl(var(--card))] border p-3 text-center">
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tower Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {project.towers.map((t, i) => (
          <button
            key={t.id}
            onClick={() => { setActiveTower(i); setSelectedUnit(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              i === activeTower
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-[hsl(var(--card))] border hover:bg-[hsl(var(--accent))]"
            )}
          >
            <Layers className="w-4 h-4" />
            {t.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unit Grid */}
        <div className="lg:col-span-3 rounded-xl bg-[hsl(var(--card))] border p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Floor Plan — {tower?.name}</h2>
            <div className="flex items-center gap-3 text-[10px]">
              {Object.entries(unitStatusColors).map(([status, cls]) => (
                <span key={status} className="flex items-center gap-1">
                  <span className={cn("w-3 h-3 rounded-sm", cls.split(" ")[0])} />
                  {capitalize(status)}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1 min-w-[400px]">
            {Array.from({ length: maxFloor }, (_, i) => maxFloor - i).map((floor) => {
              const floorUnits = unitsByFloor[floor] || [];
              return (
                <div key={floor} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] w-8 text-right">
                    F{floor}
                  </span>
                  <div className="flex-1 flex gap-1">
                    {floorUnits.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit)}
                        className={cn(
                          "flex-1 h-9 rounded-md text-[10px] font-bold transition-all duration-200 flex items-center justify-center",
                          unitStatusColors[unit.status] || "bg-gray-500",
                          selectedUnit?.id === unit.id && "ring-2 ring-white ring-offset-2 ring-offset-[hsl(var(--card))] scale-105"
                        )}
                        title={`${unit.unitNumber} — ${unit.type} — ${formatPrice(unit.price)}`}
                      >
                        {unit.unitNumber.slice(-2)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unit Detail Panel */}
        <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
          {selectedUnit ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Unit {selectedUnit.unitNumber}</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Type", value: selectedUnit.type },
                  { label: "Floor", value: `${selectedUnit.floor}` },
                  { label: "Area", value: formatArea(selectedUnit.area) },
                  { label: "Price", value: formatPrice(selectedUnit.price) },
                  { label: "Status", value: capitalize(selectedUnit.status) },
                  ...(selectedUnit.bedrooms != null ? [{ label: "Bedrooms", value: `${selectedUnit.bedrooms}` }] : []),
                  ...(selectedUnit.bathrooms != null ? [{ label: "Bathrooms", value: `${selectedUnit.bathrooms}` }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <Building2 className="w-8 h-8 text-[hsl(var(--muted-foreground))] opacity-30 mx-auto mb-2" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Click a unit to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
