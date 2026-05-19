import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { analyticsService } from "./analytics.service.js";

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);
analyticsRouter.get(
  "/dashboard",
  requireRoles("Admin", "Supervisor"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await analyticsService.dashboard();
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
);
