"use client";

import { PageGuard } from "@/components/shared/PageGuard";
import { MemberTable } from "@/components/members/MemberTable";

export default function MembersPage() {
  return (
    <PageGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>
      <div className="mms-page">
        <MemberTable />
      </div>
    </PageGuard>
  );
}
