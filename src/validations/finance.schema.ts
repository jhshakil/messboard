import { z } from "zod";

export const createTransactionSchema = z.object({
  memberId: z.string().min(1, "Please select a member"),
  type: z.enum(["GIVE", "TAKE"]),
  amount: z.number({ message: "Amount must be a number" }).positive("Amount must be positive"),
  description: z.string().optional(),
  date: z.string(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionFormValues = z.infer<typeof updateTransactionSchema>;
