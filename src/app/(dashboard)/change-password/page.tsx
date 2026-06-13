"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

const passwordSchema = z.object({
  newPassword: z.string().min(6, "At least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setLoading(true);
    try {
      await api.post("/user/change-password", {
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully");
      reset();
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mms-page max-w-lg">
      <div className="mb-6">
        <h1 className="mms-section-title">Change Password</h1>
        <p className="mms-section-subtitle">Set a new password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mms-card space-y-4">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--mms-text-muted))]" />
            <input type={showNew ? "text" : "password"} {...register("newPassword")} placeholder="At least 6 characters" className="w-full pl-10 pr-10 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mms-ring))]" />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--mms-text-muted))] hover:text-[hsl(var(--mms-text-primary))] transition-colors">
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--mms-text-secondary))] mb-1.5">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--mms-text-muted))]" />
            <input type={showConfirm ? "text" : "password"} {...register("confirmPassword")} placeholder="Re-enter new password" className="w-full pl-10 pr-10 py-2.5 rounded-[var(--mms-radius-md)] border border-[hsl(var(--mms-border-default))] bg-[hsl(var(--mms-bg-page))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mms-ring))]" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--mms-text-muted))] hover:text-[hsl(var(--mms-text-primary))] transition-colors">
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={loading} className="w-full py-2.5 bg-[hsl(var(--mms-brand-primary))] text-white text-sm font-medium rounded-[var(--mms-radius-md)] hover:bg-[hsl(var(--mms-brand-primary-dark))] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Change Password
        </button>
      </form>
    </div>
  );
}
