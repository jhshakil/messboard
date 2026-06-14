import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { notificationsService } from "@/services/notifications.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useUnreadNotifications = () => {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: QUERY_KEYS.notifications.unread,
    queryFn: () => notificationsService.getUnread(),
    refetchInterval: 30_000, // poll every 30s
    enabled: status === "authenticated" && !!session,
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications.unread });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications.unread });
    },
  });
};
