import type { Request, Response, NextFunction } from "express";
import { paramId } from "../../shared/params.js";
import { usersService } from "./users.service.js";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await usersService.list();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await usersService.getById(paramId(req));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await usersService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await usersService.update(paramId(req), req.body, req.user!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await usersService.remove(paramId(req), req.user!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
