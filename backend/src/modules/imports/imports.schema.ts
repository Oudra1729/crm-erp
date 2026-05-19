import { z } from "zod";

export const previewImportSchema = z.object({
  rows: z.array(z.record(z.string())).min(1).max(5000),
});

export const executeImportSchema = z.object({
  filename: z.string().min(1),
  campaignId: z.string().uuid(),
  rows: z.array(z.record(z.string())).min(1).max(5000),
  mapping: z.record(z.string()).optional(),
});
