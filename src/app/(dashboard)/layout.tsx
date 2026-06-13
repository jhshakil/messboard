"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { usePageVisibilityAll } from "@/hooks/usePageVisibility";
import { PAGE_KEYS } from "@/constants/pages";

const PATH_TO_KEY: Record<string, string> = {
  "/meals": PAGE_KEYS.MEALS,
  "/bazar": PAGE_KEYS.BAZAR,
  "/finance": PAGE_KEYS.FINANCE,
  "/cleaning": PAGE_KEYS.CLEANING,
  "/notes": PAGE_KEYS.NOTES,
  "/reports": PAGE_KEYS.REPORTS,
  "/members": PAGE_KEYS.MEMBERS,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { data: visibility } = usePageVisibilityAll();

  const isSuperadmin = session?.user?.role === "SUPERADMIN";

  const visibleMap = useMemo(
    () =>
      (Array.isArray(visibility) ? visibility : []).reduce((acc, v) => {
        acc[v.pageKey] = v.isVisible;
        return acc;
      }, {} as Record<string, boolean>),
    [visibility]
  );

  // Force password change
  useEffect(() => {
    if (session && (session as any).forcePasswordChange && pathname !== "/change-password" && pathname !== "/profile") {
      router.push("/change-password");
    }
  }, [session, pathname, router]);

  // Block hidden pages from direct URL access
  useEffect(() => {
    const pageKey = PATH_TO_KEY[pathname];
    if (pageKey && !isSuperadmin && visibleMap[pageKey] === false) {
      router.replace("/");
    }
  }, [pathname, isSuperadmin, visibleMap, router]);

  return (
    <PageWrapper>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </PageWrapper>
  );
}
