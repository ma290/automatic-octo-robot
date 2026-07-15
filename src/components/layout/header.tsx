"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell, Search, Loader2, Building2, FolderKanban } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchResult {
  properties: any[];
  projects: any[];
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult>({ properties: [], projects: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setIsOpen(true);
        })
        .finally(() => setLoading(false));
    } else {
      setResults({ properties: [], projects: [] });
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  return (
    <header className="h-16 border-b bg-[hsl(var(--card))] flex items-center justify-between px-4 lg:px-6 relative z-50">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <span className="text-white font-bold text-sm">E+</span>
        </div>
        <span className="font-semibold text-sm">Estate Plus</span>
      </div>

      <div className="hidden lg:flex flex-1 max-w-md mx-8" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search properties and projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.properties.length > 0 || results.projects.length > 0) {
                setIsOpen(true);
              }
            }}
            className="w-full pl-9 pr-10 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[hsl(var(--muted-foreground))]" />
          )}
          
          {isOpen && (results.properties.length > 0 || results.projects.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[hsl(var(--card))] border rounded-lg shadow-lg overflow-hidden z-50">
              <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
                {results.properties.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))] px-2 mb-2">Properties</h3>
                    <div className="space-y-1">
                      {results.properties.map((prop) => (
                        <Link
                          key={prop.id}
                          href={`/properties/${prop.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-[hsl(var(--accent))] transition-colors"
                        >
                          <div className="mt-0.5 p-1.5 bg-brand-500/10 rounded-md">
                            <Building2 className="w-4 h-4 text-brand-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{prop.title}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{prop.city} • {prop.type}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {results.projects.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))] px-2 mb-2">Projects</h3>
                    <div className="space-y-1">
                      {results.projects.map((proj) => (
                        <Link
                          key={proj.id}
                          href={`/projects/${proj.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-[hsl(var(--accent))] transition-colors"
                        >
                          <div className="mt-0.5 p-1.5 bg-violet-500/10 rounded-md">
                            <FolderKanban className="w-4 h-4 text-violet-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{proj.name}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{proj.location} • {proj.builder}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
        >
          <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center ml-1">
          <span className="text-white text-xs font-semibold">AM</span>
        </div>
      </div>
    </header>
  );
}
