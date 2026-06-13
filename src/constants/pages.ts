export const PAGE_KEYS = {
  MEALS:    "meals",
  BAZAR:    "bazar",
  FINANCE:  "finance",
  CLEANING: "cleaning",
  NOTES:    "notes",
  REPORTS:  "reports",
  MEMBERS:  "members",
} as const;

export const PAGE_LABELS: Record<string, string> = {
  meals:    "Meal Management",
  bazar:    "Bazar / Grocery",
  finance:  "Finance & Money",
  cleaning: "Cleaning Log",
  notes:    "Notes Board",
  reports:  "Monthly Reports",
  members:  "Member Management",
};
