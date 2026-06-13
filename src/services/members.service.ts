import api from "@/lib/axios";
import { MemberResponse, UpdateMemberRoleDto } from "@/types/member.types";

export const membersService = {
  getAll: () =>
    api.get<MemberResponse[]>("/members").then((r) => r.data),

  updateRole: (id: string, data: UpdateMemberRoleDto) =>
    api.patch<MemberResponse>(`/members/${id}/role`, data).then((r) => r.data),

  toggleActive: (id: string) =>
    api.patch<MemberResponse>(`/members/${id}`, { isActive: undefined }).then((r) => r.data),

  updateMember: (id: string, data: { isActive: boolean }) =>
    api.patch<MemberResponse>(`/members/${id}`, data).then((r) => r.data),
};
