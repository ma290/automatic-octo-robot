"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn, capitalize } from "@/lib/utils";
import { Search, Users, Phone, Mail, Building2, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface Owner {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  type: string;
  notes: string | null;
  _count: { properties: number };
}

const typeColors: Record<string, string> = {
  individual: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  builder: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  developer: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const params = debouncedSearch ? `?search=${debouncedSearch}` : "";
    fetch(`/api/owners${params}`)
      .then((r) => r.json())
      .then((data) => setOwners(data.owners))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Owners</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {owners.length} owner{owners.length !== 1 ? "s" : ""} in directory
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-[hsl(var(--card))] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {owners.map((owner) => (
            <Link
              key={owner.id}
              href={`/owners/${owner.id}`}
              className="group rounded-xl bg-[hsl(var(--card))] border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">{owner.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-brand-500 transition-colors truncate">
                    {owner.name}
                  </h3>
                  {owner.company && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{owner.company}</p>
                  )}
                  <span className={cn("inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium", typeColors[owner.type])}>
                    {capitalize(owner.type)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <Phone className="w-3 h-3" />
                  {owner.phone}
                </div>
                {owner.email && (
                  <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{owner.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <Building2 className="w-3 h-3" />
                    {owner._count.properties} propert{owner._count.properties !== 1 ? "ies" : "y"}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
