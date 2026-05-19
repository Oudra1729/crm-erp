import { z } from "zod";

export const createCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["Active", "Draft", "Completed", "Paused"]).optional(),
  startDate: z.string(),
  endDate: z.string(),
});

export const updateCampaignSchema = createCampaignSchema.partial();
