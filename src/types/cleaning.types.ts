import { CleaningType } from "@prisma/client";

export interface CleaningLogResponse {
  id: string;
  date: string;
  type: CleaningType;
  description: string | null;
  imageUrls: string[];
  memberId: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    name: string;
  };
}

export interface CreateCleaningDto {
  date: string;
  type: CleaningType;
  description?: string;
  imageUrls?: string[];
  memberId: string;
}

export interface UpdateCleaningDto {
  type?: CleaningType;
  description?: string;
  imageUrls?: string[];
  memberId?: string;
  date?: string;
}
