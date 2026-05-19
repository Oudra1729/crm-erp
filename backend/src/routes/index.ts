import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { leadsRouter } from "../modules/leads/leads.routes.js";
import { agentsRouter } from "../modules/agents/agents.routes.js";
import { campaignsRouter } from "../modules/campaigns/campaigns.routes.js";
import { notificationsRouter } from "../modules/notifications/notifications.routes.js";
import { tasksRouter } from "../modules/tasks/tasks.routes.js";
import { analyticsRouter } from "../modules/analytics/analytics.routes.js";
import { importsRouter } from "../modules/imports/imports.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/leads", leadsRouter);
apiRouter.use("/agents", agentsRouter);
apiRouter.use("/campaigns", campaignsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/tasks", tasksRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/imports", importsRouter);
apiRouter.use("/users", usersRouter);
