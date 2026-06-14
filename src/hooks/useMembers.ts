import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { membersService } from "@/services/members.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";

export const useMembersAll = () => {
  const { status } = useSession();
  return useQuery({
    queryKey: QUERY_KEYS.members.all,
    queryFn: () => membersService.getAll(),
    enabled: status === "authenticated",
  });
};

export const useUpdateMemberRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      membersService.updateRole(id, { role: role as any }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.members.all });
      toast.success("Member role updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useToggleMemberActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      membersService.updateMember(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.members.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.finance.all });
      toast.success("Member status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
