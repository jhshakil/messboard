import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { mealsService } from "@/services/meals.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";

export const useMealsMonthly = (year: number, month: number) => {
  const { status } = useSession();
  return useQuery({
    queryKey: QUERY_KEYS.meals.monthly(year, month),
    queryFn: () => mealsService.getMonthly(year, month),
    enabled: status === "authenticated",
  });
};

export const useMealsByDate = (date: string) => {
  const { status } = useSession();
  return useQuery({
    queryKey: QUERY_KEYS.meals.byDate(date),
    queryFn: () => mealsService.getByDate(date),
    enabled: !!date && status === "authenticated",
  });
};

export const useCreateMeal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mealsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meals.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.finance.all });
      toast.success("Meal created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateMeal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => mealsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meals.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.finance.all });
      toast.success("Meal updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteMeal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mealsService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meals.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.finance.all });
      toast.success("Meal deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
