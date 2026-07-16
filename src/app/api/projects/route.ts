import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectCreateSchema } from "@/lib/validations/project";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { builder: { contains: search } },
            { location: { contains: search } },
          ],
        }
      : {};

    const projects = await prisma.project.findMany({
      where,
      include: {
        towers: {
          include: {
            _count: { select: { units: true } },
          },
        },
        _count: { select: { towers: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate availability stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const unitStats = await prisma.unit.groupBy({
          by: ["status"],
          where: { tower: { projectId: project.id } },
          _count: true,
        });
        const totalUnits = unitStats.reduce((sum, s) => sum + s._count, 0);
        const availableUnits = unitStats.find((s) => s.status === "available")?._count || 0;

        return {
          ...project,
          totalUnits,
          availableUnits,
          unitStats,
        };
      })
    );

    return NextResponse.json({ projects: projectsWithStats });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = projectCreateSchema.parse(body);

    const { towers, ...projectData } = data;

    const project = await prisma.project.create({ 
      data: {
        ...projectData,
        ...(towers && towers.length > 0 ? {
          towers: {
            create: towers.map(t => ({
              name: t.name,
              totalFloors: t.totalFloors
            }))
          }
        } : {})
      } 
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
