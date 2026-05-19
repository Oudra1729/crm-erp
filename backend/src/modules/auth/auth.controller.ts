import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function quickLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.body;
    const result = await authService.quickLogin(role);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.sub);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.user!.sub);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}
