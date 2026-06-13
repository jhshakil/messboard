import { z } from "zod";

export const createMealSchema = z.object({
  date: z.string(),
  memberId: z.string().min(1),
  mealCount: z.number({ message: "Must be a number" }).min(0).max(5),
  breakfast: z.boolean(),
  lunch: z.boolean(),
  dinner: z.boolean(),
  note: z.string().optional(),
});

export const updateMealSchema = createMealSchema.partial();

export type CreateMealFormValues = z.infer<typeof createMealSchema>;
export type UpdateMealFormValues = z.infer<typeof updateMealSchema>;
