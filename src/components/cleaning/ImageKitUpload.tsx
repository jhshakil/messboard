"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImagePlus, Trash2, AlertCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

interface ImageKitUploadProps {
  images: { url: string; name: string; fileId?: string; uploading?: boolean; error?: string }[];
  onChange: (images: { url: string; name: string; fileId?: string }[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageKitUpload({
  images,
  onChange,
  maxImages = 5,
  maxSizeMB = 10,
}: ImageKitUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<{ url: string; name: string; fileId: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "cleaning");

    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { url: res.data.url, name: res.data.name, fileId: res.data.fileId };
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      if (images.filter((i) => !i.error).length + fileArr.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const oversized = fileArr.filter((f) => f.size > maxSizeMB * 1024 * 1024);
      if (oversized.length > 0) {
        toast.error(`Each file must be under ${maxSizeMB}MB`);
        return;
      }

      const nonImage = fileArr.filter((f) => !f.type.startsWith("image/"));
      if (nonImage.length > 0) {
        toast.error("Only image files are allowed");
        return;
      }

      const newEntries = fileArr.map((f) => ({
        url: "",
        name: f.name,
        uploading: true,
      }));

      const currentImages = images.filter((i) => !i.error && i.url !== "") as {
        url: string;
        name: string;
        fileId?: string;
      }[];
      onChange([...currentImages, ...newEntries]);

      const results: { url: string; name: string; fileId?: string }[] = [];
      for (const [idx, file] of fileArr.entries()) {
        try {
          const result = await uploadFile(file);
          results.push(result);
        } catch (err: any) {
          results.push({ url: "", name: file.name });
          const updated = [...currentImages, ...results];
          onChange(updated);
          toast.error(`Failed to upload "${file.name}"`);
        }

        const partialResults = [...currentImages, ...results];
        onChange(partialResults);
      }

      const final = [...currentImages, ...results.filter((r) => r.url !== "")];
      onChange(final);
    },
    [images, maxImages, maxSizeMB, onChange]
  );

  const removeImage = async (index: number) => {
    const img = images[index];
    // Delete from ImageKit
    if (img.fileId) {
      try { await api.delete(`/upload?fileId=${img.fileId}`); } catch {}
    }
    const updated = images
      .filter((_, i) => i !== index)
      .map((i) => ({ url: i.url, name: i.name, fileId: i.fileId }));
    onChange(updated);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const displayImages = images.filter(
    (i) => !i.error || i.uploading
  );
  const uploadedCount = images.filter(
    (i) => i.url !== "" && !i.uploading
  ).length;

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-[hsl(var(--mms-text-primary))]">
          Photos{" "}
          <span className="text-[hsl(var(--mms-text-muted))] font-normal">
            ({uploadedCount}/{maxImages})
          </span>
        </label>
        {images.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* ── Preview Grid ── */}
      {displayImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
          {displayImages.map((img, i) => (
            <div
              key={`${img.name}-${i}`}
              className="relative group aspect-square rounded-xl overflow-hidden bg-[hsl(var(--mms-bg-muted))] border border-[hsl(var(--mms-border-default))]"
            >
              {img.uploading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[hsl(var(--mms-bg-muted))]">
                  <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--mms-brand-primary))]" />
                  <span className="text-xs text-[hsl(var(--mms-text-muted))] truncate px-2 max-w-full">
                    {img.name}
                  </span>
                </div>
              ) : img.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-50">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                  <span className="text-xs text-red-500">Failed</span>
                </div>
              ) : (
                <>
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setPreviewing(img.url)}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="p-2 bg-white/90 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  {/* File name tooltip */}
                  <div className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-black/60 to-transparent flex items-end px-2 pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white truncate">
                      {img.name}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Drop Zone ── */}
      {uploadedCount < maxImages && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all duration-200",
            "flex flex-col items-center justify-center gap-3",
            dragging
              ? "border-[hsl(var(--mms-brand-primary))] bg-[hsl(var(--mms-brand-primary-light)/0.5)] scale-[1.02]"
              : "border-[hsl(var(--mms-border-strong))] hover:border-[hsl(var(--mms-brand-primary))] hover:bg-[hsl(var(--mms-bg-muted))]"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--mms-brand-primary-light))] flex items-center justify-center">
            {dragging ? (
              <ImagePlus className="h-7 w-7 text-[hsl(var(--mms-brand-primary))]" />
            ) : (
              <Upload className="h-7 w-7 text-[hsl(var(--mms-brand-primary))]" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-[hsl(var(--mms-text-primary))]">
              {dragging ? "Drop images here" : "Drag & drop or click to browse"}
            </p>
            <p className="text-xs text-[hsl(var(--mms-text-muted))] mt-1">
              PNG, JPG, WEBP up to {maxSizeMB}MB each
            </p>
          </div>

          <button
            type="button"
            className="mt-1 px-4 py-1.5 text-xs font-medium text-[hsl(var(--mms-brand-primary))] bg-[hsl(var(--mms-brand-primary)/0.1)] rounded-full hover:bg-[hsl(var(--mms-brand-primary)/0.2)] transition-colors"
          >
            Select Files
          </button>
        </div>
      )}

      {/* ── Lightbox Preview ── */}
      {previewing && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPreviewing(null)}
        >
          <button
            onClick={() => setPreviewing(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <img
            src={previewing}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
