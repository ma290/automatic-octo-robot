import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [properties, units] = await Promise.all([
      prisma.property.findMany({ select: { status: true, price: true } }),
      prisma.unit.findMany({ select: { status: true, price: true } }),
    ]);

    let totalInventoryValue = 0;
    let totalRevenue = 0;
    let totalUnitsSold = 0;
    let availableUnits = 0;

    const statusCounts: Record<string, number> = {
      available: 0,
      sold: 0,
      booked: 0,
      hold: 0,
    };

    // Aggregate Properties
    for (const p of properties) {
      if (p.status === "available") {
        totalInventoryValue += p.price;
        statusCounts.available++;
      } else if (p.status === "sold") {
        totalRevenue += p.price;
        totalUnitsSold++;
        statusCounts.sold++;
      } else if (p.status === "booked") {
        statusCounts.booked++;
      } else if (p.status === "hold") {
        statusCounts.hold++;
      } else {
        // Other statuses map to hold for simplicity in pie chart
        statusCounts.hold++;
      }
    }

    // Aggregate Units
    for (const u of units) {
      if (u.status === "available") {
        totalInventoryValue += u.price;
        statusCounts.available++;
        availableUnits++;
      } else if (u.status === "sold") {
        totalRevenue += u.price;
        totalUnitsSold++;
        statusCounts.sold++;
      } else if (u.status === "booked") {
        statusCounts.booked++;
      } else if (u.status === "hold") {
        statusCounts.hold++;
      } else {
        statusCounts.hold++;
      }
    }
    
    // Status distribution for Pie Chart
    const statusDistribution = [
      { name: "Available", value: statusCounts.available, color: "#10b981" },
      { name: "Sold", value: statusCounts.sold, color: "#3b82f6" },
      { name: "Booked", value: statusCounts.booked, color: "#f59e0b" },
      { name: "Hold", value: statusCounts.hold, color: "#64748b" },
    ].filter(item => item.value > 0);

    // MOCK DATA for Trends and Executive Performance
    const revenueTrends = [
      { month: "Jan", revenue: 45000000, collections: 42000000 },
      { month: "Feb", revenue: 52000000, collections: 48000000 },
      { month: "Mar", revenue: 38000000, collections: 40000000 },
      { month: "Apr", revenue: 65000000, collections: 55000000 },
      { month: "May", revenue: 48000000, collections: 50000000 },
      { month: "Jun", revenue: 72000000, collections: 68000000 },
    ];

    const executivePerformance = [
      { name: "Rajesh S.", sales: 12 },
      { name: "Priya M.", sales: 15 },
      { name: "Amit K.", sales: 8 },
      { name: "Neha D.", sales: 22 },
      { name: "Vikram R.", sales: 10 },
    ];

    return NextResponse.json({
      kpis: {
        totalInventoryValue,
        totalRevenue,
        totalUnitsSold,
        availableUnits: statusCounts.available, // total available across properties and units
      },
      statusDistribution,
      revenueTrends,
      executivePerformance,
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports data" }, { status: 500 });
  }
}
