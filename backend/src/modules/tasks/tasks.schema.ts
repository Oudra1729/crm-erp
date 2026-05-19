import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1),
  priority: z.enum(["high", "medium", "low"]).optional(),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  dueDate: z.string().optional(),
});
