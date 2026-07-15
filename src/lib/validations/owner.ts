import { z } from "zod";

export const ownerCreateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number is required"),
  company: z.string().optional(),
  type: z.enum(["individual", "builder", "developer"]).default("individual"),
  notes: z.string().optional(),
});

export const ownerUpdateSchema = ownerCreateSchema.partial();

export type OwnerCreate = z.infer<typeof ownerCreateSchema>;
