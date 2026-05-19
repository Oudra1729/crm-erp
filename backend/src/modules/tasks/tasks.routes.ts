import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createTaskSchema, updateTaskSchema } from "./tasks.schema.js";
import * as ctrl from "./tasks.controller.js";

export const tasksRouter = Router();

tasksRouter.use(authenticate);
tasksRouter.get("/", ctrl.list);
tasksRouter.post("/", validate(createTaskSchema), ctrl.create);
tasksRouter.patch("/:id", validate(updateTaskSchema), ctrl.update);
tasksRouter.delete("/:id", ctrl.remove);
