import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const generateSchema = z.object({
  towerId: z.string(),
  startFloor: z.number().min(1),
  endFloor: z.number().min(1),
  unitsPerFloor: z.number().min(1),
  unitType: z.string(),
  baseSuperArea: z.number().positive(),
  basePrice: z.number().positive(),
  prefix: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = generateSchema.parse(body);

    // Ensure project and tower exist
    const tower = await prisma.tower.findUnique({
      where: { id: data.towerId, projectId: id },
    });

    if (!tower) {
      return NextResponse.json({ error: "Tower not found" }, { status: 404 });
    }

    const unitsToCreate = [];
    const prefix = data.prefix || "";

    for (let floor = data.startFloor; floor <= data.endFloor; floor++) {
      for (let i = 1; i <= data.unitsPerFloor; i++) {
        // e.g. Floor 12, Unit 4 -> 1204
        const floorStr = floor.toString().padStart(2, "0");
        const unitStr = i.toString().padStart(2, "0");
        const unitNumber = `${prefix}${floorStr}${unitStr}`;

        unitsToCreate.push({
          unitNumber,
          floor,
          type: data.unitType,
          superArea: data.baseSuperArea,
          price: data.basePrice,
          towerId: data.towerId,
          status: "available",
        });
      }
    }

    // Bulk create
    const result = await prisma.unit.createMany({
      data: unitsToCreate,
    });

    return NextResponse.json(
      { message: `Generated ${result.count} units successfully`, count: result.count },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/.../generate error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to generate units" }, { status: 500 });
  }
}
