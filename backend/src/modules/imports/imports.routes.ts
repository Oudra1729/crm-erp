import { Router } from "express";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { previewImportSchema, executeImportSchema } from "./imports.schema.js";
import * as ctrl from "./imports.controller.js";

export const importsRouter = Router();

importsRouter.use(authenticate);
importsRouter.use(requireRoles("Admin", "Supervisor"));

importsRouter.get("/history", ctrl.history);
importsRouter.get("/template", ctrl.template);
importsRouter.post("/preview", validate(previewImportSchema), ctrl.preview);
importsRouter.post("/", validate(executeImportSchema), ctrl.execute);
