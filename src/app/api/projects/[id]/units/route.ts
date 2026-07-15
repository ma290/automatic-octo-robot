import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const towerId = searchParams.get("towerId");
    const floor = searchParams.get("floor");

    const where: Record<string, unknown> = {
      tower: { projectId: id },
    };
    if (towerId) where.towerId = towerId;
    if (floor) where.floor = parseInt(floor);

    const units = await prisma.unit.findMany({
      where,
      include: { tower: { select: { name: true } } },
      orderBy: [{ floor: "asc" }, { unitNumber: "asc" }],
    });

    return NextResponse.json({ units });
  } catch (error) {
    console.error("GET /api/projects/[id]/units error:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params; // Validate route param exists
    const body = await request.json();
    const { unitId, ...data } = body;

    const unit = await prisma.unit.update({
      where: { id: unitId },
      data,
    });

    return NextResponse.json(unit);
  } catch (error) {
    console.error("PUT /api/projects/[id]/units error:", error);
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
  }
}
