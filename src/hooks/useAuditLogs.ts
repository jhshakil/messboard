import { useQuery } from "@tanstack/react-query";
import { auditService, AuditLogQuery } from "@/services/audit.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useAuditLogs = (params?: AuditLogQuery) =>
  useQuery({
    queryKey: [...QUERY_KEYS.auditLogs.all, params],
    queryFn: () => auditService.getAll(params),
  });
