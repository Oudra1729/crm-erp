import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { analyticsService } from "./analytics.service.js";

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get(
  "/dashboard",
  requireRoles("Admin", "Supervisor"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const daysParam = req.query.days;
      const days =
        typeof daysParam === "string" ? Math.min(180, Math.max(7, Number(daysParam) || 30)) : 30;
      const data = await analyticsService.dashboard(days);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
);
