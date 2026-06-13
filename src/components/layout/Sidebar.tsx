"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Banknote,
  SprayCan,
  StickyNote,
  FileText,
  Users,
  ShieldCheck,
  Settings,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { usePageVisibilityAll } from "@/hooks/usePageVisibility";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, pageKey: null },
  { href: "/meals", label: "Meals", icon: UtensilsCrossed, pageKey: "meals" },
  { href: "/bazar", label: "Bazar", icon: ShoppingCart, pageKey: "bazar" },
  { href: "/finance", label: "Finance", icon: Banknote, pageKey: "finance" },
  { href: "/cleaning", label: "Cleaning", icon: SprayCan, pageKey: "cleaning" },
  { href: "/notes", label: "Notes", icon: StickyNote, pageKey: "notes" },
  { href: "/reports", label: "Reports", icon: FileText, pageKey: "reports" },
  { href: "/members", label: "Members", icon: Users, pageKey: "members" },
];

const adminItems = [
  { href: "/audit-logs", label: "Audit Logs", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: visibility } = usePageVisibilityAll();

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";
  const isSuperadmin = session?.user?.role === "SUPERADMIN";

  const visiblePages = (Array.isArray(visibility) ? visibility : []).reduce((acc, v) => {
    acc[v.pageKey] = v.isVisible;
    return acc;
  }, {} as Record<string, boolean>);

  const isVisible = (pageKey: string | null) => {
    if (!pageKey) return true;
    if (isSuperadmin) return true;
    return visiblePages[pageKey] !== false;
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[var(--mms-sidebar-width)] bg-[hsl(var(--mms-bg-sidebar))]",
          "flex flex-col transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-[var(--mms-header-height)] border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-[hsl(var(--mms-brand-primary))]" />
            <span className="text-white font-bold text-lg">MessBoard</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            if (!isVisible(item.pageKey)) return null;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[var(--mms-radius-md)]",
                  "text-[hsl(var(--mms-text-sidebar))] text-sm font-medium",
                  "transition-colors duration-[var(--mms-transition-fast)]",
                  "hover:bg-[hsl(var(--mms-bg-sidebar-hover))] hover:text-white",
                  isActive && "bg-[hsl(var(--mms-brand-primary))] text-white hover:bg-[hsl(var(--mms-brand-primary-dark))]"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {isAdmin && (
          <div className="px-3 py-4 border-t border-white/10 space-y-1">
            <p className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
              Administration
            </p>
            {adminItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-[var(--mms-radius-md)]",
                    "text-[hsl(var(--mms-text-sidebar))] text-sm font-medium",
                    "transition-colors duration-[var(--mms-transition-fast)]",
                    "hover:bg-[hsl(var(--mms-bg-sidebar-hover))] hover:text-white",
                    isActive && "bg-[hsl(var(--mms-brand-primary))] text-white hover:bg-[hsl(var(--mms-brand-primary-dark))]"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </aside>
    </>
  );
}
