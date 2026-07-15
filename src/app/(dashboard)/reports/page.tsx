"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { IndianRupee, Building2, TrendingUp, Users } from "lucide-react";

interface ReportsData {
  kpis: {
    totalInventoryValue: number;
    totalRevenue: number;
    totalUnitsSold: number;
    availableUnits: number;
  };
  statusDistribution: { name: string; value: number; color: string }[];
  revenueTrends: { month: string; revenue: number; collections: number }[];
  executivePerformance: { name: string; sales: number }[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[hsl(var(--card))] rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-[hsl(var(--card))] rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-[hsl(var(--card))] rounded-xl" />
          <div className="h-80 bg-[hsl(var(--card))] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6">Failed to load reports data.</div>;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Key insights and performance metrics for your inventory
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-[hsl(var(--muted-foreground))]">Inventory Value</h3>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(data.kpis.totalInventoryValue)}</p>
        </div>

        <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-[hsl(var(--muted-foreground))]">Total Revenue</h3>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(data.kpis.totalRevenue)}</p>
        </div>

        <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-[hsl(var(--muted-foreground))]">Units Sold</h3>
          </div>
          <p className="text-2xl font-bold">{data.kpis.totalUnitsSold}</p>
        </div>

        <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-[hsl(var(--muted-foreground))]">Available Units</h3>
          </div>
          <p className="text-2xl font-bold">{data.kpis.availableUnits}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Collections */}
        <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
          <h3 className="font-bold mb-6">Revenue vs Collections Trend (Mock)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTrends} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  tickFormatter={(value) => `₹${value / 10000000}Cr`}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 8 }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), ""]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" name="Revenue" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Collections" dataKey="collections" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Status */}
        <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
          <h3 className="font-bold mb-6">Inventory Status Distribution</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executive Performance */}
        <div className="rounded-xl bg-[hsl(var(--card))] border p-5">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold">Executive Sales Performance (Mock)</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.executivePerformance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                />
                <RechartsTooltip 
                  cursor={{ fill: "hsl(var(--accent))" }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 8 }}
                />
                <Bar dataKey="sales" name="Units Sold" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Add more widgets as needed */}
      </div>

    </div>
  );
}
