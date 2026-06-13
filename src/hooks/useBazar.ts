import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bazarService } from "@/services/bazar.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";

export const useBazarMonthly = (year: number, month: number) =>
  useQuery({
    queryKey: QUERY_KEYS.bazar.monthly(year, month),
    queryFn: () => bazarService.getMonthly(year, month),
  });

export const useBazarAll = () =>
  useQuery({
    queryKey: QUERY_KEYS.bazar.all,
    queryFn: () => bazarService.getAll(),
  });

export const useCreateBazar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bazarService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bazar.all });
      toast.success("Bazar entry added");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateBazar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => bazarService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bazar.all });
      toast.success("Bazar entry updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteBazar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bazarService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bazar.all });
      toast.success("Bazar entry deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
