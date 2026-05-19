import type { Request, Response, NextFunction } from "express";
import { paramId } from "../../shared/params.js";
import { notificationsService } from "./notifications.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationsService.list(req.user!.sub);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationsService.markRead(paramId(req), req.user!.sub);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationsService.markAllRead(req.user!.sub);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationsService.remove(paramId(req), req.user!.sub);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
