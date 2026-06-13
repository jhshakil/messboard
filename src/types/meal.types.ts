export interface MealResponse {
  id: string;
  date: string;
  memberId: string;
  mealCount: number;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  note: string | null;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateMealDto {
  date: string;
  memberId: string;
  mealCount: number;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  note?: string;
}

export interface UpdateMealDto {
  mealCount?: number;
  breakfast?: boolean;
  lunch?: boolean;
  dinner?: boolean;
  note?: string;
}

export interface DailyMealSummary {
  date: string;
  totalMeals: number;
  members: MealResponse[];
}
