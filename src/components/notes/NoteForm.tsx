"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createNoteSchema, CreateNoteFormValues } from "@/validations/note.schema";
import { useCreateNote, useUpdateNote } from "@/hooks/useNotes";
import { Loader2 } from "lucide-react";
import { NoteResponse } from "@/types/note.types";

interface NoteFormProps {
  onClose: () => void;
  editing?: NoteResponse | null;
}

export function NoteForm({ onClose, editing }: NoteFormProps) {
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateNoteFormValues>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: editing ? {
      title: editing.title,
      content: editing.content,
      isPinned: editing.isPinned,
    } : {
      title: "",
      content: "",
      isPinned: false,
    },
  });

  const isLoading = createNote.isPending || updateNote.isPending;

  const onSubmit = async (data: CreateNoteFormValues) => {
    if (editing) {
      await updateNote.mutateAsync({ id: editing.id, data });
    } else {
      await createNote.mutateAsync(data);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mms-card space-y-4">
      <h3 className="mms-section-title">{editing ? "Edit Note" : "New Note"}</h3>

      <div>
        <input
          type="text"
          {...register("title")}
          placeholder="Note title"
          className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm font-medium"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <textarea
          {...register("content")}
          placeholder="Write your note here..."
          rows={5}
          className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm resize-none"
        />
        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register("isPinned")} className="rounded" />
        <span className="text-sm text-[hsl(var(--mms-text-secondary))]">Pin this note</span>
      </label>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-[hsl(var(--mms-text-secondary))] hover:bg-[hsl(var(--mms-bg-muted))] rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--mms-brand-primary))] hover:bg-[hsl(var(--mms-brand-primary-dark))] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {editing ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
