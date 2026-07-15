"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, capitalize } from "@/lib/utils";
import { ArrowLeft, Check, ChevronRight, Save, X, UploadCloud } from "lucide-react";

const steps = [
  { id: 1, title: "Basic Info", description: "Type, title, description" },
  { id: 2, title: "Location", description: "Address and city" },
  { id: 3, title: "Specifications", description: "Area, price, rooms" },
  { id: 4, title: "Media", description: "Images (optional)" },
  { id: 5, title: "Owner", description: "Contact details" },
];

const propertyTypes = ["residential", "commercial", "rental", "resale", "plot"];
const propertySubtypes = ["villa", "apartment", "office", "warehouse", "land", "penthouse", "studio", "shop", "farmhouse", "rowhouse"];
const propertyStatuses = ["available", "hold", "sold", "rented", "booked"];

export default function NewPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "residential",
    subtype: "apartment",
    status: "available",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    images: [] as string[],
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, event.target!.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          area: parseFloat(formData.area) || 0,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        }),
      });
      if (res.ok) {
        const property = await res.json();
        router.push(`/properties/${property.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.title.length >= 3 && formData.type && formData.subtype;
      case 2: return formData.address.length >= 5 && formData.city.length >= 2 && formData.state.length >= 2;
      case 3: return parseFloat(formData.price) > 0 && parseFloat(formData.area) > 0;
      default: return true;
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
          <h1 className="text-xl font-bold">Add New Property</h1>
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
              <div className={cn(
                "hidden sm:block flex-1 h-0.5 rounded-full transition-colors",
                step.id < currentStep ? "bg-emerald-500" : "bg-[hsl(var(--accent))]"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <div className="rounded-xl bg-[hsl(var(--card))] border p-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Basic Information</h2>
            <div>
              <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Property Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Luxe 3BHK Apartment in Bandra West"
                className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {propertyTypes.map((t) => <option key={t} value={t}>{capitalize(t)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Subtype *</label>
                <select
                  value={formData.subtype}
                  onChange={(e) => updateField("subtype", e.target.value)}
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {propertySubtypes.map((t) => <option key={t} value={t}>{capitalize(t)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {propertyStatuses.map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the property..."
                rows={4}
                className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Location Details</h2>
            <div>
              <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="e.g. 14th Floor, Sea Breeze Tower, Carter Road"
                className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  placeholder="e.g. 400050"
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="e.g. 45000000"
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Area (sq.ft) *</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => updateField("area", e.target.value)}
                  placeholder="e.g. 1850"
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Bedrooms</label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => updateField("bedrooms", e.target.value)}
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">N/A</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Bathrooms</label>
                <select
                  value={formData.bathrooms}
                  onChange={(e) => updateField("bathrooms", e.target.value)}
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">N/A</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Media</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {formData.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border bg-[hsl(var(--accent))]">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <label className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[hsl(var(--accent))]/50 transition-colors">
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-sm font-medium">Click to select images</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                PNG, JPG, GIF up to 5MB each.
              </p>
            </label>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Owner & Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Owner Name</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => updateField("ownerName", e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Owner Phone</label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => updateField("ownerPhone", e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Owner Email</label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => updateField("ownerEmail", e.target.value)}
                  placeholder="e.g. rajesh@example.com"
                  className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
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
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Create Property"}
          </button>
        )}
      </div>
    </div>
  );
}
