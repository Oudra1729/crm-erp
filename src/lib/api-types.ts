import type { Lead, Agent, Campaign, Notification } from "@/types";
import type { AuthUser } from "@/hooks/useAuth";

export type LoginResponse = { token: string; user: AuthUser };

export type LeadsResponse = Lead[];
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
