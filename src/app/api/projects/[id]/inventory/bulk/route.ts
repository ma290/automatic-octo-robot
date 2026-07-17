import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bulkUpdateSchema = z.object({
  unitIds: z.array(z.string()),
  data: z.object({
    status: z.string().optional(),
    price: z.number().positive().optional(),
    plc: z.number().optional(),
    isCorner: z.boolean().optional(),
    clientName: z.string().nullable().optional(),
    clientPhone: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { unitIds, data } = bulkUpdateSchema.parse(body);

    if (unitIds.length === 0) {
      return NextResponse.json({ error: "No units selected" }, { status: 400 });
    }

    // Ensure the units belong to the project (extra security)
    const result = await prisma.unit.updateMany({
      where: {
        id: { in: unitIds },
        tower: { projectId: id },
      },
      data,
    });

    return NextResponse.json(
      { message: `Updated ${result.count} units successfully`, count: result.count },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/.../bulk error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update units" }, { status: 500 });
  }
}
