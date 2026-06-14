import { TransactionType } from "@prisma/client";

export interface TransactionResponse {
  id: string;
  memberId: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    name: string;
  };
}

export interface CreateTransactionDto {
  memberId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  date: string;
}

export interface UpdateTransactionDto {
  amount?: number;
  description?: string;
  type?: TransactionType;
  date?: string;
}

export interface FinanceSummary {
  totalMeals: number;
  totalBazarCost: number;
  mealRate: number;
  totalFundCollected: number;
  totalFundWithdrawn: number;
  currentBalance: number;
}

export interface MemberBalance {
  memberId: string;
  memberName: string;
  totalMeals: number;
  mealCost: number;
  bazarSpent: number;
  amountGiven: number;
  amountTaken: number;
  netBalance: number;
}
