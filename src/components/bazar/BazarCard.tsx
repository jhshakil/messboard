import { formatDate, formatCurrency } from "@/lib/utils";
import { BazarResponse } from "@/types/bazar.types";
import { Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface BazarCardProps {
  entry: BazarResponse;
  onEdit: (entry: BazarResponse) => void;
  onDelete: (id: string) => void;
}

export function BazarCard({ entry, onEdit, onDelete }: BazarCardProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === entry.memberId;
  const canDelete = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN" || isOwner;

  return (
    <div className="mms-card-hover flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-[hsl(var(--mms-text-muted))]">{formatDate(entry.date)}</span>
          <span className="text-xs bg-[hsl(var(--mms-bg-muted))] px-2 py-0.5 rounded-full">
            {entry.member.name}
          </span>
        </div>
        <p className="text-lg font-semibold text-[hsl(var(--mms-text-primary))]">
          {formatCurrency(entry.amount)}
        </p>
        {entry.description && (
          <p className="text-sm text-[hsl(var(--mms-text-secondary))] mt-0.5 truncate">
            {entry.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(entry)}
          className="p-2 hover:bg-[hsl(var(--mms-bg-muted))] rounded-lg text-[hsl(var(--mms-text-muted))] hover:text-[hsl(var(--mms-brand-primary))] transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
        {canDelete && (
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 hover:bg-red-50 rounded-lg text-[hsl(var(--mms-text-muted))] hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
