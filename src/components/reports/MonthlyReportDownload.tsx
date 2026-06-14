"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useSession } from "next-auth/react";
import { MonthYearPicker } from "@/components/shared/MonthYearPicker";
import { Download, User, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { getDaysInMonth, getMonthName } from "@/lib/utils";

export function MonthlyReportDownload() {
  const now = new Date();
  const { data: session } = useSession();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState<"all" | "mine" | null>(null);

  const generatePDF = async (mode: "all" | "mine") => {
    setLoading(mode);
    try {
      const data = await api.get(`/reports/monthly?year=${year}&month=${month}`).then((r) => r.data);

      const userId = session?.user?.id;
      const title = mode === "mine" ? `${session?.user?.name} — Personal Report` : "All Members Report";

      // Filter data for personal report
      const meals = mode === "mine" ? data.meals.filter((m: any) => m.memberId === userId) : data.meals;
      const bazarEntries = mode === "mine" ? data.bazarEntries.filter((b: any) => b.memberId === userId) : data.bazarEntries;
      const transactions = mode === "mine" ? data.transactions.filter((t: any) => t.memberId === userId) : data.transactions;
      const cleaningLogs = mode === "mine" ? data.cleaningLogs.filter((c: any) => c.memberId === userId) : data.cleaningLogs;

      // Recalculate for personal report
      const totalMeals = meals.reduce((s: number, m: any) => s + m.mealCount, 0);
      const totalBazarSpent = bazarEntries.reduce((s: number, b: any) => s + b.amount, 0);
      const totalGiven = transactions.filter((t: any) => t.type === "GIVE").reduce((s: number, t: any) => s + t.amount, 0);
      const totalTaken = transactions.filter((t: any) => t.type === "TAKE").reduce((s: number, t: any) => s + t.amount, 0);

      const doc = new jsPDF({ orientation: "landscape" });
      const pageW = doc.internal.pageSize.width;
      const margin = 12;
      const tableMargin = { top: 24, right: margin, bottom: 10, left: margin };

      // ── Page header (drawn on every page) ──
      const drawHeader = () => {
        doc.setFontSize(16);
        doc.setTextColor(30, 100, 220);
        doc.text("MessBoard", margin, 10);
        doc.setFontSize(9);
        doc.setTextColor(130);
        doc.text(`${getMonthName(month)} ${year} — ${title}`, pageW - margin, 10, { align: "right" });
        doc.setDrawColor(220);
        doc.line(margin, 14, pageW - margin, 14);
      };

      // ── Summary ──
      let summaryHead: string[];
      let summaryBody: string[][];

      if (mode === "mine") {
        const myMealCost = Math.round(totalMeals * data.mealRate * 100) / 100;
        const myBalance = Math.round((totalGiven + totalBazarSpent - myMealCost - totalTaken) * 100) / 100;
        const statusText = myBalance >= 0
          ? `You get back BDT ${myBalance}`
          : `You need to pay BDT ${Math.abs(myBalance)}`;

        summaryHead = ["My Meals", "Meal Rate", "Meal Cost", "My Bazar", "Status"];
        summaryBody = [[
          String(totalMeals),
          `BDT ${data.mealRate}`,
          `BDT ${myMealCost}`,
          `BDT ${totalBazarSpent}`,
          statusText,
        ]];
      } else {
        summaryHead = ["Total Meals", "Meal Rate", "Total Bazar Cost"];
        summaryBody = [[
          String(data.totalMeals),
          `BDT ${data.mealRate}`,
          `BDT ${data.totalBazarCost}`,
        ]];
      }

      autoTable(doc, {
        head: [summaryHead],
        body: summaryBody,
        startY: 18,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [30, 100, 220], textColor: 255 },
        margin: { left: margin, right: margin },
        didDrawPage: drawHeader,
      });

      // ── Member Balances (full report only) ──
      if (mode === "all") {
        const memberBalances: string[][] = [];
        const allMeals = data.meals as any[];
        const allBazar = data.bazarEntries as any[];
        const allTransactions = data.transactions as any[];
        const allMembers = data.members as any[];

        for (const member of allMembers) {
          // Hide superadmin from non-superadmin reports
          if (member.role === "SUPERADMIN") continue;
          const memberMeals = allMeals.filter((m: any) => m.memberId === member.id);
          const memberBazar = allBazar.filter((b: any) => b.memberId === member.id);
          const memberTxs = allTransactions.filter((t: any) => t.memberId === member.id);
          const mTotal = memberMeals.reduce((s: number, m: any) => s + m.mealCount, 0);
          const mCost = Math.round(mTotal * data.mealRate * 100) / 100;
          const mBazar = memberBazar.reduce((s: number, b: any) => s + b.amount, 0);
          const mGiven = memberTxs.filter((t: any) => t.type === "GIVE").reduce((s: number, t: any) => s + t.amount, 0);
          const mTaken = memberTxs.filter((t: any) => t.type === "TAKE").reduce((s: number, t: any) => s + t.amount, 0);
          const mBalance = Math.round((mGiven + mBazar - mCost - mTaken) * 100) / 100;

          memberBalances.push([
            member.name,
            String(mTotal),
            `BDT ${mCost}`,
            `BDT ${mBazar}`,
            `BDT ${mBalance}`,
          ]);
        }

        autoTable(doc, {
          head: [["Member", "Meals", "Meal Cost", "Bazar", "Balance"]],
          body: memberBalances,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [34, 197, 94], textColor: 255 },
          margin: tableMargin,
          didDrawPage: drawHeader,
        });
      }

      // ── Meals ──
      const mealsByMember = new Map<string, { name: string; meals: Record<number, number> }>();
      const daysInMonth = getDaysInMonth(year, month);

      for (const meal of meals) {
        const day = new Date(meal.date).getDate();
        if (!mealsByMember.has(meal.memberId)) {
          mealsByMember.set(meal.memberId, { name: meal.member.name, meals: {} });
        }
        mealsByMember.get(meal.memberId)!.meals[day] = meal.mealCount;
      }

      const mealHead = ["Member", ...Array.from({ length: daysInMonth }, (_, i) => String(i + 1)), "Total"];
      const mealBody: string[][] = [];
      let grandTotal = 0;

      for (const [, member] of mealsByMember) {
        let total = 0;
        const row = [member.name];
        for (let d = 1; d <= daysInMonth; d++) {
          const count = member.meals[d] ?? 0;
          total += count;
          row.push(count ? String(count) : "");
        }
        grandTotal += total;
        row.push(String(total));
        mealBody.push(row);
      }

      const dailyTotals = ["Daily Total"];
      for (let d = 1; d <= daysInMonth; d++) {
        let daySum = 0;
        for (const [, member] of mealsByMember) daySum += member.meals[d] ?? 0;
        dailyTotals.push(daySum ? String(daySum) : "");
      }
      dailyTotals.push(String(grandTotal));
      mealBody.push(dailyTotals);

      autoTable(doc, {
        head: [mealHead],
        body: mealBody,
        theme: "striped",
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [30, 100, 220], textColor: 255 },
        footStyles: { fillColor: [240, 240, 240], fontStyle: "bold" },
        margin: tableMargin,
        didDrawPage: drawHeader,
      });

      // ── Bazar ──
      if (bazarEntries.length > 0) {
        autoTable(doc, {
          head: [["Date", "Member", "Amount (BDT)", "Description"]],
          body: bazarEntries.map((b: any) => [
            new Date(b.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
            b.member.name, `BDT ${b.amount}`, b.description || "-",
          ]),
          theme: "striped",
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [30, 100, 220], textColor: 255 },
          margin: tableMargin,
          didDrawPage: drawHeader,
        });
      }

      // ── Finance ──
      if (transactions.length > 0) {
        autoTable(doc, {
          head: [["Date", "Member", "Type", "Amount (BDT)", "Description"]],
          body: transactions.map((t: any) => [
            new Date(t.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
            t.member.name, t.type, `BDT ${t.amount}`, t.description || "-",
          ]),
          theme: "striped",
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [30, 100, 220], textColor: 255 },
          margin: tableMargin,
          didDrawPage: drawHeader,
        });
      }

      // ── Cleaning ──
      if (cleaningLogs.length > 0) {
        autoTable(doc, {
          head: [["Date", "Type", "Member", "Description"]],
          body: cleaningLogs.map((c: any) => [
            new Date(c.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
            c.type.replace("_", " "), c.member.name, c.description || "-",
          ]),
          theme: "striped",
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [30, 100, 220], textColor: 255 },
          margin: tableMargin,
          didDrawPage: drawHeader,
        });
      }

      // ── Footer ──
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(180);
        doc.text(
          `Generated: ${new Date().toLocaleString()} — Page ${i} of ${pageCount}`,
          pageW / 2, doc.internal.pageSize.height - 6, { align: "center" }
        );
      }

      const suffix = mode === "mine" ? "personal" : "full";
      doc.save(`messboard-report-${year}-${String(month).padStart(2, "0")}-${suffix}.pdf`);
      toast.success("PDF report downloaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mms-section-title">Monthly Reports</h1>
          <p className="mms-section-subtitle">Download monthly summary as PDF</p>
        </div>
        <MonthYearPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mms-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[hsl(var(--mms-text-primary))]">My Report</h3>
              <p className="text-xs text-[hsl(var(--mms-text-muted))]">Only your meals, bazar & transactions</p>
            </div>
          </div>
          <button
            onClick={() => generatePDF("mine")}
            disabled={loading !== null}
            className="w-full py-2.5 bg-[hsl(var(--mms-brand-primary))] text-white text-sm font-medium rounded-[var(--mms-radius-md)] hover:bg-[hsl(var(--mms-brand-primary-dark))] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "mine" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download My Report
          </button>
        </div>

        <div className="mms-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[hsl(var(--mms-text-primary))]">Full Report</h3>
              <p className="text-xs text-[hsl(var(--mms-text-muted))]">All members meals, bazar & transactions</p>
            </div>
          </div>
          <button
            onClick={() => generatePDF("all")}
            disabled={loading !== null}
            className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-[var(--mms-radius-md)] hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download Full Report
          </button>
        </div>
      </div>
    </>
  );
}
