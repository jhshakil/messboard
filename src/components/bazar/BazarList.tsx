"use client";

import { useReducer } from "react";
import { useBazarMonthly, useDeleteBazar } from "@/hooks/useBazar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MonthYearPicker } from "@/components/shared/MonthYearPicker";
import { BazarCard } from "./BazarCard";
import { BazarAddForm } from "./BazarAddForm";
import { BazarResponse } from "@/types/bazar.types";
import { Plus, ShoppingCart } from "lucide-react";

type State = {
  year: number;
  month: number;
  showForm: boolean;
  editing: BazarResponse | null;
  deleteId: string | null;
};

type Action =
  | { type: "SET_YEAR_MONTH"; year: number; month: number }
  | { type: "OPEN_FORM" }
  | { type: "CLOSE_FORM" }
  | { type: "START_EDIT"; entry: BazarResponse }
  | { type: "SET_DELETE"; id: string | null };

const now = new Date();
const initialState: State = {
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  showForm: false,
  editing: null,
  deleteId: null,
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
    default:
      return state;
  }
}

export function BazarList() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { year, month, showForm, editing, deleteId } = state;

  const { data: entries, isLoading } = useBazarMonthly(year, month);
  const deleteBazar = useDeleteBazar();

  if (isLoading) return <LoadingSpinner />;

  const total = entries?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mms-section-title">Bazar Management</h1>
          <p className="mms-section-subtitle">Grocery and expense tracking</p>
        </div>
        <MonthYearPicker
          year={year}
          month={month}
          onChange={(y, m) => dispatch({ type: "SET_YEAR_MONTH", year: y, month: m })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="mms-stat-card">
          <span className="mms-stat-label">Monthly Total</span>
          <span className="mms-stat-value">BDT {total.toFixed(0)}</span>
        </div>
        <div className="mms-stat-card">
          <span className="mms-stat-label">Entries</span>
          <span className="mms-stat-value">{entries?.length ?? 0}</span>
        </div>
        <div className="mms-stat-card">
          <span className="mms-stat-label">Avg per Entry</span>
          <span className="mms-stat-value">
            BDT {entries?.length ? (total / entries.length).toFixed(0) : "0"}
          </span>
        </div>
      </div>

      {!showForm && !editing && (
        <button
          onClick={() => dispatch({ type: "OPEN_FORM" })}
          className="mb-6 px-4 py-2.5 bg-[hsl(var(--mms-brand-primary))] text-white text-sm font-medium rounded-[var(--mms-radius-md)] hover:bg-[hsl(var(--mms-brand-primary-dark))] transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Bazar Entry
        </button>
      )}

      {(showForm || editing) && (
        <div className="mb-6">
          <BazarAddForm
            onClose={() => dispatch({ type: "CLOSE_FORM" })}
            editing={editing}
          />
        </div>
      )}

      {!entries?.length ? (
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="No bazar entries yet"
          description="Add your first grocery entry to start tracking expenses."
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <BazarCard
              key={entry.id}
              entry={entry}
              onEdit={(e) => dispatch({ type: "START_EDIT", entry: e })}
              onDelete={(id) => dispatch({ type: "SET_DELETE", id })}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => dispatch({ type: "SET_DELETE", id: null })}
        title="Delete Bazar Entry"
        description="Are you sure you want to delete this bazar entry? This action cannot be undone."
        onConfirm={() => deleteId && deleteBazar.mutate(deleteId)}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
