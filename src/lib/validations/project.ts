import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z.string().min(3, "Project name is required"),
  builder: z.string().min(2, "Builder name is required"),
  description: z.string().optional(),
  location: z.string().min(3, "Location is required"),
  status: z.enum(["active", "upcoming", "completed"]).default("active"),
  priceSheetUrl: z.string().optional(),
  brochureUrl: z.string().optional(),
  masterPlanUrl: z.string().optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export type ProjectCreate = z.infer<typeof projectCreateSchema>;
