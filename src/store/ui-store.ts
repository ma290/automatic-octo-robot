"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Property listing view
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Bulk selection
  selectedProperties: string[];
  togglePropertySelection: (id: string) => void;
  selectAllProperties: (ids: string[]) => void;
  clearSelection: () => void;

  // Mobile nav
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // View mode
      viewMode: "grid",
      setViewMode: (mode) => set({ viewMode: mode }),

      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Bulk selection
      selectedProperties: [],
      togglePropertySelection: (id) =>
        set((s) => ({
          selectedProperties: s.selectedProperties.includes(id)
            ? s.selectedProperties.filter((p) => p !== id)
            : [...s.selectedProperties, id],
        })),
      selectAllProperties: (ids) => set({ selectedProperties: ids }),
      clearSelection: () => set({ selectedProperties: [] }),

      // Mobile nav
      mobileNavOpen: false,
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    }),
    {
      name: "estate-plus-ui",
      partialize: (state) => ({
        viewMode: state.viewMode,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
