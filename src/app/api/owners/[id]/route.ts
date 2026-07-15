import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ownerUpdateSchema } from "@/lib/validations/owner";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        properties: {
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    return NextResponse.json(owner);
  } catch (error) {
    console.error("GET /api/owners/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch owner" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = ownerUpdateSchema.parse(body);

    const owner = await prisma.owner.update({
      where: { id },
      data,
    });

    return NextResponse.json(owner);
  } catch (error) {
    console.error("PUT /api/owners/[id] error:", error);
    return NextResponse.json({ error: "Failed to update owner" }, { status: 500 });
  }
}
