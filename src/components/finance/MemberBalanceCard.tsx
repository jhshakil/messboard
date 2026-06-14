import { MemberBalance } from "@/types/finance.types";
import { cn } from "@/lib/utils";

interface MemberBalanceCardProps {
  balance: MemberBalance;
}

export function MemberBalanceCard({ balance }: MemberBalanceCardProps) {
  const isPositive = balance.netBalance >= 0;

  return (
    <div className="mms-card-hover flex items-center justify-between">
      <div>
        <p className="font-medium text-[hsl(var(--mms-text-primary))]">{balance.memberName}</p>
        <p className="text-xs text-[hsl(var(--mms-text-muted))]">
          {balance.totalMeals > 0 && (
            <span>{balance.totalMeals} meals × BDT {(balance.mealCost / balance.totalMeals).toFixed(2)} = BDT {balance.mealCost}</span>
          )}
          {balance.totalMeals > 0 && balance.bazarSpent > 0 && <span> | </span>}
          {balance.bazarSpent > 0 && (
            <span className="text-green-600">Bazar spent BDT {balance.bazarSpent}</span>
          )}
          {balance.totalMeals === 0 && balance.bazarSpent === 0 && <span>No activity</span>}
        </p>
      </div>
      <div className="text-right">
        <p className={cn(
          "text-lg font-bold",
          isPositive ? "text-green-600" : "text-red-600"
        )}>
          BDT {balance.netBalance}
        </p>
        <p className="text-xs text-[hsl(var(--mms-text-muted))]">
          {isPositive ? "Credit" : "Owes"}
        </p>
      </div>
    </div>
  );
}
