import api from "@/lib/axios";
import { CreateTransactionDto, UpdateTransactionDto, TransactionResponse, FinanceSummary, MemberBalance } from "@/types/finance.types";

export const financeService = {
  getMonthly: (year: number, month: number) =>
    api.get<TransactionResponse[]>(`/finance?year=${year}&month=${month}`).then((r) => r.data),

  getSummary: (year: number, month: number) =>
    api.get<FinanceSummary>(`/finance/summary?year=${year}&month=${month}`).then((r) => r.data),

  getMembersBalance: (year: number, month: number) =>
    api.get<MemberBalance[]>(`/finance/members-balance?year=${year}&month=${month}`).then((r) => r.data),

  create: (data: CreateTransactionDto) =>
    api.post<TransactionResponse>("/finance", data).then((r) => r.data),

  update: (id: string, data: UpdateTransactionDto) =>
    api.patch<TransactionResponse>(`/finance/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/finance/${id}`).then((r) => r.data),
};
