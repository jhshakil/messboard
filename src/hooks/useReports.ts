import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports.service";

export const useMonthlyReport = (year: number, month: number) =>
  useQuery({
    queryKey: ["reports", "monthly", year, month],
    queryFn: () => reportsService.getMonthlyReport(year, month),
    enabled: false,
  });
