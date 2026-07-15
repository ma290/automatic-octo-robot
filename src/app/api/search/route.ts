import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ properties: [], projects: [] });
    }

    const [properties, projects] = await Promise.all([
      prisma.property.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { city: { contains: query } },
            { address: { contains: query } },
            { type: { contains: query } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          city: true,
          price: true,
          type: true,
          status: true,
        },
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { builder: { contains: query } },
            { location: { contains: query } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          builder: true,
          location: true,
          status: true,
        },
      }),
    ]);

    return NextResponse.json({ properties, projects });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
