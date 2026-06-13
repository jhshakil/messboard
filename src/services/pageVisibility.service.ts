import api from "@/lib/axios";

interface PageVisibilityResponse {
  id: string;
  pageKey: string;
  isVisible: boolean;
}

export const pageVisibilityService = {
  getAll: () =>
    api.get<PageVisibilityResponse[]>("/page-visibility").then((r) => r.data ?? []),

  toggle: (pageKey: string, isVisible: boolean) =>
    api.patch<PageVisibilityResponse>("/page-visibility", { pageKey, isVisible }).then((r) => r.data),
};
