import type { Request, Response, NextFunction } from "express";
import { importsService } from "./imports.service.js";

export async function preview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = importsService.preview(req.body.rows);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function execute(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await importsService.execute(req.body, req.user!);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function history(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await importsService.history();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function template(_req: Request, res: Response, next: NextFunction) {
  try {
    const csv = await importsService.downloadTemplate();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="modele-leads.csv"');
    res.send(csv);
  } catch (e) {
    next(e);
  }
}
