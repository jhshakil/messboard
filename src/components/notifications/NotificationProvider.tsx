"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { useUnreadNotifications } from "@/hooks/useNotifications";
import { useSession } from "next-auth/react";
import type { NotificationResponse } from "@/types/notification.types";

interface NotificationContextValue {
  permission: NotificationPermission;
  requestPermission: () => void;
  showBrowserNotification: (title: string, body: string) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  permission: "default",
  requestPermission: () => {},
  showBrowserNotification: () => {},
});

export function useNotificationContext() {
  return useContext(NotificationContext);
}

function getNotificationPermission(): NotificationPermission {
  if (typeof Notification !== "undefined") return Notification.permission;
  return "default";
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { data: notifications } = useUnreadNotifications();
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission);
  const mealRemindedRef = useRef(false);
  const permissionRequestedRef = useRef(false);
  const knownIdsRef = useRef(new Set<string>());

  const requestPermission = useCallback(() => {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then((p) => setPermission(p));
    permissionRequestedRef.current = true;
  }, []);

  const showBrowserNotification = useCallback(
    (title: string, body: string) => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      new Notification(title, { body, icon: "/favicon.ico" });
    },
    []
  );

  // Request permission on first user interaction
  useEffect(() => {
    if (permissionRequestedRef.current) return;
    const handler = () => {
      if (!permissionRequestedRef.current && typeof Notification !== "undefined" && Notification.permission === "default") {
        requestPermission();
      }
    };
    document.addEventListener("click", handler, { once: true });
    return () => document.removeEventListener("click", handler);
  }, [requestPermission]);

  // Show browser notification for new notes
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const currentIds = new Set(notifications.map((n: NotificationResponse) => n.id));
    const newNotifications = notifications.filter(
      (n: NotificationResponse) => n.type === "NOTE_CREATED" && !knownIdsRef.current.has(n.id)
    );

    // Seed known IDs on first load
    if (knownIdsRef.current.size === 0) {
      currentIds.forEach((id) => knownIdsRef.current.add(id));
      return;
    }

    for (const n of newNotifications) {
      knownIdsRef.current.add(n.id);
      showBrowserNotification(n.title, n.message);
    }
  }, [notifications, showBrowserNotification]);

  // 5 PM meal reminder
  useEffect(() => {
    if (!session) return;

    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Fire between 17:00 and 17:05
      if (hours === 17 && minutes >= 0 && minutes < 5 && !mealRemindedRef.current) {
        mealRemindedRef.current = true;
        showBrowserNotification("Meal Reminder", "Time to update your meals for today!");
      }

      // Reset after 17:05 so it can fire next day
      if (hours > 17 || (hours === 17 && minutes >= 5)) {
        mealRemindedRef.current = false;
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60_000); // check every minute
    return () => clearInterval(interval);
  }, [session, showBrowserNotification]);

  return (
    <NotificationContext.Provider value={{ permission, requestPermission, showBrowserNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}
