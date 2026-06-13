import api from "@/lib/axios";

export const reportsService = {
  getMonthlyReport: (year: number, month: number) =>
    api.get(`/reports/monthly?year=${year}&month=${month}`).then((r) => r.data),
};
