"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { capitalize } from "@/lib/utils";

const projectStatuses = ["active", "upcoming", "completed"];

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    builder: "",
    description: "",
    location: "",
    status: "active",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
    return formData.name.length >= 3 && formData.builder.length >= 2 && formData.location.length >= 3;
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
            Enter the details for a new developer project
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-[hsl(var(--card))] border p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="font-semibold">Project Information</h2>
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
                className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {projectStatuses.map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
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
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={handleSubmit}
          disabled={!canProceed() || saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Create Project"}
        </button>
      </div>
    </div>
  );
}
