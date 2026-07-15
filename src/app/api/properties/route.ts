import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { propertyCreateSchema, propertyFilterSchema } from "@/lib/validations/property";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);
    const filters = propertyFilterSchema.parse(params);

    const where: Prisma.PropertyWhereInput = {};

    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { title: { contains: search } },
        { address: { contains: search } },
        { city: { contains: search } },
        { ownerName: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.city) where.city = { contains: filters.city };
    if (filters.bedrooms) where.bedrooms = filters.bedrooms;
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }
    if (filters.minArea || filters.maxArea) {
      where.area = {};
      if (filters.minArea) where.area.gte = filters.minArea;
      if (filters.maxArea) where.area.lte = filters.maxArea;
    }

    const orderBy: Prisma.PropertyOrderByWithRelationInput = {
      [filters.sort]: filters.order,
    };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          _count: { select: { images: true, documents: true } },
        },
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = propertyCreateSchema.parse(body);

    const { images, ...propertyData } = data;

    let imageRecords: Prisma.PropertyImageCreateWithoutPropertyInput[] = [];

    if (images && images.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "properties");
      await mkdir(uploadDir, { recursive: true });

      for (let i = 0; i < images.length; i++) {
        const base64Data = images[i].split(";base64,").pop();
        if (!base64Data) continue;
        
        const ext = images[i].substring("data:image/".length, images[i].indexOf(";base64"));
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext || "jpg"}`;
        const filePath = path.join(uploadDir, fileName);
        
        await writeFile(filePath, Buffer.from(base64Data, "base64"));
        
        imageRecords.push({
          url: `/uploads/properties/${fileName}`,
          order: i,
        });
      }
    }

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        bedrooms: propertyData.bedrooms ?? null,
        bathrooms: propertyData.bathrooms ?? null,
        images: {
          create: imageRecords,
        },
      },
      include: {
        images: true,
        owner: true,
      },
    });

    // Create initial timeline event
    await prisma.timelineEvent.create({
      data: {
        propertyId: property.id,
        title: "Property Listed",
        description: `${property.title} was listed on the platform`,
        date: new Date(),
        type: "created",
      },
    });

    // Create initial price history entry
    await prisma.priceHistory.create({
      data: {
        propertyId: property.id,
        price: property.price,
        date: new Date(),
        note: "Initial listing price",
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("POST /api/properties error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
