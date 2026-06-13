"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCleaningSchema, CreateCleaningFormValues } from "@/validations/cleaning.schema";
import { useCreateCleaning, useUpdateCleaning } from "@/hooks/useCleaning";
import { useMembersAll } from "@/hooks/useMembers";
import { ImageKitUpload } from "./ImageKitUpload";
import { Loader2 } from "lucide-react";
import { CleaningType } from "@prisma/client";
import { CleaningLogResponse } from "@/types/cleaning.types";

interface CleaningAddFormProps {
  onClose: () => void;
  editing?: CleaningLogResponse | null;
}

const CLEANING_TYPES: CleaningType[] = ["DINING", "WASHROOM", "KITCHEN", "COMMON_AREA", "OTHER"];

export function CleaningAddForm({ onClose, editing }: CleaningAddFormProps) {
  const createCleaning = useCreateCleaning();
  const updateCleaning = useUpdateCleaning();
  const { data: members } = useMembersAll();
  const [images, setImages] = useState<{ url: string; name: string }[]>(
    editing?.imageUrls?.map((u) => ({ url: u, name: u.split("/").pop() || "image" })) ?? []
  );

  const { register, handleSubmit, formState: { errors } } = useForm<CreateCleaningFormValues>({
    resolver: zodResolver(createCleaningSchema),
    defaultValues: editing ? {
      date: editing.date.split("T")[0],
      memberId: editing.memberId,
      type: editing.type,
      description: editing.description ?? "",
    } : {
      date: new Date().toISOString().split("T")[0],
      memberId: "",
      type: "DINING",
      description: "",
    },
  });

  const isLoading = createCleaning.isPending || updateCleaning.isPending;

  const onSubmit = async (data: CreateCleaningFormValues) => {
    const payload = { ...data, imageUrls: images.map((i) => i.url).filter(Boolean) };
    if (editing) {
      await updateCleaning.mutateAsync({ id: editing.id, data: payload });
    } else {
      await createCleaning.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mms-card space-y-4">
      <h3 className="mms-section-title">{editing ? "Edit Cleaning Log" : "Add Cleaning Log"}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">Date</label>
          <input type="date" {...register("date")} className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">Member</label>
          <select {...register("memberId")} className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm">
            <option value="">Select member...</option>
            {members?.filter(m => m.isActive).map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {errors.memberId && <p className="text-xs text-red-500 mt-1">{errors.memberId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">Type</label>
          <select {...register("type")} className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm">
            {CLEANING_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">Description</label>
          <input type="text" {...register("description")} placeholder="Optional..." className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm" />
        </div>
      </div>

      <ImageKitUpload images={images} onChange={setImages} />

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[hsl(var(--mms-text-secondary))] hover:bg-[hsl(var(--mms-bg-muted))] rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--mms-brand-primary))] hover:bg-[hsl(var(--mms-brand-primary-dark))] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {editing ? "Update" : "Add Log"}
        </button>
      </div>
    </form>
  );
}
