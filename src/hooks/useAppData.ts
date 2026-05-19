import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LeadsListParams,
  LeadsListResponse,
  AgentsResponse,
  CampaignsResponse,
  NotificationsResponse,
  TaskDto,
  UserDto,
  ImportPreviewDto,
  ImportHistoryDto,
  AnalyticsDashboardDto,
} from "@/lib/api-types";
import type { Lead, LeadStatus } from "@/types";
import { useAuth } from "./useAuth";
import { buildLeadsQueryPath } from "@/lib/leads-query";

export const queryKeys = {
  leads: ["leads"] as const,
  leadsList: (params: LeadsListParams) => ["leads", "list", params] as const,
  agents: ["agents"] as const,
  campaigns: ["campaigns"] as const,
  notifications: ["notifications"] as const,
  tasks: ["tasks"] as const,
  users: ["users"] as const,
  imports: ["imports"] as const,
  analytics: (days: number) => ["analytics", days] as const,
};

export function useLeads() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.leads,
    queryFn: () =>
      api.get<LeadsListResponse>(buildLeadsQueryPath({ limit: 100, page: 1 })),
    enabled: isAuthenticated,
  });
}

export function useLeadsList(params: LeadsListParams) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.leadsList(params),
    queryFn: () => api.get<LeadsListResponse>(buildLeadsQueryPath(params)),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  });
}

export function useAgents() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.agents,
    queryFn: () => api.get<AgentsResponse>("/agents"),
    enabled: isAuthenticated,
  });
}

export function useCampaigns() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.campaigns,
    queryFn: () => api.get<CampaignsResponse>("/campaigns"),
    enabled: isAuthenticated,
  });
}

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => api.get<NotificationsResponse>("/notifications"),
    enabled: isAuthenticated,
  });
}

export function useTasks() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => api.get<TaskDto[]>("/tasks"),
    enabled: isAuthenticated,
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: LeadStatus; assignedAgentId?: string | null }) =>
      api.patch<Lead>(`/leads/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.leads }),
  });
}

export function useAddLeadNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, content }: { leadId: string; content: string }) =>
      api.post<Lead>(`/leads/${leadId}/notes`, { content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.leads }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.leads }),
  });
}

export function useBulkAssignLeads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadIds, agentId }: { leadIds: string[]; agentId: string }) =>
      api.post<{ assigned: number }>("/leads/bulk-assign", { leadIds, agentId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.leads }),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; done?: boolean; title?: string }) =>
      api.patch<TaskDto>(`/tasks/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; priority?: "high" | "medium" | "low" }) =>
      api.post<TaskDto>("/tasks", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
}

export function useAnalytics(days = 30) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.analytics(days),
    queryFn: () => api.get<AnalyticsDashboardDto>(`/analytics/dashboard?days=${days}`),
    enabled: isAuthenticated,
  });
}

export function useImportHistory() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.imports,
    queryFn: () => api.get<ImportHistoryDto[]>("/imports/history"),
    enabled: isAuthenticated,
  });
}

export function useImportPreview() {
  return useMutation({
    mutationFn: (rows: Record<string, string>[]) =>
      api.post<ImportPreviewDto>("/imports/preview", { rows }),
  });
}

export function useExecuteImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      filename: string;
      campaignId: string;
      rows: Record<string, string>[];
    }) => api.post<{ imported: number; errors: number; warnings: number; skipped: number }>("/imports", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leads });
      qc.invalidateQueries({ queryKey: queryKeys.imports });
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useUsers() {
  const { isAuthenticated, user } = useAuth();
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => api.get<UserDto[]>("/users"),
    enabled: isAuthenticated && user?.role === "Admin",
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: "Admin" | "Supervisor" | "Agent";
      phone?: string;
    }) => api.post<UserDto>("/users", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users });
      qc.invalidateQueries({ queryKey: queryKeys.agents });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      role?: "Admin" | "Supervisor" | "Agent";
      phone?: string;
    }) => api.patch<UserDto>(`/users/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users });
      qc.invalidateQueries({ queryKey: queryKeys.agents });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users });
      qc.invalidateQueries({ queryKey: queryKeys.agents });
    },
  });
}
