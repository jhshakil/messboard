import { z } from "zod";

export const createCleaningSchema = z.object({
  date: z.string(),
  type: z.enum(["DINING", "WASHROOM", "KITCHEN", "COMMON_AREA", "OTHER"]),
  description: z.string().optional(),
  memberId: z.string().min(1, "Please select a member"),
});

export const updateCleaningSchema = createCleaningSchema.partial();

export type CreateCleaningFormValues = z.infer<typeof createCleaningSchema>;
export type UpdateCleaningFormValues = z.infer<typeof updateCleaningSchema>;
