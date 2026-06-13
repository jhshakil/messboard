import { prisma } from "@/lib/prisma";

interface AuditParams {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: object;
  newValue?: object;
  request?: Request;
}

export async function createAuditLog(params: AuditParams) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : undefined,
      newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : undefined,
      ipAddress: params.request?.headers.get("x-forwarded-for") ?? undefined,
      userAgent: params.request?.headers.get("user-agent") ?? undefined,
    },
  });
}
