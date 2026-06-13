"use client";

import { useState } from "react";
import { useFinanceSummary, useMembersBalance } from "@/hooks/useFinance";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { MonthYearPicker } from "@/components/shared/MonthYearPicker";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ShoppingCart, Banknote, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: summary, isLoading: summaryLoading } = useFinanceSummary(year, month);
  const { data: balances, isLoading: balanceLoading } = useMembersBalance(year, month);

  if (summaryLoading) return <LoadingSpinner />;

  return (
    <div className="mms-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mms-section-title">
            Welcome, {session?.user?.name}
          </h1>
          <p className="mms-section-subtitle">Monthly overview and summary</p>
        </div>
        <MonthYearPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Meals</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalMeals ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meal Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">BDT {summary?.mealRate ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bazar Cost</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">BDT {summary?.totalBazarCost ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fund Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.currentBalance ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              BDT {summary?.currentBalance ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mms-card">
        <h3 className="mms-section-title mb-4">Member Balances</h3>
        {balanceLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="mms-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Total Meals</th>
                  <th>Meal Cost</th>
                  <th>Amount Given</th>
                  <th>Amount Taken</th>
                  <th>Net Balance</th>
                </tr>
              </thead>
              <tbody>
                {balances?.map((b) => (
                  <tr key={b.memberId}>
                    <td className="font-medium">{b.memberName}</td>
                    <td>{b.totalMeals}</td>
                    <td>BDT {b.mealCost}</td>
                    <td className="text-green-600">BDT {b.amountGiven}</td>
                    <td className="text-red-600">BDT {b.amountTaken}</td>
                    <td className={b.netBalance >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      BDT {b.netBalance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
