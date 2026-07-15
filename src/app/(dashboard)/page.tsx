"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  FolderKanban,
  Users,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Home,
  ShoppingBag,
  Key,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { cn, formatPrice, statusColors, typeColors, capitalize, timeAgo } from "@/lib/utils";

interface Stats {
  totalProperties: number;
  available: number;
  sold: number;
  rented: number;
  hold: number;
  booked: number;
  totalProjects: number;
  totalOwners: number;
  propertiesByType: { type: string; _count: number }[];
  recentProperties: {
    id: string;
    title: string;
    price: number;
    type: string;
    status: string;
    city: string;
    createdAt: string;
    images: { url: string }[];
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-[hsl(var(--card))] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const summaryCards = [
    {
      label: "Total Properties",
      value: stats.totalProperties,
      icon: Building2,
      gradient: "from-blue-500 to-indigo-600",
      href: "/properties",
    },
    {
      label: "Available",
      value: stats.available,
      icon: Home,
      gradient: "from-emerald-500 to-teal-600",
      href: "/properties?status=available",
    },
    {
      label: "Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      gradient: "from-violet-500 to-purple-600",
      href: "/projects",
    },
    {
      label: "Owners",
      value: stats.totalOwners,
      icon: Users,
      gradient: "from-amber-500 to-orange-600",
      href: "/owners",
    },
  ];

  const statusCards = [
    { label: "Sold", value: stats.sold, color: "text-red-500", icon: ShoppingBag },
    { label: "Rented", value: stats.rented, color: "text-blue-500", icon: Key },
    { label: "On Hold", value: stats.hold, color: "text-amber-500", icon: RefreshCw },
    { label: "Booked", value: stats.booked, color: "text-purple-500", icon: TrendingUp },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
            Welcome back! Here&apos;s your property inventory overview.
          </p>
        </div>
        <Link
          href="/properties/new"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {summaryCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative overflow-hidden rounded-xl bg-[hsl(var(--card))] border p-4 lg:p-5 hover:shadow-lg transition-all duration-300"
          >
            <div className={cn("absolute inset-0 opacity-5 bg-gradient-to-br", card.gradient)} />
            <div className="relative">
              <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3", card.gradient)}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold">{card.value}</p>
              <p className="text-xs lg:text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                {card.label}
              </p>
            </div>
            <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Status breakdown */}
        <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
          <h2 className="font-semibold text-sm mb-4">Status Breakdown</h2>
          <div className="grid grid-cols-2 gap-3">
            {statusCards.map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--accent))]">
                <item.icon className={cn("w-4 h-4", item.color)} />
                <div>
                  <p className="text-lg font-bold">{item.value}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Type */}
        <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
          <h2 className="font-semibold text-sm mb-4">Properties by Type</h2>
          <div className="space-y-3">
            {stats.propertiesByType.map(({ type, _count }) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", typeColors[type])}>
                    {capitalize(type)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-[hsl(var(--accent))] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
                      style={{ width: `${((_count / stats.totalProperties) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-6 text-right">{_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
          <h2 className="font-semibold text-sm mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Add New Property", href: "/properties/new", icon: Plus, desc: "List a new property" },
              { label: "View All Properties", href: "/properties", icon: Building2, desc: "Browse inventory" },
              { label: "View Projects", href: "/projects", icon: FolderKanban, desc: "Manage developments" },
              { label: "Manage Owners", href: "/owners", icon: Users, desc: "Owner directory" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors group"
              >
                <div className="w-8 h-8 rounded-md bg-[hsl(var(--accent))] group-hover:bg-[hsl(var(--card))] flex items-center justify-center transition-colors">
                  <action.icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Recent Properties</h2>
          <Link href="/properties" className="text-xs text-brand-500 hover:text-brand-400 font-medium">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {stats.recentProperties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-[hsl(var(--accent))] overflow-hidden flex-shrink-0">
                {property.images[0] ? (
                  <img
                    src={property.images[0].url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{property.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{property.city}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold">{formatPrice(property.price)}</p>
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
