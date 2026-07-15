"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatPrice, statusColors, capitalize } from "@/lib/utils";
import { ArrowLeft, Phone, Mail, Building2, User, MapPin } from "lucide-react";

interface Owner {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  type: string;
  notes: string | null;
  createdAt: string;
  properties: {
    id: string;
    title: string;
    price: number;
    type: string;
    status: string;
    city: string;
    images: { url: string }[];
  }[];
}

export default function OwnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/owners/${id}`)
      .then((r) => r.json())
      .then(setOwner)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-6"><div className="h-96 rounded-xl bg-[hsl(var(--card))] animate-pulse" /></div>;
  }

  if (!owner) return null;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="rounded-xl bg-[hsl(var(--card))] border p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">{owner.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">{owner.name}</h1>
            {owner.company && <p className="text-sm text-[hsl(var(--muted-foreground))]">{owner.company}</p>}
            <span className="inline-block mt-2 px-2.5 py-1 rounded-md text-xs font-medium bg-[hsl(var(--accent))]">
              {capitalize(owner.type)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <a href={`tel:${owner.phone}`} className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/80 transition-colors">
            <Phone className="w-5 h-5 text-brand-500" />
            <div>
              <p className="text-sm font-medium">{owner.phone}</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Phone</p>
            </div>
          </a>
          {owner.email && (
            <a href={`mailto:${owner.email}`} className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/80 transition-colors">
              <Mail className="w-5 h-5 text-brand-500" />
              <div>
                <p className="text-sm font-medium truncate">{owner.email}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Email</p>
              </div>
            </a>
          )}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--accent))]">
            <Building2 className="w-5 h-5 text-brand-500" />
            <div>
              <p className="text-sm font-medium">{owner.properties.length}</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Properties</p>
            </div>
          </div>
        </div>

        {owner.notes && (
          <div className="mt-4 p-3 rounded-lg bg-[hsl(var(--accent))]">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Notes</p>
            <p className="text-sm">{owner.notes}</p>
          </div>
        )}
      </div>

      {/* Owned Properties */}
      <div>
        <h2 className="font-semibold text-sm mb-3">Owned Properties ({owner.properties.length})</h2>
        <div className="space-y-2">
          {owner.properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--card))] border hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-lg bg-[hsl(var(--accent))] overflow-hidden flex-shrink-0">
                {property.images[0] ? (
                  <img src={property.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[hsl(var(--muted-foreground))] opacity-30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate group-hover:text-brand-500 transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{property.city}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm">{formatPrice(property.price)}</p>
                <span className={cn("inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border mt-1", statusColors[property.status])}>
                  {capitalize(property.status)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
