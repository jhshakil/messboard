"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthName } from "@/lib/utils";

interface MonthYearPickerProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function MonthYearPicker({ year, month, onChange }: MonthYearPickerProps) {
  const goToPrevMonth = () => {
    if (month === 1) {
      onChange(year - 1, 12);
    } else {
      onChange(year, month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      onChange(year + 1, 1);
    } else {
      onChange(year, month + 1);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={goToPrevMonth}
        className="p-1.5 rounded-lg hover:bg-[hsl(var(--mms-bg-muted))] text-[hsl(var(--mms-text-secondary))] transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h2 className="text-lg font-semibold text-[hsl(var(--mms-text-primary))] min-w-[160px] text-center">
        {getMonthName(month)} {year}
      </h2>
      <button
        onClick={goToNextMonth}
        className="p-1.5 rounded-lg hover:bg-[hsl(var(--mms-bg-muted))] text-[hsl(var(--mms-text-secondary))] transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
