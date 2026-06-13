import api from "@/lib/axios";
import { CreateMealDto, UpdateMealDto, MealResponse } from "@/types/meal.types";

export const mealsService = {
  getMonthly: (year: number, month: number) =>
    api.get<MealResponse[]>(`/meals?year=${year}&month=${month}`).then((r) => r.data),

  getByDate: (date: string) =>
    api.get<MealResponse[]>(`/meals?date=${date}`).then((r) => r.data),

  create: (data: CreateMealDto) =>
    api.post<MealResponse>("/meals", data).then((r) => r.data),

  update: (id: string, data: UpdateMealDto) =>
    api.patch<MealResponse>(`/meals/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/meals/${id}`).then((r) => r.data),
};
