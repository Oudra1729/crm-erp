import type { Request, Response, NextFunction } from "express";
import { paramId } from "../../shared/params.js";
import { agentsService } from "./agents.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data =
      req.user!.role === "Admin"
        ? await agentsService.listAllIncludingAdmin()
        : await agentsService.list();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await agentsService.getById(paramId(req));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
