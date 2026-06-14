"use client";

import { X, ArrowRight } from "lucide-react";
import type { AuditLogResponse } from "@/types/audit.types";

interface AuditLogDetailProps {
  log: AuditLogResponse | null;
  open: boolean;
  onClose: () => void;
}

const SKIP_KEYS = new Set([
  "id", "memberId", "userId", "updatedBy", "createdAt", "updatedAt",
  "passwordChangedAt", "emailVerified", "password", "tempPassword",
  "forcePasswordChange", "member",
]);

const FIELD_LABELS: Record<string, string> = {
  date: "Date",
  mealCount: "Meal Count",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  note: "Note",
  amount: "Amount",
  description: "Description",
  type: "Type",
  name: "Name",
  email: "Email",
  role: "Role",
  isActive: "Active",
  title: "Title",
  content: "Content",
  isPinned: "Pinned",
  imageUrls: "Images",
  pageKey: "Page",
  isVisible: "Visible",
};

function formatValue(key: string, val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (key === "date" && typeof val === "string") {
    try { return new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); } catch { return val; }
  }
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (Array.isArray(val)) return val.length ? `${val.length} item(s)` : "—";
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (obj.name) return String(obj.name);
    return JSON.stringify(val);
  }
  return String(val);
}

function getChangedFields(oldVal: Record<string, unknown> | null, newVal: Record<string, unknown> | null) {
  const allKeys = new Set<string>();
  if (oldVal) Object.keys(oldVal).forEach((k) => allKeys.add(k));
  if (newVal) Object.keys(newVal).forEach((k) => allKeys.add(k));

  const changes: { key: string; label: string; old: string; new: string; changed: boolean }[] = [];

  for (const k of allKeys) {
    if (SKIP_KEYS.has(k)) continue;
    const old = formatValue(k, oldVal?.[k]);
    const nw = formatValue(k, newVal?.[k]);
    changes.push({
      key: k,
      label: FIELD_LABELS[k] || k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      old,
      new: nw,
      changed: old !== nw,
    });
  }

  return changes;
}

export function AuditLogDetail({ log, open, onClose }: AuditLogDetailProps) {
  if (!open || !log) return null;

  const oldObj = typeof log.oldValue === "object" && log.oldValue !== null ? log.oldValue as Record<string, unknown> : null;
  const newObj = typeof log.newValue === "object" && log.newValue !== null ? log.newValue as Record<string, unknown> : null;
  const changes = getChangedFields(oldObj, newObj);
  const hasChanges = changes.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[hsl(var(--mms-bg-card))] rounded-[var(--mms-radius-lg)] shadow-[var(--mms-shadow-lg)] max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-[hsl(var(--mms-border-default))] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[hsl(var(--mms-text-primary))]">
              {log.action.replace(/_/g, " ")}
            </h3>
            <p className="text-xs text-[hsl(var(--mms-text-muted))] mt-0.5">
              {log.entityType} • {log.user.name} • {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[hsl(var(--mms-bg-muted))] text-[hsl(var(--mms-text-muted))] shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5">
          {!hasChanges ? (
            <p className="text-sm text-[hsl(var(--mms-text-muted))] text-center py-8">
              No detail data available for this action.
            </p>
          ) : log.action.startsWith("DELETE_") ? (
            /* Delete: show what was deleted */
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--mms-text-muted))] uppercase tracking-wide mb-3">
                Deleted Data
              </p>
              <div className="overflow-hidden rounded-lg border border-[hsl(var(--mms-border-default))]">
                <table className="w-full text-sm">
                  <tbody>
                    {changes.map((c) => (
                      <tr key={c.key} className="border-b border-[hsl(var(--mms-border-default))] last:border-b-0">
                        <td className="px-3 py-2 text-[hsl(var(--mms-text-muted))] w-[40%] bg-[hsl(var(--mms-bg-muted))] font-medium">
                          {c.label}
                        </td>
                        <td className="px-3 py-2 text-[hsl(var(--mms-text-primary))]">
                          {c.old !== "—" ? c.old : c.new}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : log.action.startsWith("CREATE_") ? (
            /* Create: show what was created */
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--mms-text-muted))] uppercase tracking-wide mb-3">
                Created
              </p>
              <div className="overflow-hidden rounded-lg border border-[hsl(var(--mms-border-default))]">
                <table className="w-full text-sm">
                  <tbody>
                    {changes.map((c) => (
                      <tr key={c.key} className="border-b border-[hsl(var(--mms-border-default))] last:border-b-0">
                        <td className="px-3 py-2 text-[hsl(var(--mms-text-muted))] w-[40%] bg-[hsl(var(--mms-bg-muted))] font-medium">
                          {c.label}
                        </td>
                        <td className="px-3 py-2 text-[hsl(var(--mms-text-primary))]">
                          {c.new !== "—" ? c.new : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Update: show diff */
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--mms-text-muted))] uppercase tracking-wide mb-3">
                Changes
              </p>
              <div className="overflow-hidden rounded-lg border border-[hsl(var(--mms-border-default))]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-muted))]">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-[hsl(var(--mms-text-muted))] w-[35%]">
                        Field
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-[hsl(var(--mms-text-muted))]">
                        Before
                      </th>
                      <th className="px-1 py-2 w-[24px]" />
                      <th className="px-3 py-2 text-left text-xs font-semibold text-[hsl(var(--mms-text-muted))]">
                        After
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((c) => (
                      <tr
                        key={c.key}
                        className={`border-b border-[hsl(var(--mms-border-default))] last:border-b-0 ${
                          c.changed ? "" : "opacity-40"
                        }`}
                      >
                        <td className="px-3 py-2 font-medium text-[hsl(var(--mms-text-secondary))] bg-[hsl(var(--mms-bg-muted))]">
                          {c.label}
                        </td>
                        <td className={`px-3 py-2 ${c.changed ? "text-red-600 dark:text-red-400 line-through" : "text-[hsl(var(--mms-text-muted))]"}`}>
                          {c.old}
                        </td>
                        <td className="px-1 py-2">
                          {c.changed && (
                            <ArrowRight className="h-3 w-3 text-[hsl(var(--mms-text-muted))]" />
                          )}
                        </td>
                        <td className={`px-3 py-2 ${c.changed ? "text-green-600 dark:text-green-400 font-medium" : "text-[hsl(var(--mms-text-muted))]"}`}>
                          {c.new}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer: IP */}
          {log.ipAddress && (
            <p className="text-[11px] text-[hsl(var(--mms-text-muted))] mt-4 font-mono">
              IP: {log.ipAddress}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
