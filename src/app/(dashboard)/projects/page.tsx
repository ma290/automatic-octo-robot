"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn, capitalize } from "@/lib/utils";
import { Search, FolderKanban, MapPin, Building2, ChevronRight } from "lucide-react";
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

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  upcoming: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
  completed: "bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/25",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const params = debouncedSearch ? `?search=${debouncedSearch}` : "";
    fetch(`/api/projects${params}`)
      .then((r) => r.json())
      .then((data) => setProjects(data.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {projects.length} developer projects
          </p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <span>Add Project</span>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-[hsl(var(--card))] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
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
                    <span>{project._count.towers} towers</span>
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
