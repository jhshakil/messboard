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
        <p className="text-sm text-[hsl(var(--mms-text-muted))]">
          {balance.totalMeals} meals × BDT {balance.mealCost > 0 ? (balance.mealCost / (balance.totalMeals || 1)).toFixed(2) : "0"} = BDT {balance.mealCost}
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
