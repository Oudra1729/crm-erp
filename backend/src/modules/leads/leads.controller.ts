import type { Request, Response, NextFunction } from "express";
import { paramId } from "../../shared/params.js";
import { leadsService } from "./leads.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await leadsService.list(req.user!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await leadsService.getById(paramId(req), req.user!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await leadsService.update(paramId(req), req.body, req.user!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function bulkAssign(req: Request, res: Response, next: NextFunction) {
  try {
    const { leadIds, agentId } = req.body;
    const data = await leadsService.bulkAssign(leadIds, agentId, req.user!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function addNote(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await leadsService.addNote(paramId(req), req.body.content, req.user!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await leadsService.remove(paramId(req), req.user!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await leadsService.create(req.body, req.user!);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
