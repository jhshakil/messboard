"use client";

import { useState } from "react";
import { useNotesAll, useDeleteNote } from "@/hooks/useNotes";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { NoteForm } from "./NoteForm";
import { NoteResponse } from "@/types/note.types";
import { Plus, Pin, Pencil, Trash2, StickyNote } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function NoteList() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<NoteResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: notes, isLoading } = useNotesAll();
  const deleteNote = useDeleteNote();
  const { data: session } = useSession();

  if (isLoading) return <LoadingSpinner />;

  const pinned = notes?.filter((n) => n.isPinned) ?? [];
  const unpinned = notes?.filter((n) => !n.isPinned) ?? [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mms-section-title">Notes Board</h1>
          <p className="mms-section-subtitle">Shared notes and announcements</p>
        </div>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[hsl(var(--mms-brand-primary))] text-white text-sm font-medium rounded-[var(--mms-radius-md)] hover:bg-[hsl(var(--mms-brand-primary-dark))] transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        )}
      </div>

      {(showForm || editing) && (
        <div className="mb-6">
          <NoteForm
            onClose={() => { setShowForm(false); setEditing(null); }}
            editing={editing}
          />
        </div>
      )}

      {!notes?.length && !showForm ? (
        <EmptyState
          icon={<StickyNote className="h-12 w-12" />}
          title="No notes yet"
          description="Create your first note to share with the group."
        />
      ) : (
        <div className="space-y-4">
          {pinned.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[hsl(var(--mms-text-muted))] uppercase tracking-wider">Pinned</h3>
              {pinned.map((note) => (
                <NoteCard key={note.id} note={note} onEdit={setEditing} onDelete={setDeleteId} session={session} />
              ))}
            </div>
          )}
          {unpinned.length > 0 && (
            <div className="space-y-3">
              {pinned.length > 0 && (
                <h3 className="text-sm font-semibold text-[hsl(var(--mms-text-muted))] uppercase tracking-wider">Others</h3>
              )}
              {unpinned.map((note) => (
                <NoteCard key={note.id} note={note} onEdit={setEditing} onDelete={setDeleteId} session={session} />
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Note"
        description="Are you sure you want to delete this note?"
        onConfirm={() => deleteId && deleteNote.mutate(deleteId)}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  session,
}: {
  note: NoteResponse;
  onEdit: (n: NoteResponse) => void;
  onDelete: (id: string | null) => void;
  session: any;
}) {
  return (
    <div className="mms-card-hover">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {note.isPinned && <Pin className="h-4 w-4 text-[hsl(var(--mms-brand-primary))]" />}
          <h3 className="font-semibold text-[hsl(var(--mms-text-primary))]">{note.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 hover:bg-[hsl(var(--mms-bg-muted))] rounded text-[hsl(var(--mms-text-muted))]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {(session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN" || session?.user?.id === note.memberId) && (
            <button
              onClick={() => onDelete(note.id)}
              className="p-1.5 hover:bg-red-50 rounded text-[hsl(var(--mms-text-muted))] hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-[hsl(var(--mms-text-secondary))] whitespace-pre-wrap">{note.content}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-[hsl(var(--mms-text-muted))]">
        <span>{note.member.name}</span>
        <span>·</span>
        <span>{formatDate(note.updatedAt)}</span>
      </div>
    </div>
  );
}
