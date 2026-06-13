import api from "@/lib/axios";
import { CreateCleaningDto, UpdateCleaningDto, CleaningLogResponse } from "@/types/cleaning.types";

export const cleaningService = {
  getAll: (params?: { type?: string; year?: number; month?: number }) =>
    api.get<CleaningLogResponse[]>("/cleaning", { params }).then((r) => r.data),

  create: (data: CreateCleaningDto) =>
    api.post<CleaningLogResponse>("/cleaning", data).then((r) => r.data),

  update: (id: string, data: UpdateCleaningDto) =>
    api.patch<CleaningLogResponse>(`/cleaning/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/cleaning/${id}`).then((r) => r.data),
};
