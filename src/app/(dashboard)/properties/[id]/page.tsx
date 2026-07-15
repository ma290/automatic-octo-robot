"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatPrice, formatArea, statusColors, typeColors, capitalize } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Phone,
  Mail,
  User,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  IndianRupee,
  Building2,
  Tag,
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  description: string | null;
  type: string;
  subtype: string;
  status: string;
  price: number;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string;
  city: string;
  state: string;
  pincode: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  ownerEmail: string | null;
  createdAt: string;
  updatedAt: string;
  images: { id: string; url: string; caption: string | null }[];
  documents: { id: string; name: string; url: string; type: string }[];
  priceHistory: { id: string; price: number; date: string; note: string | null }[];
  timeline: { id: string; title: string; description: string | null; date: string; type: string }[];
  owner: { id: string; name: string; email: string | null; phone: string; company: string | null } | null;
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then(setProperty)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: string) => {
    try {
      await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const res = await fetch(`/api/properties/${id}`);
      setProperty(await res.json());
      setShowStatusMenu(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      await fetch(`/api/properties/${id}`, { method: "DELETE" });
      router.push("/properties");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-[hsl(var(--card))] rounded animate-pulse" />
        <div className="h-80 bg-[hsl(var(--card))] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6 text-center py-20">
        <h2 className="text-xl font-semibold">Property not found</h2>
        <Link href="/properties" className="text-brand-500 text-sm mt-2 block">← Back to properties</Link>
      </div>
    );
  }

  const timelineIcons: Record<string, string> = {
    created: "🏠",
    status_change: "🔄",
    price_change: "💰",
    document_added: "📄",
    visit: "👁",
    note: "📝",
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors", statusColors[property.status])}
            >
              {capitalize(property.status)} ▾
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[hsl(var(--card))] border rounded-lg shadow-xl py-1 min-w-[130px] z-10">
                {["available", "hold", "sold", "rented", "booked"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[hsl(var(--accent))] transition-colors"
                  >
                    {capitalize(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link
            href={`/properties/${id}/edit`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="rounded-xl overflow-hidden bg-[hsl(var(--card))] border">
            <div className="relative h-64 sm:h-80 lg:h-96 bg-[hsl(var(--accent))]">
              {property.images.length > 0 ? (
                <>
                  <img
                    src={property.images[currentImage].url}
                    alt={property.images[currentImage].caption || property.title}
                    className="w-full h-full object-cover"
                  />
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImage((p) => (p > 0 ? p - 1 : property.images.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImage((p) => (p < property.images.length - 1 ? p + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                        {property.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImage(i)}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              i === currentImage ? "bg-white w-6" : "bg-white/50"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-[hsl(var(--muted-foreground))] opacity-20" />
                </div>
              )}
            </div>
            {property.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {property.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(i)}
                    className={cn(
                      "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                      i === currentImage ? "border-brand-500" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
            <h1 className="text-xl lg:text-2xl font-bold">{property.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                {property.address}, {property.city}, {property.state} {property.pincode}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className={cn("px-2.5 py-1 rounded-md text-xs font-medium", typeColors[property.type])}>
                {capitalize(property.type)}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[hsl(var(--accent))]">
                {capitalize(property.subtype)}
              </span>
            </div>

            {property.description && (
              <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {property.description}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">{formatPrice(property.price)}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Price</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center">
                  <Maximize2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">{formatArea(property.area)}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Area</p>
                </div>
              </div>
              {property.bedrooms != null && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center">
                    <Bed className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{property.bedrooms}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Bedrooms</p>
                  </div>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center">
                    <Bath className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{property.bathrooms}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Bathrooms</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price History Chart */}
          {property.priceHistory.length > 1 && (
            <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Price History
              </h2>
              <div className="space-y-2">
                {property.priceHistory.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-3 text-sm">
                    <span className="text-xs text-[hsl(var(--muted-foreground))] w-24 flex-shrink-0">
                      {new Date(entry.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-[hsl(var(--accent))] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                        style={{ width: `${(entry.price / property.price) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium w-20 text-right">{formatPrice(entry.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {property.documents.length > 0 && (
            <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents
              </h2>
              <div className="space-y-2">
                {property.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--accent))]">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{capitalize(doc.type.replace(/_/g, " "))}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-[hsl(var(--card))] transition-colors">
                      <Download className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Owner Info */}
          <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Owner Information
            </h2>
            <div className="space-y-3">
              {property.ownerName && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {property.ownerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{property.ownerName}</p>
                    {property.owner?.company && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{property.owner.company}</p>
                    )}
                  </div>
                </div>
              )}
              {property.ownerPhone && (
                <a href={`tel:${property.ownerPhone}`} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  <Phone className="w-4 h-4" />
                  {property.ownerPhone}
                </a>
              )}
              {property.ownerEmail && (
                <a href={`mailto:${property.ownerEmail}`} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  <Mail className="w-4 h-4" />
                  {property.ownerEmail}
                </a>
              )}
              {property.owner && (
                <Link
                  href={`/owners/${property.owner.id}`}
                  className="block mt-2 text-xs text-brand-500 hover:text-brand-400 font-medium"
                >
                  View Owner Profile →
                </Link>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Activity Timeline
            </h2>
            <div className="space-y-4">
              {property.timeline.map((event, i) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-base">{timelineIcons[event.type] || "📌"}</span>
                    {i < property.timeline.length - 1 && (
                      <div className="w-px h-full bg-[hsl(var(--border))] mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{event.description}</p>
                    )}
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
            <h2 className="font-semibold text-sm mb-3">Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Listed</span>
                <span>{new Date(property.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Updated</span>
                <span>{new Date(property.updatedAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Images</span>
                <span>{property.images.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Documents</span>
                <span>{property.documents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">ID</span>
                <span className="font-mono text-xs">{property.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
