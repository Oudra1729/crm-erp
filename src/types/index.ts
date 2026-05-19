export type LeadStatus = 'New' | 'In Progress' | 'Callback' | 'Interested' | 'Converted' | 'Not Interested' | 'No Answer' | 'Invalid Number';
export type LeadPriority = 'High' | 'Medium' | 'Low';
export type CampaignStatus = 'Active' | 'Draft' | 'Completed' | 'Paused';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  campaignId: string;
  campaignName: string;
  assignedAgentId: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  lastContact: string; // ISO date string
  notes: Note[];
  tags: string[];
  createdAt: string;
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Supervisor' | 'Agent';
  isOnline: boolean;
  avatarUrl?: string;
  stats: {
    assignedLeads: number;
    converted: number;
    conversionRate: number;
    todaysCalls: number;
  };
  lastActivity: string; // ISO date string
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  stats: {
    leadsAssigned: number;
    totalLeads: number;
    conversionRate: number;
    numberOfAgents: number;
  };
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'system' | 'lead' | 'campaign';
  isRead: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}
