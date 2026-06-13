import { Role } from "@prisma/client";

export interface MemberResponse {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMemberRoleDto {
  role: Role;
}
