"use client";

import { useState, useEffect } from "react";
import { cn, formatPrice, formatArea, capitalize } from "@/lib/utils";
import { X, Save, Building2, User, Phone, Map, DollarSign, LayoutDashboard, FileText } from "lucide-react";

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

interface UnitSidePanelProps {
  unit: Unit | null;
  onClose: () => void;
  onSave: (unit: Unit) => void;
  isOpen: boolean;
}

export function UnitSidePanel({ unit, onClose, onSave, isOpen }: UnitSidePanelProps) {
  const [formData, setFormData] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (unit) {
      setFormData(unit);
    }
  }, [unit]);

  if (!isOpen || !formData) return null;

  const updateField = (field: keyof Unit, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!formData) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/units/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: formData.status,
          price: formData.price,
          type: formData.type,
          superArea: formData.superArea,
          carpetArea: formData.carpetArea,
          plc: formData.plc,
          facing: formData.facing,
          isCorner: formData.isCorner,
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          notes: formData.notes,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSave(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[hsl(var(--background))] border-l z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-[hsl(var(--card))]">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-500" />
              Unit {formData.unitNumber}
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Floor {formData.floor}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Status & Pricing */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Commercials & Status
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium mb-1.5 block">Current Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20",
                    formData.status === "available" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" :
                    formData.status === "sold" ? "bg-red-500/10 text-red-600 border-red-200" :
                    formData.status === "booked" ? "bg-purple-500/10 text-purple-600 border-purple-200" :
                    "bg-amber-500/10 text-amber-600 border-amber-200"
                  )}
                >
                  <option value="available">Available</option>
                  <option value="hold">Hold</option>
                  <option value="booked">Booked</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Base Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">PLC (₹)</label>
                <input
                  type="number"
                  value={formData.plc || ""}
                  onChange={(e) => updateField("plc", parseFloat(e.target.value) || null)}
                  placeholder="0.00"
                  className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </section>

          {/* Unit Specifications */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Specifications
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Unit Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1.5 block">Facing</label>
                <input
                  type="text"
                  value={formData.facing || ""}
                  onChange={(e) => updateField("facing", e.target.value)}
                  placeholder="e.g. East"
                  className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Super Area (sq ft)</label>
                <input
                  type="number"
                  value={formData.superArea}
                  onChange={(e) => updateField("superArea", parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Carpet Area (sq ft)</label>
                <input
                  type="number"
                  value={formData.carpetArea || ""}
                  onChange={(e) => updateField("carpetArea", parseFloat(e.target.value) || null)}
                  className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isCorner"
                  checked={formData.isCorner}
                  onChange={(e) => updateField("isCorner", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                <label htmlFor="isCorner" className="text-sm font-medium">This is a corner unit (Premium applies)</label>
              </div>
            </div>
          </section>

          {/* Client Details (If sold/booked) */}
          {(formData.status === "sold" || formData.status === "booked") && (
            <section className="space-y-4 p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700 flex items-center gap-2">
                <User className="w-4 h-4" /> Client Details
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName || ""}
                    onChange={(e) => updateField("clientName", e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Client Phone</label>
                  <input
                    type="text"
                    value={formData.clientPhone || ""}
                    onChange={(e) => updateField("clientPhone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Notes */}
          <section className="space-y-4 pb-20">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center gap-2">
              <FileText className="w-4 h-4" /> Internal Notes
            </h3>
            
            <textarea
              value={formData.notes || ""}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Add any internal notes, block reasons, etc."
              rows={4}
              className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
            />
          </section>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-[hsl(var(--card))] flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border font-medium hover:bg-[hsl(var(--accent))] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </>
  );
}
