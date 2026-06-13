import api from "@/lib/axios";
import { AuditLogResponse } from "@/types/audit.types";

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
}

export const auditService = {
  getAll: (params?: AuditLogQuery) =>
    api.get<{ data: AuditLogResponse[]; total: number; page: number }>("/audit-logs", { params }).then((r) => r.data),
};
