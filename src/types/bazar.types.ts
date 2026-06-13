export interface BazarResponse {
  id: string;
  date: string;
  amount: number;
  description: string | null;
  memberId: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    name: string;
  };
}

export interface CreateBazarDto {
  date: string;
  amount: number;
  description?: string;
  memberId: string;
}

export interface UpdateBazarDto {
  amount?: number;
  description?: string;
  memberId?: string;
  date?: string;
}
