import { z } from "zod";

export const createBazarSchema = z.object({
  date: z.string(),
  amount: z.number({ message: "Amount must be a number" }).positive("Amount must be positive"),
  description: z.string().optional(),
  memberId: z.string().min(1, "Please select a member"),
});

export const updateBazarSchema = createBazarSchema.partial();

export type CreateBazarFormValues = z.infer<typeof createBazarSchema>;
export type UpdateBazarFormValues = z.infer<typeof updateBazarSchema>;
