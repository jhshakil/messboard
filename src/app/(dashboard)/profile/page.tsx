"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (session?.user?.name) {
      reset({ name: session.user.name });
    }
  }, [session?.user?.name, reset]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = res.data.url;
      setAvatarUrl(url);

      await api.patch("/user/profile", { image: url });
      await update({ ...session, user: { ...session?.user, image: url } });
      toast.success("Avatar updated");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    try {
      await api.patch("/user/profile", { name: data.name });
      await update({ ...session, user: { ...session?.user, name: data.name } });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const displayImage = avatarUrl ?? session?.user?.image;

  return (
    <div className="mms-page max-w-lg">
      <div className="mb-6">
        <h1 className="mms-section-title">My Profile</h1>
        <p className="mms-section-subtitle">Update your name and avatar</p>
      </div>

      <div className="mms-card">
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative group cursor-pointer"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="w-20 h-20 rounded-full bg-[hsl(var(--mms-bg-muted))] flex items-center justify-center overflow-hidden border-2 border-[hsl(var(--mms-border-default))] group-hover:border-[hsl(var(--mms-brand-primary))] transition-colors">
              {displayImage ? (
                <img src={displayImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-[hsl(var(--mms-text-muted))]" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 p-1.5 bg-[hsl(var(--mms-brand-primary))] text-white rounded-full text-xs shadow">
              <Camera className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">Name</label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-4 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mms-ring))]"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-[hsl(var(--mms-brand-primary))] text-white text-sm font-medium rounded-[var(--mms-radius-md)] hover:bg-[hsl(var(--mms-brand-primary-dark))] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
