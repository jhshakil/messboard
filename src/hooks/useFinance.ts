import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { financeService } from "@/services/finance.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";

export const useFinanceMonthly = (year: number, month: number) => {
  const { status } = useSession();
  return useQuery({
    queryKey: QUERY_KEYS.finance.monthly(year, month),
    queryFn: () => financeService.getMonthly(year, month),
    enabled: status === "authenticated",
  });
};

export const useFinanceSummary = (year: number, month: number) => {
  const { status } = useSession();
  return useQuery({
    queryKey: [...QUERY_KEYS.finance.summary, year, month],
    queryFn: () => financeService.getSummary(year, month),
    enabled: !!year && !!month && status === "authenticated",
  });
};

export const useMembersBalance = (year: number, month: number) => {
  const { status } = useSession();
  return useQuery({
    queryKey: [...QUERY_KEYS.finance.summary, "balance", year, month],
    queryFn: () => financeService.getMembersBalance(year, month),
    enabled: !!year && !!month && status === "authenticated",
  });
};

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.finance.all });
      toast.success("Transaction recorded");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.finance.all });
      toast.success("Transaction updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.finance.all });
      toast.success("Transaction deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
