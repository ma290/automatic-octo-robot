"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn, capitalize } from "@/lib/utils";
import {
  Search,
  FolderKanban,
  MapPin,
  Building2,
  ChevronRight,
  Filter,
  X,
  Plus,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface Project {
  id: string;
  name: string;
  builder: string;
  description: string | null;
  location: string;
  status: string;
  totalUnits: number;
  availableUnits: number;
  unitStats: { status: string; _count: number }[];
  _count: { towers: number };
}

interface CrossProperty {
  id: string;
  title: string;
  type: string;
  status: string;
  price: number;
  city: string;
  state: string;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  upcoming: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
  completed: "bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/25",
};

const projectStatuses = ["active", "upcoming", "completed"];

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");

  // Cross-search state
  const [crossProperties, setCrossProperties] = useState<CrossProperty[]>([]);
  const [crossPropertiesLoading, setCrossPropertiesLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch projects
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    fetch(`/api/projects?${params}`)
      .then((r) => r.json())
      .then((data) => setProjects(data.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  // Cross-search: fetch properties when user types a query
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setCrossProperties([]);
      return;
    }
    setCrossPropertiesLoading(true);
    fetch(`/api/properties?search=${encodeURIComponent(debouncedSearch)}&limit=4`)
      .then((r) => r.json())
      .then((data) => setCrossProperties(data.properties || []))
      .catch(() => setCrossProperties([]))
      .finally(() => setCrossPropertiesLoading(false));
  }, [debouncedSearch]);

  const filteredProjects = filterStatus
    ? projects.filter((p) => p.status === filterStatus)
    : projects;

  const activeFilterCount = [filterStatus].filter(Boolean).length;

  const clearFilters = () => {
    setFilterStatus("");
    setSearchQuery("");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {filteredProjects.length} developer project{filteredProjects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Project</span>
        </Link>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search projects by name, builder, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border bg-[hsl(var(--card))] text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
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
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-xl bg-[hsl(var(--card))] border p-4 space-y-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All Statuses</option>
                {projectStatuses.map((s) => (
                  <option key={s} value={s}>{capitalize(s)}</option>
                ))}
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-brand-500 hover:text-brand-400 font-medium">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Cross-search: Properties results */}
      {debouncedSearch.length >= 2 && (crossPropertiesLoading || crossProperties.length > 0) && (
        <div className="rounded-xl border bg-[hsl(var(--card))] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold">Also found in Properties</span>
              {!crossPropertiesLoading && (
                <span className="px-1.5 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[11px] font-bold">
                  {crossProperties.length}
                </span>
              )}
            </div>
            <Link
              href={`/properties?search=${encodeURIComponent(debouncedSearch)}`}
              className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors"
            >
              View all in Properties <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {crossPropertiesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-[hsl(var(--accent))] animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {crossProperties.map((p) => (
                <Link
                  key={p.id}
                  href={`/properties/${p.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-[hsl(var(--accent))] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate group-hover:text-brand-500 transition-colors">{p.title}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">{p.city}, {p.state}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-[hsl(var(--card))] animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3 opacity-50" />
          <h3 className="font-semibold text-lg">No projects found</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {activeFilterCount > 0 || searchQuery ? "Try adjusting your search or filters" : "Add your first project to get started"}
          </p>
          {(activeFilterCount > 0 || searchQuery) && (
            <button onClick={clearFilters} className="mt-3 text-sm text-brand-500 hover:text-brand-400 font-medium">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const availabilityPct = project.totalUnits > 0
              ? Math.round((project.availableUnits / project.totalUnits) * 100)
              : 0;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-xl bg-[hsl(var(--card))] border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-white" />
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold border", statusColors[project.status])}>
                    {capitalize(project.status)}
                  </span>
                </div>

                <h3 className="font-semibold text-base group-hover:text-brand-500 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{project.builder}</p>

                <div className="flex items-center gap-1.5 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <MapPin className="w-3 h-3" />
                  {project.location}
                </div>

                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">Availability</span>
                    <span className="font-medium">{project.availableUnits}/{project.totalUnits} units</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[hsl(var(--accent))] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                      style={{ width: `${availabilityPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                    <span>{project._count.towers} tower{project._count.towers !== 1 ? "s" : ""}</span>
                    <span className="flex items-center gap-1 group-hover:text-brand-500 transition-colors">
                      View Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-[hsl(var(--card))] rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-[hsl(var(--card))] animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
