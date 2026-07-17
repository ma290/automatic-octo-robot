"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, capitalize } from "@/lib/utils";
import {
  ArrowLeft, Check, ChevronRight, Save, X, UploadCloud,
  Home, Building2, KeyRound, RefreshCw, Map, HelpCircle,
} from "lucide-react";

// ── Types & Constants ─────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { id: "residential", label: "Residential", icon: Home, desc: "Villa, Apartment, Penthouse, etc." },
  { id: "rental",      label: "Rental",      icon: KeyRound,   desc: "Properties for rent" },
  { id: "resale",      label: "Resale",      icon: RefreshCw,  desc: "Second-hand / resale properties" },
  { id: "commercial",  label: "Commercial",  icon: Building2,  desc: "Office, Shop, Warehouse, etc." },
  { id: "plot",        label: "Plot / Land", icon: Map,        desc: "Open plots and agricultural land" },
  { id: "other",       label: "Other",       icon: HelpCircle, desc: "Anything else" },
];

const TYPE_SUBTYPES: Record<string, string[]> = {
  residential: ["apartment", "villa", "penthouse", "studio", "rowhouse", "farmhouse", "independent_house"],
  rental:      ["apartment", "villa", "penthouse", "studio", "rowhouse", "farmhouse", "independent_house", "office", "shop"],
  resale:      ["apartment", "villa", "penthouse", "studio", "rowhouse", "farmhouse", "independent_house", "office", "shop", "warehouse"],
  commercial:  ["office", "shop", "warehouse", "showroom", "coworking", "industrial"],
  plot:        ["residential_plot", "commercial_plot", "agricultural_land", "farm_land"],
  other:       ["other"],
};

const TYPE_STATUSES: Record<string, string[]> = {
  residential: ["available", "hold", "sold", "booked"],
  rental:      ["available", "rented", "hold"],
  resale:      ["available", "sold", "hold"],
  commercial:  ["available", "hold", "sold", "booked"],
  plot:        ["available", "hold", "sold", "booked"],
  other:       ["available", "hold", "sold", "rented", "booked"],
};

const FACINGS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const POSSESSION = ["Ready to Move", "Under Construction", "Possession Within 3 Months", "Possession Within 6 Months", "Possession Within 1 Year", "Possession Within 2 Years"];
const AMENITIES_LIST = [
  "Lift", "Power Backup", "Security", "CCTV", "Swimming Pool", "Gymnasium", "Clubhouse",
  "Garden / Park", "Children's Play Area", "Fire Safety", "Visitor Parking", "Maintenance Staff",
  "Intercom", "Rain Water Harvesting", "Sewage Treatment", "Gas Pipeline",
];

const steps = [
  { id: 1, title: "Property Type",   description: "Category & subtype" },
  { id: 2, title: "Location",        description: "Address and city" },
  { id: 3, title: "Specifications",  description: "Area, rooms & details" },
  { id: 4, title: "Amenities",       description: "Facilities & extras" },
  { id: 5, title: "Media",           description: "Photos (optional)" },
  { id: 6, title: "Owner",           description: "Contact details" },
];

// ── Form Component ─────────────────────────────────────────────────────────────

const labelCls = "text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block";
const inputCls = "w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500";
const selectCls = "w-full rounded-lg border bg-[hsl(var(--card))] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20";

const ToggleChip = ({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
      active
        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
        : "bg-transparent border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
    )}
  >
    {label}
  </button>
);

const Toggle = ({
  label, value, onChange,
}: { label: string; value: boolean | null; onChange: (v: boolean) => void }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <div
      onClick={() => onChange(!value)}
      className={cn(
        "w-10 h-6 rounded-full relative transition-colors duration-200 cursor-pointer",
        value ? "bg-brand-500" : "bg-[hsl(var(--accent))]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
          value ? "translate-x-4" : "translate-x-0"
        )}
      />
    </div>
    <span className="text-sm font-medium">{label}</span>
  </label>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function NewPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    // Basic
    title: "",
    description: "",
    type: "residential",
    subtype: "apartment",
    status: "available",
    customType: "",
    // Location
    address: "",
    city: "",
    state: "",
    pincode: "",
    // Core specs
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    // Extended specs
    furnished: "Unfurnished",
    kitchen: false as boolean | null,
    attachedBathrooms: "",
    balconies: "",
    parking: "",
    facing: "",
    floor: "",
    totalFloors: "",
    age: "",
    possessionStatus: "",
    availableFrom: "",
    // Plot / commercial extras
    isCorner: false as boolean | null,
    mainRoadFacing: false as boolean | null,
    boundaryWall: false as boolean | null,
    // Amenities
    amenities: [] as string[],
    customAmenities: "",
    // Owner
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    // Media
    images: [] as string[],
  });

  const update = (field: string, value: unknown) => {
    setFormData((prev) => {
      const next: Record<string, unknown> = { ...prev, [field]: value };
      if (field === "type") {
        const sub = TYPE_SUBTYPES[value as string] || [];
        const sta = TYPE_STATUSES[value as string] || [];
        if (!sub.includes(next.subtype as string)) next.subtype = sub[0] || "";
        if (!sta.includes(next.status as string)) next.status = sta[0] || "";
      }
      return next as typeof formData;
    });
  };

  const toggleAmenity = (a: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setFormData((prev) => ({ ...prev, images: [...prev.images, ev.target!.result as string] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i: number) =>
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.title.length >= 3 && !!formData.type && !!formData.subtype;
      case 2: return formData.address.length >= 5 && formData.city.length >= 2 && formData.state.length >= 2;
      case 3: return parseFloat(formData.price) > 0 && parseFloat(formData.area) > 0;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const allAmenities = [
        ...formData.amenities,
        ...(formData.customAmenities ? formData.customAmenities.split(",").map((s) => s.trim()).filter(Boolean) : []),
      ];

      // Determine type: allow custom type for "other"
      const finalType = formData.type === "other" && formData.customType
        ? formData.customType.toLowerCase()
        : formData.type;

      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        type: finalType,
        subtype: formData.subtype,
        status: formData.status,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode || undefined,
        ownerName: formData.ownerName || undefined,
        ownerPhone: formData.ownerPhone || undefined,
        ownerEmail: formData.ownerEmail || undefined,
        images: formData.images,
        // Extended
        furnished: formData.furnished || null,
        kitchen: formData.kitchen,
        attachedBathrooms: formData.attachedBathrooms ? parseInt(formData.attachedBathrooms) : null,
        balconies: formData.balconies ? parseInt(formData.balconies) : null,
        parking: formData.parking ? parseInt(formData.parking) : null,
        facing: formData.facing || null,
        floor: formData.floor ? parseInt(formData.floor) : null,
        totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
        age: formData.age ? parseInt(formData.age) : null,
        possessionStatus: formData.possessionStatus || null,
        availableFrom: formData.availableFrom || null,
        isCorner: formData.isCorner,
        mainRoadFacing: formData.mainRoadFacing,
        boundaryWall: formData.boundaryWall,
        amenities: allAmenities.length > 0 ? allAmenities.join(", ") : null,
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const property = await res.json();
        router.push(`/properties/${property.id}`);
      } else {
        const err = await res.json();
        console.error("Save error:", err);
        alert("Failed to save property. Please check all required fields.");
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  // Derived helpers
  const isResidentialLike = ["residential", "rental", "resale"].includes(formData.type);
  const isRental = formData.type === "rental";
  const isResale = formData.type === "resale";
  const isCommercial = formData.type === "commercial";
  const isPlot = formData.type === "plot";
  const hasRooms = isResidentialLike || (isCommercial && ["office", "coworking"].includes(formData.subtype));

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
      <div className="flex items-center gap-1">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-1 flex-1">
            <button
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all",
                step.id < currentStep ? "bg-emerald-500 text-white cursor-pointer" :
                step.id === currentStep ? "bg-brand-500 text-white" :
                "bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]"
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

      {/* Form Card */}
      <div className="rounded-xl bg-[hsl(var(--card))] border p-6">

        {/* ── STEP 1: Type & Basic Info ───────────────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-base">Basic Information</h2>

            {/* Property Title */}
            <div>
              <label className={labelCls}>Property Title *</label>
              <input type="text" value={formData.title} onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Luxurious 3BHK Apartment in Bandra West"
                className={inputCls} />
            </div>

            {/* Type Grid */}
            <div>
              <label className={labelCls}>Property Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => update("type", id)}
                    className={cn(
                      "flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all",
                      formData.type === id
                        ? "border-brand-500 bg-brand-500/5"
                        : "border-[hsl(var(--border))] hover:border-brand-500/40 hover:bg-[hsl(var(--accent))]"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mb-2", formData.type === id ? "text-brand-500" : "text-[hsl(var(--muted-foreground))]")} />
                    <span className="font-semibold text-sm">{label}</span>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 leading-tight">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom type if "other" */}
            {formData.type === "other" && (
              <div>
                <label className={labelCls}>Specify Category *</label>
                <input type="text" value={formData.customType} onChange={(e) => update("customType", e.target.value)}
                  placeholder="e.g. Co-living, Student Housing..." className={inputCls} />
              </div>
            )}

            {/* Subtype & Status row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Sub-type *</label>
                <select value={formData.subtype} onChange={(e) => update("subtype", e.target.value)} className={selectCls}>
                  {(TYPE_SUBTYPES[formData.type] || []).map((s) => (
                    <option key={s} value={s}>{capitalize(s.replace(/_/g, " "))}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Listing Status</label>
                <select value={formData.status} onChange={(e) => update("status", e.target.value)} className={selectCls}>
                  {(TYPE_STATUSES[formData.type] || []).map((s) => (
                    <option key={s} value={s}>{capitalize(s)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={formData.description} onChange={(e) => update("description", e.target.value)}
                placeholder="Describe the property — highlights, nearby landmarks, any special features..." rows={4}
                className={cn(inputCls, "resize-none")} />
            </div>
          </div>
        )}

        {/* ── STEP 2: Location ────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-base">Location Details</h2>
            <div>
              <label className={labelCls}>Full Address *</label>
              <input type="text" value={formData.address} onChange={(e) => update("address", e.target.value)}
                placeholder="e.g. Flat 14B, Sea Breeze Tower, Carter Road" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>City *</label>
                <input type="text" value={formData.city} onChange={(e) => update("city", e.target.value)}
                  placeholder="e.g. Mumbai" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State *</label>
                <input type="text" value={formData.state} onChange={(e) => update("state", e.target.value)}
                  placeholder="e.g. Maharashtra" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Pincode</label>
                <input type="text" value={formData.pincode} onChange={(e) => update("pincode", e.target.value)}
                  placeholder="e.g. 400050" className={inputCls} />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Specifications ──────────────────────────────────── */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-base">Property Specifications</h2>

            {/* Price & Area — always */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{isRental ? "Monthly Rent (₹) *" : "Price (₹) *"}</label>
                <input type="number" value={formData.price} onChange={(e) => update("price", e.target.value)}
                  placeholder={isRental ? "e.g. 35000" : "e.g. 45000000"} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Built-up / Super Area (sq.ft) *</label>
                <input type="number" value={formData.area} onChange={(e) => update("area", e.target.value)}
                  placeholder="e.g. 1850" className={inputCls} />
              </div>
            </div>

            {/* Rooms — residential & some commercial */}
            {hasRooms && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className={labelCls}>Bedrooms (BHK)</label>
                  <select value={formData.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} className={selectCls}>
                    <option value="">N/A</option>
                    {["1", "2", "3", "4", "5", "6", "7+"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Bathrooms</label>
                  <select value={formData.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} className={selectCls}>
                    <option value="">N/A</option>
                    {["1", "2", "3", "4", "5", "6"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Attached Bathrooms</label>
                  <select value={formData.attachedBathrooms} onChange={(e) => update("attachedBathrooms", e.target.value)} className={selectCls}>
                    <option value="">N/A</option>
                    {["0", "1", "2", "3", "4"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Balconies</label>
                  <select value={formData.balconies} onChange={(e) => update("balconies", e.target.value)} className={selectCls}>
                    <option value="">N/A</option>
                    {["0", "1", "2", "3", "4"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Furnished & Kitchen — residential-like */}
            {isResidentialLike && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Furnished Status</label>
                  <select value={formData.furnished} onChange={(e) => update("furnished", e.target.value)} className={selectCls}>
                    {["Unfurnished", "Semi-Furnished", "Fully Furnished"].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col justify-center">
                  <label className={labelCls}>Kitchen</label>
                  <Toggle label="Has Kitchen" value={formData.kitchen} onChange={(v) => update("kitchen", v)} />
                </div>
              </div>
            )}

            {/* Parking */}
            {!isPlot && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Covered Parking Slots</label>
                  <select value={formData.parking} onChange={(e) => update("parking", e.target.value)} className={selectCls}>
                    <option value="">None</option>
                    {["1", "2", "3", "4"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Floor details — residential & commercial */}
            {!isPlot && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Property Floor No.</label>
                  <input type="number" value={formData.floor} onChange={(e) => update("floor", e.target.value)}
                    placeholder="e.g. 5" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Total Floors in Building</label>
                  <input type="number" value={formData.totalFloors} onChange={(e) => update("totalFloors", e.target.value)}
                    placeholder="e.g. 20" className={inputCls} />
                </div>
              </div>
            )}

            {/* Facing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Facing Direction</label>
                <select value={formData.facing} onChange={(e) => update("facing", e.target.value)} className={selectCls}>
                  <option value="">Not specified</option>
                  {FACINGS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Age / Possession */}
              {isResale && (
                <div>
                  <label className={labelCls}>Age of Property (years)</label>
                  <input type="number" value={formData.age} onChange={(e) => update("age", e.target.value)}
                    placeholder="e.g. 5" className={inputCls} />
                </div>
              )}

              {(isResidentialLike && !isResale) && (
                <div>
                  <label className={labelCls}>Possession Status</label>
                  <select value={formData.possessionStatus} onChange={(e) => update("possessionStatus", e.target.value)} className={selectCls}>
                    <option value="">Select...</option>
                    {POSSESSION.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Rental availability date */}
            {isRental && (
              <div>
                <label className={labelCls}>Available From</label>
                <input type="date" value={formData.availableFrom} onChange={(e) => update("availableFrom", e.target.value)}
                  className={inputCls} />
              </div>
            )}

            {/* Plot-specific toggles */}
            {isPlot && (
              <div className="space-y-3 rounded-xl bg-[hsl(var(--accent))]/30 p-4 border">
                <p className="text-sm font-semibold mb-2">Plot Details</p>
                <Toggle label="Corner Plot" value={formData.isCorner} onChange={(v) => update("isCorner", v)} />
                <Toggle label="Main Road Facing" value={formData.mainRoadFacing} onChange={(v) => update("mainRoadFacing", v)} />
                <Toggle label="Boundary Wall Present" value={formData.boundaryWall} onChange={(v) => update("boundaryWall", v)} />
              </div>
            )}

            {/* Commercial-specific toggles */}
            {isCommercial && (
              <div className="space-y-3 rounded-xl bg-[hsl(var(--accent))]/30 p-4 border">
                <p className="text-sm font-semibold mb-2">Commercial Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Furnishing Status</label>
                    <select value={formData.furnished} onChange={(e) => update("furnished", e.target.value)} className={selectCls}>
                      {["Bare Shell", "Warm Shell", "Fully Fitted", "Plug & Play"].map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 mt-2">
                  <Toggle label="Main Road Facing" value={formData.mainRoadFacing} onChange={(v) => update("mainRoadFacing", v)} />
                  <Toggle label="Pantry / Kitchen Area" value={formData.kitchen} onChange={(v) => update("kitchen", v)} />
                  <Toggle label="Corner Unit" value={formData.isCorner} onChange={(v) => update("isCorner", v)} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Amenities ───────────────────────────────────────── */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-base">Amenities & Facilities</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Select all amenities available in this property or its complex.</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map((a) => (
                <ToggleChip key={a} label={a} active={formData.amenities.includes(a)} onClick={() => toggleAmenity(a)} />
              ))}
            </div>
            <div>
              <label className={labelCls}>Additional Amenities (comma-separated)</label>
              <input type="text" value={formData.customAmenities} onChange={(e) => update("customAmenities", e.target.value)}
                placeholder="e.g. Rooftop Terrace, Concierge, Wine Cellar" className={inputCls} />
            </div>
          </div>
        )}

        {/* ── STEP 5: Media ───────────────────────────────────────────── */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-base">Property Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border bg-[hsl(var(--accent))]">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
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
              <p className="text-sm font-medium">Click to upload photos</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">PNG, JPG, GIF up to 5MB each</p>
            </label>
          </div>
        )}

        {/* ── STEP 6: Owner ───────────────────────────────────────────── */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-base">Owner / Seller Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Owner / Seller Name</label>
                <input type="text" value={formData.ownerName} onChange={(e) => update("ownerName", e.target.value)}
                  placeholder="e.g. Rajesh Sharma" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input type="tel" value={formData.ownerPhone} onChange={(e) => update("ownerPhone", e.target.value)}
                  placeholder="e.g. 9876543210" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Email Address</label>
                <input type="email" value={formData.ownerEmail} onChange={(e) => update("ownerEmail", e.target.value)}
                  placeholder="e.g. rajesh@example.com" className={inputCls} />
              </div>
            </div>
            <div className="rounded-xl bg-[hsl(var(--accent))]/30 border p-4 text-sm text-[hsl(var(--muted-foreground))]">
              ℹ️ Owner contact is saved for internal reference. You can also link an existing contact from the Owners section later.
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
            Next <ChevronRight className="w-4 h-4" />
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
