import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as ctrl from "./agents.controller.js";

export const agentsRouter = Router();

agentsRouter.use(authenticate);
agentsRouter.get("/", ctrl.list);
agentsRouter.get("/:id", ctrl.getById);
