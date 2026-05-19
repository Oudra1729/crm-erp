import type { Request, Response, NextFunction } from "express";
import { paramId } from "../../shared/params.js";
import { campaignsService } from "./campaigns.service.js";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await campaignsService.list();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await campaignsService.getById(paramId(req));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await campaignsService.create(req.body, req.user!);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await campaignsService.update(paramId(req), req.body, req.user!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await campaignsService.remove(paramId(req), req.user!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
