"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface PageGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function PageGuard({ children, allowedRoles }: PageGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <LoadingSpinner />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role as string)) {
    return (
      <div className="mms-page">
        <div className="mms-card text-center py-16">
          <h2 className="text-lg font-semibold text-[hsl(var(--mms-text-primary))]">Access Denied</h2>
          <p className="mt-2 text-sm text-[hsl(var(--mms-text-muted))]">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
