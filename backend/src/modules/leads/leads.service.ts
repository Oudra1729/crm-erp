import { eq, inArray, sql, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { leads, leadNotes, campaigns, users } from "../../db/schema.js";
import { NotFoundError, ForbiddenError } from "../../shared/errors.js";
import { toLead } from "../../shared/mappers.js";
import type { JwtPayload } from "../../middleware/auth.js";

export class LeadsService {
  private async loadNotes(leadIds: string[]) {
    if (!leadIds.length) return new Map<string, (typeof leadNotes.$inferSelect & { authorName: string })[]>();

    const rows = await db
      .select({
        note: leadNotes,
        authorName: users.fullName,
      })
      .from(leadNotes)
      .innerJoin(users, eq(leadNotes.authorId, users.id))
      .where(inArray(leadNotes.leadId, leadIds));

    const map = new Map<string, (typeof leadNotes.$inferSelect & { authorName: string })[]>();
    for (const row of rows) {
      const list = map.get(row.note.leadId) ?? [];
      list.push({ ...row.note, authorName: row.authorName });
      map.set(row.note.leadId, list);
    }
    return map;
  }

  private scopeFilter(currentUser: JwtPayload) {
    if (currentUser.role === "Agent") {
      return eq(leads.assignedAgentId, currentUser.sub);
    }
    return undefined;
  }

  async list(currentUser: JwtPayload) {
    const scope = this.scopeFilter(currentUser);
    const rows = await db
      .select({ lead: leads, campaignName: campaigns.name })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(scope ? and(scope) : undefined)
      .orderBy(sql`${leads.createdAt} DESC`);

    const notesMap = await this.loadNotes(rows.map((r) => r.lead.id));
    return rows.map((r) =>
      toLead(r.lead, r.campaignName, notesMap.get(r.lead.id) ?? []),
    );
  }

  async getById(id: string, currentUser: JwtPayload) {
    const [row] = await db
      .select({ lead: leads, campaignName: campaigns.name })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(eq(leads.id, id))
      .limit(1);

    if (!row) throw new NotFoundError("Lead not found");
    if (
      currentUser.role === "Agent" &&
      row.lead.assignedAgentId !== currentUser.sub
    ) {
      throw new ForbiddenError();
    }

    const notesMap = await this.loadNotes([id]);
    return toLead(row.lead, row.campaignName, notesMap.get(id) ?? []);
  }

  async update(id: string, data: {
    status?: typeof leads.$inferSelect.status;
    priority?: typeof leads.$inferSelect.priority;
    assignedAgentId?: string | null;
  }, currentUser: JwtPayload) {
    await this.getById(id, currentUser);
    const [updated] = await db
      .update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return this.getById(updated.id, currentUser);
  }

  async bulkAssign(leadIds: string[], agentId: string, currentUser: JwtPayload) {
    if (currentUser.role === "Agent") {
      throw new ForbiddenError();
    }
    await db
      .update(leads)
      .set({ assignedAgentId: agentId, updatedAt: new Date() })
      .where(inArray(leads.id, leadIds));
    return this.list(currentUser);
  }

  async addNote(leadId: string, content: string, currentUser: JwtPayload) {
    const lead = await this.getById(leadId, currentUser);
    await db.insert(leadNotes).values({
      leadId,
      content,
      authorId: currentUser.sub,
    });
    return this.getById(lead.id, currentUser);
  }

  async remove(id: string, currentUser: JwtPayload) {
    if (currentUser.role === "Agent") throw new ForbiddenError();
    const [deleted] = await db.delete(leads).where(eq(leads.id, id)).returning();
    if (!deleted) throw new NotFoundError("Lead not found");
    return { id };
  }

  async create(data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    city: string;
    campaignId: string;
    assignedAgentId?: string | null;
    status?: typeof leads.$inferSelect.status;
    priority?: typeof leads.$inferSelect.priority;
    tags?: string[];
  }, currentUser: JwtPayload) {
    if (currentUser.role === "Agent") throw new ForbiddenError();
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const [created] = await db
      .insert(leads)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        phone: data.phone,
        email: data.email,
        city: data.city,
        campaignId: data.campaignId,
        assignedAgentId: data.assignedAgentId ?? null,
        status: data.status ?? "New",
        priority: data.priority ?? "Medium",
        tags: data.tags ?? [],
      })
      .returning();
    return this.getById(created.id, currentUser);
  }
}

export const leadsService = new LeadsService();
