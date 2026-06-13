import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pageVisibilityService } from "@/services/pageVisibility.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";

interface PageVisibilityItem {
  id: string;
  pageKey: string;
  isVisible: boolean;
}

export const usePageVisibilityAll = () =>
  useQuery<PageVisibilityItem[]>({
    queryKey: QUERY_KEYS.pageVisibility.all,
    queryFn: () => pageVisibilityService.getAll(),
    staleTime: 1000 * 60 * 5,
  });

export const useTogglePageVisibility = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ pageKey, isVisible }: { pageKey: string; isVisible: boolean }) =>
      pageVisibilityService.toggle(pageKey, isVisible),

    onMutate: async ({ pageKey, isVisible }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.pageVisibility.all });

      const previous = qc.getQueryData<PageVisibilityItem[]>(QUERY_KEYS.pageVisibility.all);

      qc.setQueryData<PageVisibilityItem[]>(QUERY_KEYS.pageVisibility.all, (old) =>
        (old ?? []).map((item) =>
          item.pageKey === pageKey ? { ...item, isVisible } : item
        )
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.pageVisibility.all, context.previous);
      }
      toast.error("Failed to update visibility");
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.pageVisibility.all });
    },
  });
};
