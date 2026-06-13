"use client";

import { useReducer } from "react";
import { useFinanceMonthly, useFinanceSummary, useMembersBalance, useDeleteTransaction } from "@/hooks/useFinance";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MonthYearPicker } from "@/components/shared/MonthYearPicker";
import { MemberBalanceCard } from "./MemberBalanceCard";
import { TransactionForm } from "./TransactionForm";
import { TransactionResponse } from "@/types/finance.types";
import { Plus, Banknote, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";

type State = {
  year: number;
  month: number;
  showForm: boolean;
  editing: TransactionResponse | null;
  deleteId: string | null;
};

type Action =
  | { type: "SET_YEAR_MONTH"; year: number; month: number }
  | { type: "OPEN_FORM" }
  | { type: "CLOSE_FORM" }
  | { type: "START_EDIT"; entry: TransactionResponse; closeForm?: boolean }
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
      return { ...state, editing: action.entry, showForm: action.closeForm ? false : state.showForm };
    case "SET_DELETE":
      return { ...state, deleteId: action.id };
    default:
      return state;
  }
}

export function FinanceSummary() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { year, month, showForm, editing, deleteId } = state;

  const { data: transactions, isLoading } = useFinanceMonthly(year, month);
  const { data: summary } = useFinanceSummary(year, month);
  const { data: balances, isLoading: balanceLoading } = useMembersBalance(year, month);
  const deleteTransaction = useDeleteTransaction();
  const { data: session } = useSession();

  const canDelete = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mms-section-title">Finance & Money</h1>
          <p className="mms-section-subtitle">Fund tracking and member balances</p>
        </div>
        <MonthYearPicker
          year={year}
          month={month}
          onChange={(y, m) => dispatch({ type: "SET_YEAR_MONTH", year: y, month: m })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="mms-stat-card">
          <span className="mms-stat-label">Fund Collected</span>
          <span className="mms-stat-value-green">BDT {summary?.totalFundCollected ?? 0}</span>
        </div>
        <div className="mms-stat-card">
          <span className="mms-stat-label">Bazar Cost</span>
          <span className="mms-stat-value-red">BDT {summary?.totalBazarCost ?? 0}</span>
        </div>
        <div className="mms-stat-card">
          <span className="mms-stat-label">Meal Rate</span>
          <span className="mms-stat-value">BDT {summary?.mealRate ?? 0}</span>
        </div>
        <div className="mms-stat-card">
          <span className="mms-stat-label">Current Balance</span>
          <span className={(summary?.currentBalance ?? 0) >= 0 ? "mms-stat-value-green" : "mms-stat-value-red"}>
            BDT {summary?.currentBalance ?? 0}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mms-section-title mb-4">Member Balances</h3>
        {balanceLoading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {balances?.map((b) => (
              <MemberBalanceCard key={b.memberId} balance={b} />
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="mms-section-title">Transactions</h3>
          {!showForm && !editing && (
            <button
              onClick={() => dispatch({ type: "OPEN_FORM" })}
              className="px-4 py-2 bg-[hsl(var(--mms-brand-primary))] text-white text-sm font-medium rounded-[var(--mms-radius-md)] hover:bg-[hsl(var(--mms-brand-primary-dark))] transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>
          )}
        </div>

        {(showForm || editing) && (
          <div className="mb-4">
            <TransactionForm
              onClose={() => dispatch({ type: "CLOSE_FORM" })}
              editing={editing}
            />
          </div>
        )}

        {!transactions?.length ? (
          <EmptyState
            icon={<Banknote className="h-12 w-12" />}
            title="No transactions yet"
            description="Record GIVE/TAKE transactions to track fund flow."
          />
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="mms-card-hover flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-2 py-1 rounded-[var(--mms-radius-sm)] text-xs font-semibold ${
                    t.type === "GIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {t.type}
                  </span>
                  <div>
                    <p className="font-medium text-[hsl(var(--mms-text-primary))]">{t.member.name}</p>
                    <p className="text-xs text-[hsl(var(--mms-text-muted))]">
                      {formatDate(t.date)}
                      {t.description && ` — ${t.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${t.type === "GIVE" ? "text-green-600" : "text-red-600"}`}>
                    BDT {t.amount}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => dispatch({ type: "START_EDIT", entry: t, closeForm: true })}
                      className="p-1.5 hover:bg-[hsl(var(--mms-bg-muted))] rounded-lg text-[hsl(var(--mms-text-muted))]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => dispatch({ type: "SET_DELETE", id: t.id })}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-[hsl(var(--mms-text-muted))] hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => dispatch({ type: "SET_DELETE", id: null })}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction?"
        onConfirm={() => deleteId && deleteTransaction.mutate(deleteId)}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
