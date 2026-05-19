import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LeadsResponse,
  AgentsResponse,
  CampaignsResponse,
  NotificationsResponse,
  TaskDto,
} from "@/lib/api-types";
import type { Lead, LeadStatus } from "@/types";
import { useAuth } from "./useAuth";

export const queryKeys = {
  leads: ["leads"] as const,
  agents: ["agents"] as const,
  campaigns: ["campaigns"] as const,
  notifications: ["notifications"] as const,
  tasks: ["tasks"] as const,
};

export function useLeads() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.leads,
    queryFn: () => api.get<LeadsResponse>("/leads"),
    enabled: isAuthenticated,
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
      api.post<LeadsResponse>("/leads/bulk-assign", { leadIds, agentId }),
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
