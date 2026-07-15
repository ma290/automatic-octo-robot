import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        towers: {
          include: {
            units: {
              orderBy: [{ floor: "asc" }, { unitNumber: "asc" }],
            },
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Calculate stats
    const allUnits = project.towers.flatMap((t) => t.units);
    const stats = {
      total: allUnits.length,
      available: allUnits.filter((u) => u.status === "available").length,
      sold: allUnits.filter((u) => u.status === "sold").length,
      booked: allUnits.filter((u) => u.status === "booked").length,
      hold: allUnits.filter((u) => u.status === "hold").length,
    };

    return NextResponse.json({ ...project, stats });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const project = await prisma.project.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
