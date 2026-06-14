"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMealSchema, CreateMealFormValues } from "@/validations/meal.schema";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useCreateMeal, useUpdateMeal, useDeleteMeal } from "@/hooks/useMeals";
import { MealResponse } from "@/types/meal.types";

interface MealDayEditModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
  memberId: string;
  memberName: string;
  existingMeal?: MealResponse;
}

export function MealDayEditModal({
  open,
  onClose,
  date,
  memberId,
  memberName,
  existingMeal,
}: MealDayEditModalProps) {
  const { data: session } = useSession();
  const createMeal = useCreateMeal();
  const updateMeal = useUpdateMeal();
  const deleteMeal = useDeleteMeal();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateMealFormValues>({
    resolver: zodResolver(createMealSchema),
    defaultValues: {
      date,
      memberId,
      mealCount: existingMeal?.mealCount ?? 0,
      breakfast: existingMeal?.breakfast ?? false,
      lunch: existingMeal?.lunch ?? false,
      dinner: existingMeal?.dinner ?? false,
      note: existingMeal?.note ?? "",
    },
  });

  if (!open) return null;

  const onSubmit = async (data: CreateMealFormValues) => {
    if (existingMeal?.id) {
      await updateMeal.mutateAsync({ id: existingMeal.id, data });
    } else {
      await createMeal.mutateAsync(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (existingMeal?.id) {
      await deleteMeal.mutateAsync(existingMeal.id);
      onClose();
    }
  };

  const isLoading = createMeal.isPending || updateMeal.isPending;

  const canDelete = (session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN") && existingMeal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[hsl(var(--mms-bg-card))] rounded-[var(--mms-radius-lg)] p-6 shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-[hsl(var(--mms-text-primary))] mb-1">
          {existingMeal ? "Edit Meal" : "Add Meal"}
        </h3>
        <p className="text-sm text-[hsl(var(--mms-text-muted))] mb-4">
          {memberName} — {date}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">
                Meal Count
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="5"
                {...register("mealCount", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
                placeholder="0, 0.5, 1, 1.5..."
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("breakfast")} className="rounded" />
                <span className="text-sm">Breakfast</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("lunch")} className="rounded" />
                <span className="text-sm">Lunch</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("dinner")} className="rounded" />
                <span className="text-sm">Dinner</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">
                Note
              </label>
              <input
                type="text"
                {...register("note")}
                className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
                placeholder="Optional note..."
              />
            </div>

            <div className="flex justify-between pt-2">
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              )}
              <div className="flex gap-3 ml-auto">
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
                  Save
                </button>
              </div>
            </div>
          </form>
      </div>
    </div>
  );
}
