import { z } from "zod";

const leadStatus = z.enum([
  "New",
  "In Progress",
  "Callback",
  "Interested",
  "Converted",
  "Not Interested",
  "No Answer",
  "Invalid Number",
]);
const leadPriority = z.enum(["High", "Medium", "Low"]);

export const updateLeadSchema = z.object({
  status: leadStatus.optional(),
  priority: leadPriority.optional(),
  assignedAgentId: z.string().uuid().nullable().optional(),
});

export const bulkAssignSchema = z.object({
  leadIds: z.array(z.string().uuid()).min(1),
  agentId: z.string().uuid(),
});

export const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const listLeadsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: leadStatus.optional(),
  campaignId: z.string().uuid().optional(),
  priority: leadPriority.optional(),
  assignedAgentId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["fullName", "city", "status", "priority", "lastContact", "campaignName"])
    .default("lastContact"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;

export const createLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email(),
  city: z.string().min(1),
  campaignId: z.string().uuid(),
  assignedAgentId: z.string().uuid().nullable().optional(),
  status: leadStatus.optional(),
  priority: leadPriority.optional(),
  tags: z.array(z.string()).optional(),
});
