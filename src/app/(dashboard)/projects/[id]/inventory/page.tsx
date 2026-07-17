"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutGrid, Table, Loader2, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { VisualInventoryEditor } from "@/components/projects/VisualInventoryEditor";
import { InventoryDataTable } from "@/components/projects/InventoryDataTable";
import { UnitSidePanel } from "@/components/projects/UnitSidePanel";
import { BulkActionToolbar } from "@/components/projects/BulkActionToolbar";

interface Unit {
  id: string;
  unitNumber: string;
  floor: number;
  type: string;
  superArea: number;
  carpetArea: number | null;
  price: number;
  plc: number | null;
  facing: string | null;
  isCorner: boolean;
  status: string;
  clientName: string | null;
  clientPhone: string | null;
  notes: string | null;
}

interface Tower {
  id: string;
  name: string;
  totalFloors: number;
  units: Unit[];
}

export default function ProjectInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [towers, setTowers] = useState<Tower[]>([]);
  const [activeTower, setActiveTower] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"visual" | "table">("visual");

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  // Generate wizard state
  const [showGenerateWizard, setShowGenerateWizard] = useState(false);
  const [genData, setGenData] = useState({ startFloor: 1, endFloor: 10, unitsPerFloor: 4, type: "3BHK", baseArea: 1500, basePrice: 5000000 });
  const [generating, setGenerating] = useState(false);

  const fetchProjectData = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data && data.towers) {
        setTowers(data.towers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const currentTower = towers[activeTower];

  const handleGenerateUnits = async () => {
    if (!currentTower) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${id}/inventory/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          towerId: currentTower.id,
          startFloor: genData.startFloor,
          endFloor: genData.endFloor,
          unitsPerFloor: genData.unitsPerFloor,
          unitType: genData.type,
          baseSuperArea: genData.baseArea,
          basePrice: genData.basePrice,
          prefix: currentTower.name.charAt(0) + "-",
        }),
      });
      if (res.ok) {
        setShowGenerateWizard(false);
        fetchProjectData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleUnit = (unitId: string) => {
    if (selectedUnitIds.length > 0) {
      // In bulk mode, toggle selection
      setSelectedUnitIds((prev) => 
        prev.includes(unitId) ? prev.filter(u => u !== unitId) : [...prev, unitId]
      );
    } else {
      // Not in bulk mode, just open side panel
      setEditingUnitId(unitId);
    }
  };

  const handleLongPressToggle = (unitId: string) => {
     // Alternative logic can be added if needed, right now we just check if selected array has items
     setSelectedUnitIds((prev) => 
        prev.includes(unitId) ? prev.filter(u => u !== unitId) : [...prev, unitId]
      );
  }

  const handleUpdateUnitInState = (updatedUnit: Unit) => {
    setTowers((prev) => {
      const newTowers = [...prev];
      const tIdx = newTowers.findIndex(t => t.id === currentTower.id);
      if (tIdx > -1) {
        const uIdx = newTowers[tIdx].units.findIndex(u => u.id === updatedUnit.id);
        if (uIdx > -1) {
          newTowers[tIdx].units[uIdx] = updatedUnit;
        }
      }
      return newTowers;
    });
    setEditingUnitId(null);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!towers.length) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center py-20">
          <Building2 className="w-12 h-12 text-[hsl(var(--muted-foreground))] opacity-50 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Towers Found</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">You need to add towers to this project before managing inventory.</p>
          <button onClick={() => router.push(`/projects/${id}`)} className="px-4 py-2 bg-brand-500 text-white rounded-lg">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 border-b shrink-0 bg-[hsl(var(--background))]">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/projects/${id}`)} className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Inventory Manager</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Manage units, pricing, and availability</p>
          </div>
        </div>

        <div className="flex items-center bg-[hsl(var(--card))] border rounded-lg p-1">
          <button
            onClick={() => setViewMode("visual")}
            className={cn("px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all", viewMode === "visual" ? "bg-[hsl(var(--accent))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]")}
          >
            <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Visual Plan</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn("px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all", viewMode === "table" ? "bg-[hsl(var(--accent))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]")}
          >
            <Table className="w-4 h-4" /> <span className="hidden sm:inline">Data Table</span>
          </button>
        </div>
      </div>

      {/* Tower Selector */}
      <div className="flex items-center gap-2 px-6 py-3 border-b bg-[hsl(var(--card))]/50 shrink-0 overflow-x-auto">
        {towers.map((t, i) => (
          <button
            key={t.id}
            onClick={() => { setActiveTower(i); setSelectedUnitIds([]); }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              i === activeTower
                ? "bg-brand-500 text-white shadow-sm"
                : "border hover:bg-[hsl(var(--accent))]"
            )}
          >
            {t.name}
            <span className={cn("ml-2 text-xs px-2 py-0.5 rounded-full", i === activeTower ? "bg-white/20" : "bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]")}>
              {t.units.length} units
            </span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 bg-[hsl(var(--background))]">
        {currentTower?.units.length === 0 ? (
          /* Generate Wizard */
          <div className="max-w-xl mx-auto mt-10 p-8 rounded-2xl bg-[hsl(var(--card))] border shadow-sm text-center">
            <div className="w-12 h-12 bg-brand-500/10 text-brand-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Initialize Inventory</h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-8">
              This tower has no units yet. Quickly generate them based on standard floor plans, or add them manually via the table later.
            </p>

            {showGenerateWizard ? (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Start Floor</label>
                    <input type="number" value={genData.startFloor} onChange={(e) => setGenData({...genData, startFloor: parseInt(e.target.value) || 1})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">End Floor</label>
                    <input type="number" value={genData.endFloor} onChange={(e) => setGenData({...genData, endFloor: parseInt(e.target.value) || 1})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Units per Floor</label>
                    <input type="number" value={genData.unitsPerFloor} onChange={(e) => setGenData({...genData, unitsPerFloor: parseInt(e.target.value) || 1})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Unit Type</label>
                    <input type="text" value={genData.type} onChange={(e) => setGenData({...genData, type: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Base Area (sq ft)</label>
                    <input type="number" value={genData.baseArea} onChange={(e) => setGenData({...genData, baseArea: parseInt(e.target.value) || 0})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Base Price</label>
                    <input type="number" value={genData.basePrice} onChange={(e) => setGenData({...genData, basePrice: parseInt(e.target.value) || 0})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowGenerateWizard(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-[hsl(var(--accent))]">Cancel</button>
                  <button onClick={handleGenerateUnits} disabled={generating} className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50">
                    {generating ? "Generating..." : "Generate Units"}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowGenerateWizard(true)} className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 shadow-sm shadow-brand-500/20">
                Setup Floor Plan
              </button>
            )}
          </div>
        ) : (
          /* Editor / Table */
          <div className="max-w-6xl mx-auto pb-24">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {selectedUnitIds.length > 0 
                  ? `${selectedUnitIds.length} units selected` 
                  : "Click a unit to view details. Shift-click or long-press to enter multi-select mode."}
              </p>
              
              <button 
                onClick={() => setSelectedUnitIds(selectedUnitIds.length === currentTower.units.length ? [] : currentTower.units.map(u => u.id))}
                className="text-sm font-medium text-brand-500 hover:text-brand-600"
              >
                {selectedUnitIds.length === currentTower.units.length ? "Deselect All" : "Select All in Tower"}
              </button>
            </div>

            {viewMode === "visual" ? (
              <VisualInventoryEditor 
                units={currentTower.units}
                maxFloor={currentTower.totalFloors}
                selectedUnitIds={selectedUnitIds}
                onToggleUnit={(unitId) => {
                  if (selectedUnitIds.length > 0) {
                    handleToggleUnit(unitId);
                  } else {
                    setEditingUnitId(unitId);
                  }
                }}
                onClearSelection={() => setSelectedUnitIds([])}
              />
            ) : (
              <InventoryDataTable
                units={currentTower.units}
                selectedUnitIds={selectedUnitIds}
                onToggleUnit={handleToggleUnit}
                onToggleAll={setSelectedUnitIds}
              />
            )}
          </div>
        )}
      </div>

      <UnitSidePanel 
        unit={currentTower?.units.find(u => u.id === editingUnitId) || null}
        isOpen={!!editingUnitId}
        onClose={() => setEditingUnitId(null)}
        onSave={handleUpdateUnitInState}
      />

      <BulkActionToolbar
        selectedIds={selectedUnitIds}
        projectId={id}
        onClear={() => setSelectedUnitIds([])}
        onRefresh={fetchProjectData}
      />
    </div>
  );
}
