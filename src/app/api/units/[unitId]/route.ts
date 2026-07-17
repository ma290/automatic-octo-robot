import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const unitUpdateSchema = z.object({
  status: z.string().optional(),
  price: z.number().positive().optional(),
  type: z.string().optional(),
  superArea: z.number().positive().optional(),
  carpetArea: z.number().nullable().optional(),
  plc: z.number().nullable().optional(),
  facing: z.string().nullable().optional(),
  isCorner: z.boolean().optional(),
  clientName: z.string().nullable().optional(),
  clientPhone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const { unitId } = await params;
    const body = await request.json();
    const data = unitUpdateSchema.parse(body);

    const unit = await prisma.unit.update({
      where: { id: unitId },
      data,
    });

    return NextResponse.json(unit, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/units/[unitId] error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const { unitId } = await params;
    await prisma.unit.delete({
      where: { id: unitId },
    });

    return NextResponse.json({ message: "Unit deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/units/[unitId] error:", error);
    return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 });
  }
}
