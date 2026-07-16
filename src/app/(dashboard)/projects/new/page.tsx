"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, Save, Plus, Trash2 } from "lucide-react";
import { cn, capitalize } from "@/lib/utils";

const steps = [
  { id: 1, title: "Basic Info", description: "Name, builder, location" },
  { id: 2, title: "Documents", description: "Brochures and plans" },
  { id: 3, title: "Inventory Structure", description: "Define towers" },
];

const projectStatuses = ["active", "upcoming", "completed"];

export default function NewProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    builder: "",
    description: "",
    location: "",
    status: "active",
    priceSheetUrl: "",
    brochureUrl: "",
    masterPlanUrl: "",
    towers: [] as { name: string; totalFloors: number }[],
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTower = () => {
    setFormData((prev) => ({
      ...prev,
      towers: [...prev.towers, { name: `Tower ${String.fromCharCode(65 + prev.towers.length)}`, totalFloors: 10 }],
    }));
  };

  const updateTower = (index: number, field: "name" | "totalFloors", value: any) => {
    setFormData((prev) => {
      const newTowers = [...prev.towers];
      newTowers[index] = { ...newTowers[index], [field]: field === "totalFloors" ? parseInt(value) || 0 : value };
      return { ...prev, towers: newTowers };
    });
  };

  const removeTower = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      towers: prev.towers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          towers: formData.towers.filter((t) => t.name.trim() !== "" && t.totalFloors > 0),
        }),
      });
      if (res.ok) {
        router.push(`/projects`);
      } else {
        console.error("Failed to create project");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.length >= 3 && formData.builder.length >= 2 && formData.location.length >= 3;
      case 2:
        return true; // Optional urls
      case 3:
        return formData.towers.every((t) => t.name.length > 0 && t.totalFloors > 0);
      default:
        return true;
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Add New Project</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Step {currentStep} of {steps.length} — {steps[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all",
                step.id < currentStep
                  ? "bg-emerald-500 text-white"
                  : step.id === currentStep
                  ? "bg-brand-500 text-white"
                  : "bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]"
              )}
            >
              {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "hidden sm:block flex-1 h-0.5 rounded-full transition-colors",
                  step.id < currentStep ? "bg-emerald-500" : "bg-[hsl(var(--accent))]"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <div className="rounded-xl bg-[hsl(var(--card))] border p-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Sea View Towers"
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Builder Name *</label>
                <input
                  type="text"
                  value={formData.builder}
                  onChange={(e) => updateField("builder", e.target.value)}
                  placeholder="e.g. Acme Developers"
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g. Andheri East, Mumbai"
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full rounded-lg border bg-[hsl(var(--card))] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {projectStatuses.map((s) => (
                    <option key={s} value={s}>{capitalize(s)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the project..."
                rows={4}
                className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Documents & Media</h2>
            <div>
              <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Brochure URL</label>
              <input
                type="url"
                value={formData.brochureUrl}
                onChange={(e) => updateField("brochureUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Master Plan URL</label>
              <input
                type="url"
                value={formData.masterPlanUrl}
                onChange={(e) => updateField("masterPlanUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Price Sheet URL</label>
              <input
                type="url"
                value={formData.priceSheetUrl}
                onChange={(e) => updateField("priceSheetUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Project Towers</h2>
              <button
                onClick={addTower}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-500 text-brand-500 text-sm font-medium hover:bg-brand-500/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Tower
              </button>
            </div>
            
            {formData.towers.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg bg-[hsl(var(--accent))]/50">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">No towers added yet. Click "Add Tower" to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.towers.map((tower, i) => (
                  <div key={i} className="flex items-end gap-3 p-3 rounded-lg border bg-[hsl(var(--accent))]/30">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Tower Name *</label>
                      <input
                        type="text"
                        value={tower.name}
                        onChange={(e) => updateTower(i, "name", e.target.value)}
                        placeholder="e.g. Tower A"
                        className="w-full rounded-md border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Total Floors *</label>
                      <input
                        type="number"
                        min="1"
                        value={tower.totalFloors || ""}
                        onChange={(e) => updateTower(i, "totalFloors", e.target.value)}
                        placeholder="e.g. 15"
                        className="w-full rounded-md border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <button
                      onClick={() => removeTower(i)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2.5 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--accent))] transition-colors"
        >
          Previous
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={() => setCurrentStep((s) => Math.min(steps.length, s + 1))}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Create Project"}
          </button>
        )}
      </div>
    </div>
  );
}
