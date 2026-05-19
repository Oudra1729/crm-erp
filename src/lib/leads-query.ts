import type { LeadsListParams } from "@/lib/api-types";

export function buildLeadsQueryPath(params: LeadsListParams = {}): string {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status && params.status !== "all") q.set("status", params.status);
  if (params.campaignId && params.campaignId !== "all") q.set("campaignId", params.campaignId);
  if (params.priority && params.priority !== "all") q.set("priority", params.priority);
  if (params.assignedAgentId) q.set("assignedAgentId", params.assignedAgentId);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.sortBy) q.set("sortBy", params.sortBy);
  if (params.sortDir) q.set("sortDir", params.sortDir);
  const qs = q.toString();
  return qs ? `/leads?${qs}` : "/leads";
}
