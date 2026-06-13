"use client";

import { CleaningLogResponse } from "@/types/cleaning.types";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface CleaningCardProps {
  log: CleaningLogResponse;
  onEdit: (log: CleaningLogResponse) => void;
  onDelete: (id: string) => void;
}

export function CleaningCard({ log, onEdit, onDelete }: CleaningCardProps) {
  const { data: session } = useSession();
  const [preview, setPreview] = useState<string | null>(null);
  const isOwner = session?.user?.id === log.memberId;
  const canDelete = isOwner || session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

  return (
    <div className="mms-card-hover">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-[hsl(var(--mms-bg-muted))] px-2 py-0.5 rounded-full">
              {log.type.replace("_", " ")}
            </span>
            <span className="text-sm text-[hsl(var(--mms-text-muted))]">{formatDate(log.date)}</span>
          </div>
          <p className="font-medium text-[hsl(var(--mms-text-primary))]">{log.member.name}</p>
          {log.description && (
            <p className="text-sm text-[hsl(var(--mms-text-secondary))] mt-1">{log.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(log)} className="p-1.5 hover:bg-[hsl(var(--mms-bg-muted))] rounded text-[hsl(var(--mms-text-muted))]"><Pencil className="h-3.5 w-3.5" /></button>
          {canDelete && (
            <button onClick={() => onDelete(log.id)} className="p-1.5 hover:bg-red-50 rounded text-[hsl(var(--mms-text-muted))] hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
          )}
        </div>
      </div>
      {log.imageUrls.length > 0 && (
        <div className="flex gap-2 mt-3">
          {log.imageUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setPreview(url)}
            />
          ))}
        </div>
      )}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setPreview(null)}>
          <img src={preview} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}
