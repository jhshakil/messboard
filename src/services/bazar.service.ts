import api from "@/lib/axios";
import { CreateBazarDto, UpdateBazarDto, BazarResponse } from "@/types/bazar.types";

export const bazarService = {
  getMonthly: (year: number, month: number) =>
    api.get<BazarResponse[]>(`/bazar?year=${year}&month=${month}`).then((r) => r.data),

  getAll: () =>
    api.get<BazarResponse[]>("/bazar").then((r) => r.data),

  create: (data: CreateBazarDto) =>
    api.post<BazarResponse>("/bazar", data).then((r) => r.data),

  update: (id: string, data: UpdateBazarDto) =>
    api.patch<BazarResponse>(`/bazar/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/bazar/${id}`).then((r) => r.data),
};
