import { Role } from "@prisma/client";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}
