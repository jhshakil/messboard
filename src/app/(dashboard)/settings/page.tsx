"use client";

import { useRef, useCallback } from "react";
import { PageGuard } from "@/components/shared/PageGuard";
import { usePageVisibilityAll, useTogglePageVisibility } from "@/hooks/usePageVisibility";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PAGE_LABELS } from "@/constants/pages";

export default function SettingsPage() {
  return (
    <PageGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>
      <div className="mms-page">
        <div className="mb-6">
          <h1 className="mms-section-title">Settings</h1>
          <p className="mms-section-subtitle">Manage system preferences</p>
        </div>
        <SettingsContent />
      </div>
    </PageGuard>
  );
}

function SettingsContent() {
  const { data: visibility, isLoading } = usePageVisibilityAll();
  const toggleMutation = useTogglePageVisibility();

  const lastClickRef = useRef<Record<string, number>>({});
  const RATE_LIMIT_MS = 500;

  const handleToggle = useCallback(
    (pageKey: string, checked: boolean) => {
      const now = Date.now();
      const lastClick = lastClickRef.current[pageKey] ?? 0;
      if (now - lastClick < RATE_LIMIT_MS) return;
      lastClickRef.current[pageKey] = now;

      toggleMutation.mutate({ pageKey, isVisible: checked });
    },
    [toggleMutation]
  );

  if (isLoading) return <LoadingSpinner />;

  const entries = Object.entries(PAGE_LABELS);

  return (
    <div className="mms-card">
      <h3 className="mms-section-title mb-4">Page Visibility</h3>
      <p className="text-sm text-[hsl(var(--mms-text-muted))] mb-6">
        Toggle which pages are visible in the sidebar for users and admins. Superadmin always sees all pages.
      </p>
      <div className="space-y-4">
        {entries.map(([key, label]) => {
          const v = visibility?.find((pv) => pv.pageKey === key);
          const isVisible = v?.isVisible ?? true;

          return (
            <div key={key} className="mms-visibility-card">
              <div>
                <p className="font-medium text-[hsl(var(--mms-text-primary))]">{label}</p>
                <p className="text-xs text-[hsl(var(--mms-text-muted))]">/{key}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isVisible}
                onClick={() => handleToggle(key, !isVisible)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mms-ring))] ${
                  isVisible ? "bg-[hsl(var(--mms-brand-primary))]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isVisible ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
