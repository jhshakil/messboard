import { cn } from "@/lib/utils";

interface MealStatusBadgeProps {
  mealCount: number;
}

export function MealStatusBadge({ mealCount }: MealStatusBadgeProps) {
  let label = "Absent";
  let className = "mms-meal-absent";

  if (mealCount === 0) {
    label = "Absent";
    className = "mms-meal-absent";
  } else if (mealCount > 0 && mealCount < 1) {
    label = "Partial";
    className = "mms-meal-partial";
  } else if (mealCount >= 1) {
    label = "Present";
    className = "mms-meal-present";
  }

  return <span className={className}>{label}</span>;
}
