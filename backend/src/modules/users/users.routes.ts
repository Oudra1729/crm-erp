import { Router } from "express";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createUserSchema, updateUserSchema } from "./users.schema.js";
import * as ctrl from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(authenticate);
usersRouter.use(requireRoles("Admin"));

usersRouter.get("/", ctrl.list);
usersRouter.get("/:id", ctrl.getById);
usersRouter.post("/", validate(createUserSchema), ctrl.create);
usersRouter.patch("/:id", validate(updateUserSchema), ctrl.update);
usersRouter.delete("/:id", ctrl.remove);
