export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type RoleType = keyof typeof ROLES;

export const ROLE_HIERARCHY: Record<string, number> = {
  USER: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

export const CAN_ASSIGN_ROLE: Record<string, string[]> = {
  SUPERADMIN: ["SUPERADMIN", "ADMIN", "USER"],
  ADMIN: ["USER"],
  USER: [],
};
