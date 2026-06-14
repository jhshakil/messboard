"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, BellDot } from "lucide-react";
import { useUnreadNotifications, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { useNotificationContext } from "@/components/notifications/NotificationProvider";
import { format } from "date-fns";
import type { NotificationResponse } from "@/types/notification.types";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: notifications } = useUnreadNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const { permission, requestPermission } = useNotificationContext();

  const unreadCount = notifications?.length ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    markAllRead.mutate();
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen(!open);
          if (permission === "default") requestPermission();
        }}
        className="p-2 rounded-lg hover:bg-[hsl(var(--mms-bg-muted))] text-[hsl(var(--mms-text-secondary))] relative"
      >
        {unreadCount > 0 ? (
          <BellDot className="h-4 w-4" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[hsl(var(--mms-bg-card))] border border-[hsl(var(--mms-border-default))] rounded-[var(--mms-radius-lg)] shadow-[var(--mms-shadow-lg)] z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--mms-border-default))]">
            <h3 className="text-sm font-semibold text-[hsl(var(--mms-text-primary))]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[hsl(var(--mms-brand-primary))] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <p className="px-4 py-8 text-sm text-[hsl(var(--mms-text-muted))] text-center">
                No new notifications
              </p>
            ) : (
              notifications.map((n: NotificationResponse) => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b border-[hsl(var(--mms-border-default))] last:border-b-0 hover:bg-[hsl(var(--mms-bg-muted))] transition-colors cursor-default"
                >
                  <p className="text-sm text-[hsl(var(--mms-text-primary))]">{n.message}</p>
                  <p className="text-xs text-[hsl(var(--mms-text-muted))] mt-1">
                    {format(new Date(n.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              ))
            )}
          </div>

          {permission === "denied" && (
            <div className="px-4 py-2 border-t border-[hsl(var(--mms-border-default))] text-xs text-[hsl(var(--mms-text-muted))]">
              Browser notifications blocked — enable in site settings
            </div>
          )}
        </div>
      )}
    </div>
  );
}
