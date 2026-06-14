"use client";

import { useState } from "react";
import { useMealsMonthly } from "@/hooks/useMeals";
import { useMembersAll } from "@/hooks/useMembers";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { MonthYearPicker } from "@/components/shared/MonthYearPicker";
import { MealDayEditModal } from "./MealDayEditModal";
import { MealStatusBadge } from "./MealStatusBadge";
import { getDaysInMonth } from "@/lib/utils";
import { MealResponse } from "@/types/meal.types";
import { useSession } from "next-auth/react";

export function MealMonthlyTable() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedCell, setSelectedCell] = useState<{
    date: string; memberId: string; memberName: string; existingMeal?: MealResponse;
  } | null>(null);

  const { data: meals, isLoading } = useMealsMonthly(year, month);
  const { data: members } = useMembersAll();
  const { data: session } = useSession();

  if (isLoading) return <LoadingSpinner />;

  const daysInMonth = getDaysInMonth(year, month);
  const activeMembers = members?.filter((m) => m.isActive) ?? [];

  const getMeal = (memberId: string, day: number): MealResponse | undefined => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return meals?.find((m) => m.memberId === memberId && m.date.startsWith(dateStr));
  };

  const getDailyTotal = (day: number): number => {
    return activeMembers.reduce((sum, member) => {
      const meal = getMeal(member.id, day);
      return sum + (meal?.mealCount ?? 0);
    }, 0);
  };

  const getMemberMonthlyTotal = (memberId: string): number => {
    return meals?.filter((m) => m.memberId === memberId).reduce((sum, m) => sum + m.mealCount, 0) ?? 0;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="mms-section-title">Meal Management</h1>
          <p className="mms-section-subtitle">Monthly meal tracking</p>
        </div>
        <MonthYearPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      <div className="mms-card overflow-x-auto">
        <table className="mms-table text-xs border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 bg-[hsl(var(--mms-bg-muted))] min-w-[120px]">Member</th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <th key={day} className="text-center min-w-[40px]">{day}</th>
              ))}
              <th className="text-center min-w-[60px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {activeMembers.map((member) => (
              <tr key={member.id}>
                <td className="sticky left-0 bg-[hsl(var(--mms-bg-card))] font-medium">
                  {member.name}
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const meal = getMeal(member.id, day);
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isOwnCell = session?.user?.id === member.id;

                  return (
                    <td
                      key={day}
                      className="text-center cursor-pointer hover:bg-[hsl(var(--mms-bg-muted))] transition-colors p-1"
                      onClick={() => setSelectedCell({
                        date: dateStr,
                        memberId: member.id,
                        memberName: member.name,
                        existingMeal: meal,
                      })}
                    >
                      {meal ? (
                        <span className={meal.mealCount === 0
                          ? "text-red-500"
                          : meal.mealCount < 1
                          ? "text-yellow-500"
                          : "text-green-500"
                        }>
                          {meal.mealCount}
                        </span>
                      ) : (
                        <span className="text-[hsl(var(--mms-text-muted))]">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="text-center font-semibold">
                  {getMemberMonthlyTotal(member.id)}
                </td>
              </tr>
            ))}
            <tr className="bg-[hsl(var(--mms-bg-muted))] font-semibold">
              <td className="sticky left-0 bg-[hsl(var(--mms-bg-muted))]">Daily Total</td>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <td key={day} className="text-center">{getDailyTotal(day)}</td>
              ))}
              <td className="text-center">{meals?.reduce((sum, m) => sum + m.mealCount, 0) ?? 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {selectedCell && (
        <MealDayEditModal
          open={!!selectedCell}
          onClose={() => setSelectedCell(null)}
          date={selectedCell.date}
          memberId={selectedCell.memberId}
          memberName={selectedCell.memberName}
          existingMeal={selectedCell.existingMeal}
        />
      )}
    </>
  );
}
