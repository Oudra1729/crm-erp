import type { Request, Response, NextFunction } from "express";
import { paramId } from "../../shared/params.js";
import { tasksService } from "./tasks.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tasksService.list(req.user!.sub);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tasksService.create(req.user!.sub, req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tasksService.update(paramId(req), req.user!.sub, req.body);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tasksService.remove(paramId(req), req.user!.sub);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
