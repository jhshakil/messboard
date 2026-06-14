"use client";

import { X } from "lucide-react";
import type { AuditLogResponse } from "@/types/audit.types";

interface AuditLogDetailProps {
  log: AuditLogResponse | null;
  open: boolean;
  onClose: () => void;
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function DiffSection({
  label,
  oldVal,
  newVal,
}: {
  label: string;
  oldVal: unknown;
  newVal: unknown;
}) {
  const oldStr = renderValue(oldVal);
  const newStr = renderValue(newVal);

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-[hsl(var(--mms-text-muted))] uppercase tracking-wide mb-2">
        {label}
      </p>
      {oldStr === newStr || oldStr === "—" ? (
        <div className="bg-[hsl(var(--mms-bg-page))] rounded-lg p-3 border border-[hsl(var(--mms-border-default))]">
          <pre className="text-xs font-mono whitespace-pre-wrap break-all text-[hsl(var(--mms-brand-primary))]">
            {newStr}
          </pre>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase mb-1">
              Before
            </p>
            <pre className="text-xs font-mono whitespace-pre-wrap break-all text-red-700 dark:text-red-300 line-through">
              {oldStr}
            </pre>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <p className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase mb-1">
              After
            </p>
            <pre className="text-xs font-mono whitespace-pre-wrap break-all text-green-700 dark:text-green-300">
              {newStr}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export function AuditLogDetail({ log, open, onClose }: AuditLogDetailProps) {
  if (!open || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[hsl(var(--mms-bg-card))] rounded-[var(--mms-radius-lg)] shadow-[var(--mms-shadow-lg)] max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-[hsl(var(--mms-bg-card))] border-b border-[hsl(var(--mms-border-default))] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[hsl(var(--mms-text-primary))]">
              Activity Detail
            </h3>
            <p className="text-sm text-[hsl(var(--mms-text-muted))] mt-0.5">
              {log.action.replace(/_/g, " ")} on {log.entityType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[hsl(var(--mms-bg-muted))] text-[hsl(var(--mms-text-muted))]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* User & Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-[hsl(var(--mms-text-muted))]">Performed by</p>
              <p className="text-sm font-medium text-[hsl(var(--mms-text-primary))]">
                {log.user.name}
              </p>
              <p className="text-xs text-[hsl(var(--mms-text-muted))]">{log.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--mms-text-muted))]">Date & Time</p>
              <p className="text-sm font-medium text-[hsl(var(--mms-text-primary))]">
                {new Date(log.createdAt).toLocaleString()}
              </p>
              {log.ipAddress && (
                <p className="text-xs text-[hsl(var(--mms-text-muted))] font-mono">
                  IP: {log.ipAddress}
                </p>
              )}
            </div>
          </div>

          {/* Changes */}
          {log.oldValue || log.newValue ? (
            <DiffSection
              label="Changes"
              oldVal={log.oldValue}
              newVal={log.newValue}
            />
          ) : (
            <p className="text-sm text-[hsl(var(--mms-text-muted))] italic">
              No detail data available for this action.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
