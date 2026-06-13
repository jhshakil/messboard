"use client";

import { useState } from "react";
import { useMembersAll, useToggleMemberActive } from "@/hooks/useMembers";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { RoleChangeModal } from "./RoleChangeModal";
import { MemberResponse } from "@/types/member.types";
import { Users, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";

export function MemberTable() {
  const { data: members, isLoading } = useMembersAll();
  const toggleActiveMutation = useToggleMemberActive();
  const [roleModalMember, setRoleModalMember] = useState<MemberResponse | null>(null);
  const [toggleId, setToggleId] = useState<string | null>(null);
  const [toggleActive, setToggleActive] = useState(false);

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

  if (isLoading) return <LoadingSpinner />;

  const roleBadgeClass = (role: string) => {
    if (role === "SUPERADMIN") return "mms-role-superadmin";
    if (role === "ADMIN") return "mms-role-admin";
    return "mms-role-user";
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mms-section-title">Member Management</h1>
            <p className="mms-section-subtitle">{isAdmin ? "Manage members and roles" : "Member directory"}</p>
        </div>
      </div>

      {!members?.length ? (
        <EmptyState icon={<Users className="h-12 w-12" />} title="No members found" />
      ) : (
        <div className="mms-card overflow-x-auto">
          <table className="mms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="font-medium">{member.name}</td>
                  <td className="text-sm">{member.email}</td>
                  <td><span className={roleBadgeClass(member.role)}>{member.role}</span></td>
                  <td>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-sm text-[hsl(var(--mms-text-muted))]">{formatDate(member.createdAt)}</td>
                  {isAdmin && (
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRoleModalMember(member)}
                        className="text-xs px-2 py-1 border rounded hover:bg-[hsl(var(--mms-bg-muted))] transition-colors flex items-center gap-1"
                      >
                        <Shield className="h-3 w-3" /> Role
                      </button>
                      <button
                        onClick={() => { setToggleId(member.id); setToggleActive(!member.isActive); }}
                        className={`text-xs px-2 py-1 border rounded hover:bg-[hsl(var(--mms-bg-muted))] transition-colors ${
                          member.isActive ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {member.isActive ? "Deactivate" : "Activate"}
                      </button>
                      {session?.user?.role === "SUPERADMIN" && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await api.post(`/members/${member.id}/reset-password`);
                              const data = res.data;
                              if (typeof window !== "undefined") {
                                prompt("Temporary password for " + member.name + " (copy this):", data.tempPassword);
                              }
                              toast.success("Password reset. Share the temporary password.");
                            } catch (err: any) {
                              toast.error(err.message || "Failed to reset password");
                            }
                          }}
                          className="text-xs px-2 py-1 border rounded hover:bg-yellow-50 text-yellow-700 transition-colors"
                        >
                          Reset PW
                        </button>
                      )}
                    </div>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {roleModalMember && (
        <RoleChangeModal
          open={!!roleModalMember}
          onClose={() => setRoleModalMember(null)}
          member={roleModalMember}
        />
      )}

      <ConfirmDialog
        open={!!toggleId}
        onOpenChange={() => setToggleId(null)}
        title={toggleActive ? "Deactivate Member?" : "Activate Member?"}
        description={`Are you sure you want to ${toggleActive ? "deactivate" : "activate"} this member?`}
        onConfirm={() => toggleId && toggleActiveMutation.mutateAsync({ id: toggleId, isActive: toggleActive })}
        confirmLabel={toggleActive ? "Deactivate" : "Activate"}
        variant={toggleActive ? "danger" : "default"}
      />
    </>
  );
}
