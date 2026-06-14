import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { auditService, AuditLogQuery } from "@/services/audit.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useAuditLogs = (params?: AuditLogQuery) => {
  const { status } = useSession();
  return useQuery({
    queryKey: [...QUERY_KEYS.auditLogs.all, params],
    queryFn: () => auditService.getAll(params),
    enabled: status === "authenticated",
  });
};
