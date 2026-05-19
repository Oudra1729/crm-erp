import type { Lead, Agent, Campaign, Notification } from "@/types";
import type { AuthUser } from "@/hooks/useAuth";

export type LoginResponse = { token: string; user: AuthUser };

export interface LeadsListParams {
  search?: string;
  status?: string;
  campaignId?: string;
  priority?: string;
  assignedAgentId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface LeadsListResponse {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
}
export type AgentsResponse = Agent[];
export type CampaignsResponse = Campaign[];
export type NotificationsResponse = Notification[];

export interface TaskDto {
  id: string;
  title: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: "Admin" | "Supervisor" | "Agent";
  phone: string;
  isOnline: boolean;
  avatarInitials: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportPreviewDto {
  totalRows: number;
  valid: number;
  warnings: number;
  errors: number;
  preview: {
    index: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    city: string;
    valid: boolean;
    issues: string[];
  }[];
  columns: string[];
}

export interface ImportHistoryDto {
  id: string;
  filename: string;
  date: string;
  imported: number;
  errors: number;
  warnings: number;
  status: "Succès" | "Partiel" | "Échec";
  user: string;
  totalRows: number;
}

export interface AnalyticsDashboardDto {
  summary: {
    totalLeads: number;
    converted: number;
    conversionRate: number;
    inProgress: number;
    newLeads: number;
    periodLeads: number;
    periodConverted: number;
    periodConversionRate: number;
    activeAgents: number;
    activeCampaigns: number;
    totalCalls: number;
    avgAgentConversionRate: number;
  };
  leadsEvolution: { date: string; Nouveaux: number; Convertis: number; Rappels?: number }[];
  conversionFunnel: { stage: string; value: number; fill: string }[];
  leadsBySource: { name: string; value: number; fill: string }[];
  dailyActivity: { date: string; Appels: number; Notes: number; Conversions: number }[];
  agentPerformance: { name: string; assigned: number; converted: number; conversions: number; rate: number }[];
  campaignPerformance: { name: string; leads: number; converted: number }[];
}
