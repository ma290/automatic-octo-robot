"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, Check, TrendingUp, Tag, CircleSlash, Loader2 } from "lucide-react";

interface BulkActionToolbarProps {
  selectedIds: string[];
  onClear: () => void;
  onRefresh: () => void;
  projectId: string;
}

export function BulkActionToolbar({ selectedIds, onClear, onRefresh, projectId }: BulkActionToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [priceValue, setPriceValue] = useState("");

  if (selectedIds.length === 0) return null;

  const handleBulkStatus = async (status: string) => {
    setLoading(true);
    try {
      await fetch(`/api/projects/${projectId}/inventory/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitIds: selectedIds, data: { status } }),
      });
      onRefresh();
      onClear();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPrice = async () => {
    const val = parseFloat(priceValue);
    if (isNaN(val) || val <= 0) return;
    
    setLoading(true);
    try {
      await fetch(`/api/projects/${projectId}/inventory/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitIds: selectedIds, data: { price: val } }),
      });
      setShowPriceInput(false);
      setPriceValue("");
      onRefresh();
      onClear();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-[hsl(var(--card))] border shadow-2xl rounded-2xl p-2 flex items-center gap-3">
        
        <div className="flex items-center gap-2 px-3 py-1 border-r border-[hsl(var(--border))]">
          <div className="bg-brand-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {selectedIds.length}
          </div>
          <span className="text-sm font-medium whitespace-nowrap">Units Selected</span>
          <button onClick={onClear} className="p-1 hover:bg-[hsl(var(--accent))] rounded-full text-[hsl(var(--muted-foreground))]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {showPriceInput ? (
          <div className="flex items-center gap-2 px-2">
            <input 
              type="number"
              placeholder="New Price..."
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              className="w-32 rounded-lg border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              autoFocus
            />
            <button 
              onClick={handleBulkPrice}
              disabled={loading}
              className="p-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setShowPriceInput(false)}
              className="p-1.5 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2">
            <button 
              onClick={() => handleBulkStatus("available")}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-500/10 text-emerald-500 transition-colors"
            >
              <Check className="w-4 h-4" /> Available
            </button>
            <button 
              onClick={() => handleBulkStatus("hold")}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-500/10 text-amber-500 transition-colors"
            >
              <CircleSlash className="w-4 h-4" /> Hold
            </button>
            <button 
              onClick={() => handleBulkStatus("sold")}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-500/10 text-red-500 transition-colors"
            >
              <Tag className="w-4 h-4" /> Mark Sold
            </button>
            <div className="w-px h-6 bg-[hsl(var(--border))] mx-1" />
            <button 
              onClick={() => setShowPriceInput(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors"
            >
              <TrendingUp className="w-4 h-4" /> Update Price
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
