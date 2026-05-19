import { eq, desc, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { importJobs, leads, campaigns, notifications, users } from "../../db/schema.js";
import { NotFoundError } from "../../shared/errors.js";
import type { JwtPayload } from "../../middleware/auth.js";

const FIELD_ALIASES: Record<string, string[]> = {
  firstName: ["first_name", "firstname", "prénom", "prenom", "first name"],
  lastName: ["last_name", "lastname", "nom", "last name"],
  phone: ["phone", "téléphone", "telephone", "tel", "mobile"],
  email: ["email", "e-mail", "mail"],
  city: ["city", "ville", "adresse", "address"],
};

function normalizeKey(key: string) {
  return key.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function pickField(row: Record<string, string>, target: keyof typeof FIELD_ALIASES): string {
  const aliases = FIELD_ALIASES[target];
  for (const [key, value] of Object.entries(row)) {
    const n = normalizeKey(key);
    if (aliases.some((a) => n === normalizeKey(a))) return value?.trim() ?? "";
  }
  return "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8;
}

export class ImportsService {
  preview(rows: Record<string, string>[]) {
    const previewRows = rows.slice(0, 5).map((row, index) => {
      const firstName = pickField(row, "firstName");
      const lastName = pickField(row, "lastName");
      const phone = pickField(row, "phone");
      const email = pickField(row, "email");
      const city = pickField(row, "city") || "Casablanca";
      const issues: string[] = [];
      if (!firstName) issues.push("Prénom manquant");
      if (!lastName) issues.push("Nom manquant");
      if (!phone) issues.push("Téléphone manquant");
      if (phone && !isValidPhone(phone)) issues.push("Téléphone suspect");
      if (email && !isValidEmail(email)) issues.push("Email invalide");
      return {
        index: index + 1,
        firstName,
        lastName,
        phone,
        email: email || `${firstName || "lead"}.${lastName || index}@import.local`,
        city,
        valid: issues.length === 0 || (firstName && lastName && phone),
        issues,
      };
    });

    let valid = 0;
    let warnings = 0;
    for (const row of rows) {
      const firstName = pickField(row, "firstName");
      const lastName = pickField(row, "lastName");
      const phone = pickField(row, "phone");
      if (!firstName || !lastName || !phone) continue;
      valid++;
      if (!isValidPhone(phone)) warnings++;
    }

    return {
      totalRows: rows.length,
      valid,
      warnings,
      errors: rows.length - valid,
      preview: previewRows,
      columns: rows[0] ? Object.keys(rows[0]) : [],
    };
  }

  async execute(
    data: {
      filename: string;
      campaignId: string;
      rows: Record<string, string>[];
    },
    currentUser: JwtPayload,
  ) {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, data.campaignId))
      .limit(1);
    if (!campaign) throw new NotFoundError("Campaign not found");

    let imported = 0;
    let errors = 0;
    let warnings = 0;

    for (const row of data.rows) {
      const firstName = pickField(row, "firstName");
      const lastName = pickField(row, "lastName");
      const phone = pickField(row, "phone");
      let email = pickField(row, "email");
      const city = pickField(row, "city") || "Casablanca";

      if (!firstName || !lastName || !phone) {
        errors++;
        continue;
      }
      if (!isValidPhone(phone)) warnings++;
      if (!email || !isValidEmail(email)) {
        email = `${firstName.toLowerCase().replace(/\s/g, ".")}.${lastName.split(" ")[0]?.toLowerCase() ?? "x"}@import.local`;
      }

      try {
        await db.insert(leads).values({
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          phone,
          email,
          city,
          campaignId: data.campaignId,
          status: "New",
          priority: "Medium",
          tags: [],
        });
        imported++;
      } catch {
        errors++;
      }
    }

    const status =
      imported === 0 ? "Échec" : errors > 0 || warnings > 0 ? "Partiel" : "Succès";

    const [job] = await db
      .insert(importJobs)
      .values({
        userId: currentUser.sub,
        filename: data.filename,
        totalRows: data.rows.length,
        imported,
        errors,
        warnings,
        status,
      })
      .returning();

    const [user] = await db.select().from(users).where(eq(users.id, currentUser.sub)).limit(1);

    await db.insert(notifications).values({
      userId: null,
      title: "Import CSV terminé",
      description: `${imported} leads importés depuis "${data.filename}" par ${user?.fullName ?? "Admin"}.`,
      type: "system",
      isRead: false,
    });

    return {
      job: {
        id: job.id,
        filename: job.filename,
        date: job.createdAt.toISOString(),
        imported: job.imported,
        errors: job.errors,
        warnings: job.warnings,
        status: job.status,
        user: user?.fullName ?? "",
        totalRows: job.totalRows,
      },
      imported,
      errors,
      warnings,
      skipped: data.rows.length - imported - errors,
    };
  }

  async history() {
    const rows = await db
      .select({
        job: importJobs,
        userName: users.fullName,
      })
      .from(importJobs)
      .innerJoin(users, eq(importJobs.userId, users.id))
      .orderBy(desc(importJobs.createdAt))
      .limit(50);

    return rows.map((r) => ({
      id: r.job.id,
      filename: r.job.filename,
      date: r.job.createdAt.toISOString(),
      imported: r.job.imported,
      errors: r.job.errors,
      warnings: r.job.warnings,
      status: r.job.status,
      user: r.userName,
      totalRows: r.job.totalRows,
    }));
  }

  async downloadTemplate() {
    return "first_name,last_name,phone,email,city\nFatima,El Amrani,+212 612 345 678,fatima@email.com,Casablanca\nYoussef,Benchekroun,+212 623 456 789,youssef@email.com,Rabat";
  }
}

export const importsService = new ImportsService();
