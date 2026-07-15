import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalProperties,
      propertiesByStatus,
      propertiesByType,
      totalProjects,
      totalOwners,
      recentProperties,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.groupBy({ by: ["status"], _count: true }),
      prisma.property.groupBy({ by: ["type"], _count: true }),
      prisma.project.count(),
      prisma.owner.count(),
      prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { images: { take: 1, orderBy: { order: "asc" } } },
      }),
    ]);

    const statusMap = Object.fromEntries(
      propertiesByStatus.map((s) => [s.status, s._count])
    );

    return NextResponse.json({
      totalProperties,
      available: statusMap["available"] || 0,
      sold: statusMap["sold"] || 0,
      rented: statusMap["rented"] || 0,
      hold: statusMap["hold"] || 0,
      booked: statusMap["booked"] || 0,
      totalProjects,
      totalOwners,
      propertiesByType,
      recentProperties,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
