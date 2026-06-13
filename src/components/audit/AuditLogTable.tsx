"use client";

import { useState } from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function AuditLogTable() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const { data, isLoading } = useAuditLogs({
    page,
    limit: 20,
    action: actionFilter || undefined,
    entityType: entityFilter || undefined,
  });

  if (isLoading) return <LoadingSpinner />;

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mms-section-title">Audit Logs</h1>
          <p className="mms-section-subtitle">Track all system activity</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-card))] text-sm"
        >
          <option value="">All Actions</option>
          <option value="CREATE_MEAL">CREATE_MEAL</option>
          <option value="UPDATE_MEAL">UPDATE_MEAL</option>
          <option value="DELETE_MEAL">DELETE_MEAL</option>
          <option value="CREATE_BAZAR">CREATE_BAZAR</option>
          <option value="UPDATE_BAZAR">UPDATE_BAZAR</option>
          <option value="DELETE_BAZAR">DELETE_BAZAR</option>
          <option value="CREATE_TRANSACTION">CREATE_TRANSACTION</option>
          <option value="CHANGE_ROLE">CHANGE_ROLE</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-card))] text-sm"
        >
          <option value="">All Entities</option>
          <option value="Meal">Meal</option>
          <option value="BazarEntry">BazarEntry</option>
          <option value="Transaction">Transaction</option>
          <option value="CleaningLog">CleaningLog</option>
          <option value="Note">Note</option>
          <option value="User">User</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={<ShieldCheck className="h-12 w-12" />} title="No audit log found" />
      ) : (
        <>
          <div className="mms-card overflow-x-auto">
            <table className="mms-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-xs">{formatDate(log.createdAt)}</td>
                    <td>{log.user.name}</td>
                    <td>
                      <span className="inline-flex px-2 py-0.5 bg-[hsl(var(--mms-bg-muted))] rounded text-xs font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entityType}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}</td>
                    <td className="text-xs font-mono">{log.ipAddress ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-[hsl(var(--mms-text-muted))]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
