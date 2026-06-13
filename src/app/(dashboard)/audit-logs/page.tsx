"use client";

import { PageGuard } from "@/components/shared/PageGuard";
import { AuditLogTable } from "@/components/audit/AuditLogTable";

export default function AuditLogsPage() {
  return (
    <PageGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>
      <div className="mms-page">
        <AuditLogTable />
      </div>
    </PageGuard>
  );
}
