import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { propertyUpdateSchema } from "@/lib/validations/property";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        documents: { orderBy: { createdAt: "desc" } },
        priceHistory: { orderBy: { date: "asc" } },
        timeline: { orderBy: { date: "desc" } },
        owner: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("GET /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = propertyUpdateSchema.parse(body);

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const { images, ...propertyData } = data;

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...propertyData,
        bedrooms: propertyData.bedrooms ?? undefined,
        bathrooms: propertyData.bathrooms ?? undefined,
      },
      include: {
        images: { orderBy: { order: "asc" } },
        owner: true,
      },
    });

    // Track status changes
    if (data.status && data.status !== existing.status) {
      await prisma.timelineEvent.create({
        data: {
          propertyId: id,
          title: `Status changed to ${data.status}`,
          description: `Status was updated from ${existing.status} to ${data.status}`,
          date: new Date(),
          type: "status_change",
        },
      });
    }

    // Track price changes
    if (data.price && data.price !== existing.price) {
      await prisma.priceHistory.create({
        data: {
          propertyId: id,
          price: data.price,
          date: new Date(),
          note: `Price updated from ₹${existing.price.toLocaleString()} to ₹${data.price.toLocaleString()}`,
        },
      });
      await prisma.timelineEvent.create({
        data: {
          propertyId: id,
          title: "Price Updated",
          description: `Price changed from ₹${existing.price.toLocaleString()} to ₹${data.price.toLocaleString()}`,
          date: new Date(),
          type: "price_change",
        },
      });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("PUT /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
