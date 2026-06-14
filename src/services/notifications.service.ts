import api from "@/lib/axios";
import { NotificationResponse } from "@/types/notification.types";

export const notificationsService = {
  getUnread: () =>
    api.get<NotificationResponse[]>("/notifications").then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}`).then((r) => r.data),

  markAllRead: () =>
    api.put("/notifications").then((r) => r.data),
};
