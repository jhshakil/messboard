"use client";

import { useState, useRef, useCallback } from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShieldCheck, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AuditLogDetail } from "./AuditLogDetail";
import type { AuditLogResponse } from "@/types/audit.types";

const ITEMS_PER_PAGE = 20;
const actionOptions = [
  "CREATE_MEAL", "UPDATE_MEAL", "DELETE_MEAL",
  "CREATE_BAZAR", "UPDATE_BAZAR", "DELETE_BAZAR",
  "CREATE_TRANSACTION", "UPDATE_TRANSACTION", "DELETE_TRANSACTION",
  "CREATE_CLEANING", "UPDATE_CLEANING", "DELETE_CLEANING",
  "CREATE_NOTE", "UPDATE_NOTE", "DELETE_NOTE",
  "CHANGE_ROLE", "RESET_PASSWORD",
];
const entityOptions = ["Meal", "BazarEntry", "Transaction", "CleaningLog", "Note", "User"];

function IPCountry({ ip }: { ip: string | null }) {
  const [country, setCountry] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (!ip) return <>—</>;

  // Lazy-load country on mount
  if (!loaded) {
    setLoaded(true);
    fetch(`https://ipapi.co/${ip}/country_name/`)
      .then((r) => r.text())
      .then((t) => {
        if (t && t !== "Undefined" && !t.startsWith("{")) setCountry(t);
      })
      .catch(() => {});
  }

  return (
    <span className="text-xs flex items-center gap-1">
      <span className="font-mono text-[hsl(var(--mms-text-muted))]">{ip}</span>
      {country && (
        <span className="text-[hsl(var(--mms-brand-primary))] font-medium">
          ({country})
        </span>
      )}
    </span>
  );
}

export function AuditLogTable() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  }, []);

  const { data, isLoading } = useAuditLogs({
    page,
    limit: ITEMS_PER_PAGE,
    action: actionFilter || undefined,
    entityType: entityFilter || undefined,
    search: debouncedSearch || undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const startItem = total === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, total);

  const resetPage = (fn: () => void) => { fn(); setPage(1); };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mms-section-title">Audit Logs</h1>
          <p className="mms-section-subtitle">Track all system activity</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mms-card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--mms-text-muted))]" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by user name..."
              className="w-full pl-9 pr-4 py-2 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
            />
          </div>

          {/* Date From */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-[hsl(var(--mms-text-muted))]">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-[hsl(var(--mms-text-muted))]">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => resetPage(() => setActionFilter(e.target.value))}
            className="px-3 py-2 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
          >
            <option value="">All Actions</option>
            {actionOptions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => resetPage(() => setEntityFilter(e.target.value))}
            className="px-3 py-2 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm"
          >
            <option value="">All Entities</option>
            {entityOptions.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <EmptyState icon={<ShieldCheck className="h-12 w-12" />} title="No audit logs found" description="Try adjusting your filters" />
      ) : (
        <>
          <div className="mms-card overflow-x-auto">
            <table className="mms-table">
              <thead>
                <tr>
                  <th>Date / Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>IP / Country</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="cursor-pointer hover:bg-[hsl(var(--mms-bg-muted))] transition-colors"
                  >
                    <td className="text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="font-medium">{log.user.name}</td>
                    <td>
                      <span className="inline-flex px-2 py-0.5 bg-[hsl(var(--mms-bg-muted))] rounded text-xs font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="text-sm">
                      {log.entityType}
                      {log.entityId ? <span className="text-[hsl(var(--mms-text-muted))]"> #{log.entityId.slice(0, 8)}</span> : ""}
                    </td>
                    <td>
                      <IPCountry ip={log.ipAddress} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-[hsl(var(--mms-text-muted))]">
              Showing {startItem}–{endItem} of {total}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-[hsl(var(--mms-bg-muted))] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-2 text-sm text-[hsl(var(--mms-text-muted))]">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-[hsl(var(--mms-brand-primary))] text-white"
                        : "hover:bg-[hsl(var(--mms-bg-muted))] text-[hsl(var(--mms-text-secondary))]"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-2 rounded-lg hover:bg-[hsl(var(--mms-bg-muted))] disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
      <AuditLogDetail
        log={selectedLog}
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </>
  );
}
