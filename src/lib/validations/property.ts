import { z } from "zod";

export const propertyTypes = ["residential", "commercial", "rental", "resale", "plot"] as const;
export const propertySubtypes = [
  "villa", "apartment", "office", "warehouse", "land",
  "penthouse", "studio", "shop", "farmhouse", "rowhouse",
] as const;
export const propertyStatuses = ["available", "hold", "sold", "rented", "booked"] as const;

export const propertyCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  type: z.enum(propertyTypes),
  subtype: z.enum(propertySubtypes),
  status: z.enum(propertyStatuses).default("available"),
  price: z.coerce.number().positive("Price must be positive"),
  area: z.coerce.number().positive("Area must be positive"),
  bedrooms: z.coerce.number().int().min(0).nullable().optional(),
  bathrooms: z.coerce.number().int().min(0).nullable().optional(),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  ownerEmail: z.string().email().optional().or(z.literal("")),
  ownerId: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const propertyUpdateSchema = propertyCreateSchema.partial();

export const propertyFilterSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minArea: z.coerce.number().optional(),
  maxArea: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  city: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(12),
  sort: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type PropertyCreate = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdate = z.infer<typeof propertyUpdateSchema>;
export type PropertyFilter = z.infer<typeof propertyFilterSchema>;
