import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notesService } from "@/services/notes.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";

export const useNotesAll = () =>
  useQuery({
    queryKey: QUERY_KEYS.notes.all,
    queryFn: () => notesService.getAll(),
  });

export const useCreateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notesService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notes.all });
      toast.success("Note created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => notesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notes.all });
      toast.success("Note updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notesService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notes.all });
      toast.success("Note deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
