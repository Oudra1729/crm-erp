import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as ctrl from "./notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);
notificationsRouter.get("/", ctrl.list);
notificationsRouter.patch("/read-all", ctrl.markAllRead);
notificationsRouter.patch("/:id/read", ctrl.markRead);
notificationsRouter.delete("/:id", ctrl.remove);
