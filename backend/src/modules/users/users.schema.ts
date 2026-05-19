import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["Admin", "Supervisor", "Agent"]),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(["Admin", "Supervisor", "Agent"]).optional(),
  phone: z.string().optional(),
  isOnline: z.boolean().optional(),
});
