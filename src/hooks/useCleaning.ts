import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { cleaningService } from "@/services/cleaning.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";

export const useCleaningAll = (params?: { type?: string; year?: number; month?: number }) => {
  const { status } = useSession();
  return useQuery({
    queryKey: [...QUERY_KEYS.cleaning.all, params],
    queryFn: () => cleaningService.getAll(params),
    enabled: status === "authenticated",
  });
};

export const useCreateCleaning = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cleaningService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cleaning.all });
      toast.success("Cleaning log added");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateCleaning = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cleaningService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cleaning.all });
      toast.success("Cleaning log updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteCleaning = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cleaningService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cleaning.all });
      toast.success("Cleaning log deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
