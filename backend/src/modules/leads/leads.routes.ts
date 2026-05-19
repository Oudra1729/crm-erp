import { Router } from "express";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  updateLeadSchema,
  bulkAssignSchema,
  createNoteSchema,
  createLeadSchema,
  listLeadsQuerySchema,
} from "./leads.schema.js";
import * as ctrl from "./leads.controller.js";

export const leadsRouter = Router();

leadsRouter.use(authenticate);

leadsRouter.get("/", validate(listLeadsQuerySchema, "query"), ctrl.list);
leadsRouter.post("/bulk-assign", requireRoles("Admin", "Supervisor"), validate(bulkAssignSchema), ctrl.bulkAssign);
leadsRouter.post("/", requireRoles("Admin", "Supervisor"), validate(createLeadSchema), ctrl.create);
leadsRouter.get("/:id", ctrl.getById);
leadsRouter.patch("/:id", validate(updateLeadSchema), ctrl.update);
leadsRouter.delete("/:id", requireRoles("Admin", "Supervisor"), ctrl.remove);
leadsRouter.post("/:id/notes", validate(createNoteSchema), ctrl.addNote);
