import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const quickLoginSchema = z.object({
  role: z.enum(["Admin", "Supervisor", "Agent"]),
});
