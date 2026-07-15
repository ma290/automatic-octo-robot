import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ownerCreateSchema } from "@/lib/validations/owner";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
            { company: { contains: search } },
          ],
        }
      : {};

    const owners = await prisma.owner.findMany({
      where,
      include: {
        _count: { select: { properties: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ owners });
  } catch (error) {
    console.error("GET /api/owners error:", error);
    return NextResponse.json({ error: "Failed to fetch owners" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = ownerCreateSchema.parse(body);

    const owner = await prisma.owner.create({ data });
    return NextResponse.json(owner, { status: 201 });
  } catch (error) {
    console.error("POST /api/owners error:", error);
    return NextResponse.json({ error: "Failed to create owner" }, { status: 500 });
  }
}
