"use client";

import { BarChart3, Construction } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Analytics and insights for your property inventory
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/20 flex items-center justify-center mb-6">
          <Construction className="w-10 h-10 text-brand-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md">
          We&apos;re building powerful analytics dashboards with property trends, 
          revenue forecasts, market comparisons, and more. Stay tuned!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 w-full max-w-2xl">
          {[
            { title: "Property Trends", desc: "Price movements over time across locations" },
            { title: "Revenue Analytics", desc: "Track sales, rentals, and commissions" },
            { title: "Market Insights", desc: "Compare performance across segments" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl bg-[hsl(var(--card))] border p-4 text-left opacity-60">
              <BarChart3 className="w-5 h-5 text-[hsl(var(--muted-foreground))] mb-2" />
              <h3 className="font-medium text-sm">{item.title}</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
