import { Router } from "express";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createCampaignSchema, updateCampaignSchema } from "./campaigns.schema.js";
import * as ctrl from "./campaigns.controller.js";

export const campaignsRouter = Router();

campaignsRouter.use(authenticate);
campaignsRouter.get("/", ctrl.list);
campaignsRouter.get("/:id", ctrl.getById);
campaignsRouter.post("/", requireRoles("Admin", "Supervisor"), validate(createCampaignSchema), ctrl.create);
campaignsRouter.patch("/:id", requireRoles("Admin", "Supervisor"), validate(updateCampaignSchema), ctrl.update);
campaignsRouter.delete("/:id", requireRoles("Admin"), ctrl.remove);
