"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Sun, Moon, LogOut, User, ChevronDown, Key, Settings } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/layout/PageWrapper";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSuperadmin = session?.user?.role === "SUPERADMIN";

  return (
    <header className="h-[var(--mms-header-height)] bg-[hsl(var(--mms-bg-card))] border-b border-[hsl(var(--mms-border-default))] flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-[hsl(var(--mms-bg-muted))] text-[hsl(var(--mms-text-primary))]"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[hsl(var(--mms-bg-muted))] text-[hsl(var(--mms-text-secondary))]"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[hsl(var(--mms-bg-muted))] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--mms-bg-muted))] flex items-center justify-center overflow-hidden border border-[hsl(var(--mms-border-default))]">
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-[hsl(var(--mms-text-muted))]" />
              )}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--mms-text-muted))] hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[hsl(var(--mms-bg-card))] border border-[hsl(var(--mms-border-default))] rounded-[var(--mms-radius-lg)] shadow-[var(--mms-shadow-lg)] py-2 z-50">
              <div className="px-4 py-2 border-b border-[hsl(var(--mms-border-default))]">
                <p className="text-sm font-medium text-[hsl(var(--mms-text-primary))] truncate">{session?.user?.name}</p>
                <p className="text-xs text-[hsl(var(--mms-text-muted))] truncate">{session?.user?.email}</p>
                {isSuperadmin && (
                  <span className="inline-block mt-1 mms-role-superadmin">SUPERADMIN</span>
                )}
              </div>

              <button
                onClick={() => { router.push("/profile"); setDropdownOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[hsl(var(--mms-text-secondary))] hover:bg-[hsl(var(--mms-bg-muted))] transition-colors"
              >
                <User className="h-4 w-4" /> My Profile
              </button>

              <button
                onClick={() => { router.push("/change-password"); setDropdownOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[hsl(var(--mms-text-secondary))] hover:bg-[hsl(var(--mms-bg-muted))] transition-colors"
              >
                <Key className="h-4 w-4" /> Change Password
              </button>

              <div className="border-t border-[hsl(var(--mms-border-default))] mt-1 pt-1">
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
