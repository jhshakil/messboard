"use client";

import { useState } from "react";
import { useUpdateMemberRole } from "@/hooks/useMembers";
import { MemberResponse } from "@/types/member.types";
import { ROLES } from "@/constants/roles";
import { useSession } from "next-auth/react";
import { CAN_ASSIGN_ROLE } from "@/constants/roles";
import { Role } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface RoleChangeModalProps {
  open: boolean;
  onClose: () => void;
  member: MemberResponse;
}

export function RoleChangeModal({ open, onClose, member }: RoleChangeModalProps) {
  const { data: session } = useSession();
  const updateRole = useUpdateMemberRole();
  const [selectedRole, setSelectedRole] = useState<Role>(member.role as Role);

  if (!open) return null;

  const currentUserRole = session?.user?.role as string;
  const assignableRoles = CAN_ASSIGN_ROLE[currentUserRole] || [] as string[];

  const handleSave = async () => {
    await updateRole.mutateAsync({ id: member.id, role: selectedRole });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[hsl(var(--mms-bg-card))] rounded-[var(--mms-radius-lg)] p-6 shadow-lg max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-[hsl(var(--mms-text-primary))]">Change Role</h3>
        <p className="text-sm text-[hsl(var(--mms-text-muted))] mt-1 mb-4">
          {member.name} — Current role: <span className="font-medium">{member.role}</span>
        </p>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as Role)}
          className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm mb-4"
        >
          {assignableRoles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[hsl(var(--mms-text-secondary))] hover:bg-[hsl(var(--mms-bg-muted))] rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={updateRole.isPending} className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--mms-brand-primary))] hover:bg-[hsl(var(--mms-brand-primary-dark))] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
            {updateRole.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
