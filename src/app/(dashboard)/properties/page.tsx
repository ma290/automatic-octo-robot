"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useUIStore } from "@/store/ui-store";
import { cn, formatPrice, formatArea, statusColors, typeColors, capitalize, timeAgo } from "@/lib/utils";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Download,
  CheckSquare,
  Square,
  FolderKanban,
  ChevronRight as ArrowRight,
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
  city: string;
  state: string;
  address: string;
  createdAt: string;
  images: { url: string; caption: string | null }[];
  _count: { images: number; documents: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const propertyTypes = ["residential", "commercial", "rental", "resale", "plot"];
const propertyStatuses = ["available", "hold", "sold", "rented", "booked"];

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewMode, setViewMode, selectedProperties, togglePropertySelection, selectAllProperties, clearSelection } = useUIStore();

  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState<string | null>(null);

  // Cross-search state
  const [crossProjects, setCrossProjects] = useState<any[]>([]);
  const [crossProjectsLoading, setCrossProjectsLoading] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState(searchParams.get("type") || "");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");
  const [filterCity, setFilterCity] = useState("");
  const [filterBedrooms, setFilterBedrooms] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 300);
  const currentPage = parseInt(searchParams.get("page") || "1");

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filterType) params.set("type", filterType);
    if (filterStatus) params.set("status", filterStatus);
    if (filterCity) params.set("city", filterCity);
    if (filterBedrooms) params.set("bedrooms", filterBedrooms);
    if (filterMinPrice) params.set("minPrice", filterMinPrice);
    if (filterMaxPrice) params.set("maxPrice", filterMaxPrice);
    params.set("page", currentPage.toString());
    params.set("limit", "12");

    try {
      const res = await fetch(`/api/properties?${params}`);
      const data = await res.json();
      setProperties(data.properties);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterType, filterStatus, filterCity, filterBedrooms, filterMinPrice, filterMaxPrice, currentPage]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Cross-search: fetch projects when user types a query
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setCrossProjects([]);
      return;
    }
    setCrossProjectsLoading(true);
    fetch(`/api/projects?search=${encodeURIComponent(debouncedSearch)}`)
      .then((r) => r.json())
      .then((data) => setCrossProjects(data.projects || []))
      .catch(() => setCrossProjects([]))
      .finally(() => setCrossProjectsLoading(false));
  }, [debouncedSearch]);

  const activeFilterCount = [filterType, filterStatus, filterCity, filterBedrooms, filterMinPrice, filterMaxPrice].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilterType("");
    setFilterStatus("");
    setFilterCity("");
    setFilterBedrooms("");
    setFilterMinPrice("");
    setFilterMaxPrice("");
    setSearchQuery("");
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await fetch("/api/properties/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", ids: selectedProperties, status }),
      });
      clearSelection();
      fetchProperties();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedProperties.length} properties? This cannot be undone.`)) return;
    try {
      await fetch("/api/properties/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids: selectedProperties }),
      });
      clearSelection();
      fetchProperties();
    } catch (e) {
      console.error(e);
    }
  };

  const allSelected = properties.length > 0 && properties.every((p) => selectedProperties.includes(p.id));

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {pagination.total} properties in inventory
          </p>
        </div>
        <Link
          href="/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Property</span>
        </Link>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search properties by title, location, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-[hsl(var(--card))] text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors",
            showFilters || activeFilterCount > 0
              ? "bg-brand-500/10 border-brand-500/30 text-brand-500"
              : "bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="hidden sm:flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2.5 transition-colors",
              viewMode === "grid" ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2.5 transition-colors",
              viewMode === "list" ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-xl bg-[hsl(var(--card))] border p-4 space-y-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All Types</option>
                {propertyTypes.map((t) => (
                  <option key={t} value={t}>{capitalize(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All Statuses</option>
                {propertyStatuses.map((s) => (
                  <option key={s} value={s}>{capitalize(s)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">City</label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Bedrooms</label>
              <select
                value={filterBedrooms}
                onChange={(e) => setFilterBedrooms(e.target.value)}
                className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((b) => (
                  <option key={b} value={b}>{b} BHK</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Min Price</label>
              <input
                type="number"
                placeholder="₹ Min"
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Max Price</label>
              <input
                type="number"
                placeholder="₹ Max"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-xs text-brand-500 hover:text-brand-400 font-medium">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Cross-search: Projects results */}
      {debouncedSearch.length >= 2 && (crossProjectsLoading || crossProjects.length > 0) && (
        <div className="rounded-xl border bg-[hsl(var(--card))] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-semibold">Also found in Projects</span>
              {!crossProjectsLoading && (
                <span className="px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] font-bold">
                  {crossProjects.length}
                </span>
              )}
            </div>
            <Link href={`/projects?search=${encodeURIComponent(debouncedSearch)}`} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors">
              View all in Projects <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {crossProjectsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-[hsl(var(--accent))] animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {crossProjects.slice(0, 4).map((p: any) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-[hsl(var(--accent))] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate group-hover:text-brand-500 transition-colors">{p.name}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">{p.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bulk select row */}
      {properties.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => allSelected ? clearSelection() : selectAllProperties(properties.map((p) => p.id))}
            className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            {allSelected ? <CheckSquare className="w-4 h-4 text-brand-500" /> : <Square className="w-4 h-4" />}
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          {selectedProperties.length > 0 && (
            <span className="text-xs text-brand-500 font-medium">
              {selectedProperties.length} selected
            </span>
          )}
        </div>
      )}

      {/* Property Grid/List */}
      {loading ? (
        <div className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-3"
        )}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={cn(
              "rounded-xl bg-[hsl(var(--card))] animate-pulse",
              viewMode === "grid" ? "h-80" : "h-24"
            )} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3 opacity-50" />
          <h3 className="font-semibold text-lg">No properties found</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {activeFilterCount > 0 ? "Try adjusting your filters" : "Add your first property to get started"}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="mt-3 text-sm text-brand-500 hover:text-brand-400 font-medium">
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="group rounded-xl bg-[hsl(var(--card))] border overflow-hidden hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Image */}
              <div className="relative h-48 bg-[hsl(var(--accent))] overflow-hidden">
                {property.images[0] ? (
                  <img
                    src={property.images[0].url}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-[hsl(var(--muted-foreground))] opacity-30" />
                  </div>
                )}
                {/* Status badge */}
                <span className={cn(
                  "absolute top-3 left-3 px-2 py-1 rounded-md text-[11px] font-semibold border backdrop-blur-sm",
                  statusColors[property.status]
                )}>
                  {capitalize(property.status)}
                </span>
                {/* Select checkbox */}
                <button
                  onClick={(e) => { e.preventDefault(); togglePropertySelection(property.id); }}
                  className={cn(
                    "absolute top-3 right-3 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                    selectedProperties.includes(property.id)
                      ? "bg-brand-500 border-brand-500 text-white"
                      : "border-white/50 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                  )}
                >
                  {selectedProperties.includes(property.id) && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                {/* Type badge */}
                <span className={cn(
                  "absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium backdrop-blur-sm",
                  typeColors[property.type]
                )}>
                  {capitalize(property.type)} · {capitalize(property.subtype)}
                </span>
              </div>

              {/* Content */}
              <Link href={`/properties/${property.id}`} className="block p-4">
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-brand-500 transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{property.city}, {property.state}</span>
                </div>

                <div className="flex items-center gap-3 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    {formatArea(property.area)}
                  </span>
                  {property.bedrooms != null && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      {property.bedrooms} BHK
                    </span>
                  )}
                  {property.bathrooms != null && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3" />
                      {property.bathrooms}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <p className="text-lg font-bold text-brand-500">{formatPrice(property.price)}</p>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{timeAgo(property.createdAt)}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--card))] border hover:shadow-md transition-all group"
            >
              <button
                onClick={(e) => { e.preventDefault(); togglePropertySelection(property.id); }}
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  selectedProperties.includes(property.id)
                    ? "bg-brand-500 border-brand-500 text-white"
                    : "border-[hsl(var(--border))]"
                )}
              >
                {selectedProperties.includes(property.id) && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <div className="w-16 h-16 rounded-lg bg-[hsl(var(--accent))] overflow-hidden flex-shrink-0">
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
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{property.city}</span>
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", typeColors[property.type])}>
                    {capitalize(property.type)}
                  </span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                <span>{formatArea(property.area)}</span>
                {property.bedrooms != null && <span>{property.bedrooms} BHK</span>}
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-bold text-brand-500">{formatPrice(property.price)}</p>
                <span className={cn("inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border mt-1", statusColors[property.status])}>
                  {capitalize(property.status)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => router.push(`/properties?page=${currentPage - 1}`)}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg border bg-[hsl(var(--card))] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[...Array(pagination.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => router.push(`/properties?page=${i + 1}`)}
              className={cn(
                "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                currentPage === i + 1
                  ? "bg-brand-500 text-white"
                  : "bg-[hsl(var(--card))] border hover:bg-[hsl(var(--accent))]"
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => router.push(`/properties?page=${currentPage + 1}`)}
            disabled={currentPage >= pagination.totalPages}
            className="p-2 rounded-lg border bg-[hsl(var(--card))] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedProperties.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-2xl">
          <span className="text-sm font-medium">{selectedProperties.length} selected</span>
          <div className="w-px h-5 bg-current opacity-20" />
          <div className="relative">
            <button
              onClick={() => setShowBulkMenu(showBulkMenu ? null : "status")}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
            >
              Update Status
            </button>
            {showBulkMenu === "status" && (
              <div className="absolute bottom-full mb-2 left-0 bg-[hsl(var(--card))] border rounded-lg shadow-xl py-1 min-w-[140px] text-[hsl(var(--foreground))]">
                {propertyStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => { handleBulkStatusUpdate(s); setShowBulkMenu(null); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[hsl(var(--accent))] transition-colors flex items-center gap-2"
                  >
                    <span className={cn("w-2 h-2 rounded-full", statusColors[s].split(" ")[0]?.replace("/15", ""))} />
                    {capitalize(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
          <button
            onClick={clearSelection}
            className="ml-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-[hsl(var(--card))] rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-[hsl(var(--card))] animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  );
}
