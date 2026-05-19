import type { Lead, LeadNote, User, Campaign, Notification, Task } from "../db/schema.js";

export function toAuthUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isOnline: user.isOnline,
    avatarInitials: user.avatarInitials,
  };
}

export function toAgent(user: User, stats: {
  assignedLeads: number;
  converted: number;
  conversionRate: number;
  todaysCalls: number;
}) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role,
    isOnline: user.isOnline,
    stats,
    lastActivity: user.updatedAt.toISOString(),
  };
}

export function toLead(
  lead: Lead,
  campaignName: string,
  notes: (LeadNote & { authorName: string })[],
) {
  return {
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    fullName: lead.fullName,
    phone: lead.phone,
    email: lead.email,
    city: lead.city,
    campaignId: lead.campaignId,
    campaignName,
    assignedAgentId: lead.assignedAgentId,
    status: lead.status,
    priority: lead.priority,
    lastContact: lead.lastContact.toISOString(),
    tags: lead.tags ?? [],
    notes: notes.map((n) => ({
      id: n.id,
      content: n.content,
      authorId: n.authorId,
      authorName: n.authorName,
      createdAt: n.createdAt.toISOString(),
    })),
    createdAt: lead.createdAt.toISOString(),
  };
}

export function toCampaign(
  campaign: Campaign,
  stats: {
    leadsAssigned: number;
    totalLeads: number;
    conversionRate: number;
    numberOfAgents: number;
  },
) {
  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    status: campaign.status,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    stats,
  };
}

export function toNotification(n: Notification) {
  return {
    id: n.id,
    title: n.title,
    description: n.description,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  };
}

export function toTask(t: Task) {
  return {
    id: t.id,
    title: t.title,
    done: t.done,
    priority: t.priority,
    dueDate: t.dueDate ?? undefined,
  };
}
