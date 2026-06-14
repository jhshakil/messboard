"use client";

import { useReducer } from "react";
import { useCleaningAll, useDeleteCleaning } from "@/hooks/useCleaning";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MonthYearPicker } from "@/components/shared/MonthYearPicker";
import { CleaningAddForm } from "./CleaningAddForm";
import { CleaningCard } from "./CleaningCard";
import { CleaningLogResponse } from "@/types/cleaning.types";
import { Plus, SprayCan } from "lucide-react";
import { CleaningType } from "@prisma/client";

type State = {
  year: number;
  month: number;
  showForm: boolean;
  editing: CleaningLogResponse | null;
  deleteId: string | null;
  filterType: string;
};

type Action =
  | { type: "SET_YEAR_MONTH"; year: number; month: number }
  | { type: "OPEN_FORM" }
  | { type: "CLOSE_FORM" }
  | { type: "START_EDIT"; entry: CleaningLogResponse }
  | { type: "SET_DELETE"; id: string | null }
  | { type: "SET_FILTER"; filterType: string };

const now = new Date();
const initialState: State = {
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  showForm: false,
  editing: null,
  deleteId: null,
  filterType: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_YEAR_MONTH":
      return { ...state, year: action.year, month: action.month };
    case "OPEN_FORM":
      return { ...state, showForm: true, editing: null };
    case "CLOSE_FORM":
      return { ...state, showForm: false, editing: null };
    case "START_EDIT":
      return { ...state, editing: action.entry, showForm: false };
    case "SET_DELETE":
      return { ...state, deleteId: action.id };
    case "SET_FILTER":
      return { ...state, filterType: action.filterType };
    default:
      return state;
  }
}

const TYPES: CleaningType[] = ["DINING", "WASHROOM", "KITCHEN", "COMMON_AREA", "OTHER"];

export function CleaningLogList() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { year, month, showForm, editing, deleteId, filterType } = state;

  const { data: logs, isLoading } = useCleaningAll({ year, month, type: filterType || undefined });
  const deleteCleaning = useDeleteCleaning();

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="mms-section-title">Cleaning Log</h1>
          <p className="mms-section-subtitle">Track cleaning duties with photos</p>
        </div>
        <MonthYearPicker
          year={year}
          month={month}
          onChange={(y, m) => dispatch({ type: "SET_YEAR_MONTH", year: y, month: m })}
        />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => dispatch({ type: "SET_FILTER", filterType: e.target.value })}
          className="px-4 py-2 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-card))] text-sm"
        >
          <option value="">All Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t.replace("_", " ")}</option>
          ))}
        </select>
        {!showForm && !editing && (
          <button
            onClick={() => dispatch({ type: "OPEN_FORM" })}
            className="px-4 py-2 bg-[hsl(var(--mms-brand-primary))] text-white text-sm font-medium rounded-[var(--mms-radius-md)] hover:bg-[hsl(var(--mms-brand-primary-dark))] transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Log
          </button>
        )}
      </div>

      {(showForm || editing) && (
        <div className="mb-6">
          <CleaningAddForm
            onClose={() => dispatch({ type: "CLOSE_FORM" })}
            editing={editing}
          />
        </div>
      )}

      {!logs?.length ? (
        <EmptyState icon={<SprayCan className="h-12 w-12" />} title="No cleaning logs" description="Start tracking cleaning duties." />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <CleaningCard
              key={log.id}
              log={log}
              onEdit={(e) => dispatch({ type: "START_EDIT", entry: e })}
              onDelete={(id) => dispatch({ type: "SET_DELETE", id })}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => dispatch({ type: "SET_DELETE", id: null })}
        title="Delete Cleaning Log"
        description="Are you sure you want to delete this cleaning log?"
        onConfirm={() => deleteId && deleteCleaning.mutate(deleteId)}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
