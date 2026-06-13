"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransactionSchema, CreateTransactionFormValues } from "@/validations/finance.schema";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/useFinance";
import { useMembersAll } from "@/hooks/useMembers";
import { Loader2 } from "lucide-react";
import { TransactionResponse } from "@/types/finance.types";

interface TransactionFormProps {
  onClose: () => void;
  editing?: TransactionResponse | null;
}

export function TransactionForm({ onClose, editing }: TransactionFormProps) {
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { data: members } = useMembersAll();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: editing ? {
      date: editing.date.split("T")[0],
      memberId: editing.memberId,
      type: editing.type,
      amount: editing.amount,
      description: editing.description ?? "",
    } : {
      date: new Date().toISOString().split("T")[0],
      memberId: "",
      type: "GIVE",
      amount: undefined,
      description: "",
    },
  });

  const isLoading = createTransaction.isPending || updateTransaction.isPending;

  const onSubmit = async (data: CreateTransactionFormValues) => {
    if (editing) {
      await updateTransaction.mutateAsync({ id: editing.id, data });
    } else {
      await createTransaction.mutateAsync(data);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mms-card space-y-4">
      <h3 className="mms-section-title">{editing ? "Edit Transaction" : "Record Transaction"}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">Date</label>
          <input
            type="date"
            {...register("date")}
            className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">Member</label>
          <select
            {...register("memberId")}
            className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
          >
            <option value="">Select member...</option>
            {members?.filter(m => m.isActive).map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {errors.memberId && <p className="text-xs text-red-500 mt-1">{errors.memberId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">Type</label>
          <select
            {...register("type")}
            className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
          >
            <option value="GIVE">GIVE (money in)</option>
            <option value="TAKE">TAKE (money out)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">Amount (BDT)</label>
          <input
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
          />
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">Description</label>
          <input
            type="text"
            {...register("description")}
            placeholder="Optional description..."
            className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-[hsl(var(--mms-text-secondary))] hover:bg-[hsl(var(--mms-bg-muted))] rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--mms-brand-primary))] hover:bg-[hsl(var(--mms-brand-primary-dark))] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {editing ? "Update" : "Record"}
        </button>
      </div>
    </form>
  );
}
