import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { loginSchema, quickLoginSchema } from "./auth.schema.js";
import * as ctrl from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), ctrl.login);
authRouter.post("/quick-login", validate(quickLoginSchema), ctrl.quickLogin);
authRouter.get("/me", authenticate, ctrl.me);
authRouter.post("/logout", authenticate, ctrl.logout);
