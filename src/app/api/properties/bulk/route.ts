import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bulkActionSchema = z.object({
  action: z.enum(["update_status", "delete"]),
  ids: z.array(z.string()).min(1, "At least one property ID is required"),
  status: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ids, status } = bulkActionSchema.parse(body);

    if (action === "update_status") {
      if (!status) {
        return NextResponse.json({ error: "Status is required for update" }, { status: 400 });
      }
      await prisma.property.updateMany({
        where: { id: { in: ids } },
        data: { status },
      });

      // Create timeline events for each
      await prisma.timelineEvent.createMany({
        data: ids.map((id) => ({
          propertyId: id,
          title: `Bulk status update to ${status}`,
          description: `Status was updated to ${status} via bulk action`,
          date: new Date(),
          type: "status_change",
        })),
      });

      return NextResponse.json({ success: true, updated: ids.length });
    }

    if (action === "delete") {
      await prisma.property.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ success: true, deleted: ids.length });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/properties/bulk error:", error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
