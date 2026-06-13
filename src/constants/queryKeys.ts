export const QUERY_KEYS = {
  meals: {
    all: ["meals"] as const,
    monthly: (year: number, month: number) => ["meals", year, month] as const,
    byDate: (date: string) => ["meals", date] as const,
  },
  bazar: {
    all: ["bazar"] as const,
    monthly: (year: number, month: number) => ["bazar", year, month] as const,
  },
  finance: {
    all: ["finance"] as const,
    monthly: (year: number, month: number) => ["finance", year, month] as const,
    summary: ["finance", "summary"] as const,
  },
  cleaning: {
    all: ["cleaning"] as const,
    byType: (type: string) => ["cleaning", type] as const,
  },
  notes: { all: ["notes"] as const },
  members: { all: ["members"] as const },
  auditLogs: { all: ["audit-logs"] as const },
  pageVisibility: { all: ["page-visibility"] as const },
};
