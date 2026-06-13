export interface AuditLogResponse {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: any | null;
  newValue: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
