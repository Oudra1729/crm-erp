import { eq, inArray, sql, and, or, ilike, asc, desc, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { leads, leadNotes, campaigns, users } from "../../db/schema.js";
import { NotFoundError, ForbiddenError } from "../../shared/errors.js";
import { toLead } from "../../shared/mappers.js";
import type { JwtPayload } from "../../middleware/auth.js";
import type { ListLeadsQuery } from "./leads.schema.js";

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

  private buildWhere(currentUser: JwtPayload, query: ListLeadsQuery) {
    const conditions = [];

    if (currentUser.role === "Agent") {
      conditions.push(eq(leads.assignedAgentId, currentUser.sub));
    } else if (query.assignedAgentId) {
      conditions.push(eq(leads.assignedAgentId, query.assignedAgentId));
    }

    if (query.search) {
      const term = `%${query.search}%`;
      conditions.push(
        or(
          ilike(leads.fullName, term),
          ilike(leads.phone, term),
          ilike(leads.email, term),
        )!,
      );
    }
    if (query.status) conditions.push(eq(leads.status, query.status));
    if (query.campaignId) conditions.push(eq(leads.campaignId, query.campaignId));
    if (query.priority) conditions.push(eq(leads.priority, query.priority));

    return conditions.length ? and(...conditions) : undefined;
  }

  private orderBy(query: ListLeadsQuery) {
    const dir = query.sortDir === "asc" ? asc : desc;
    switch (query.sortBy) {
      case "fullName":
        return dir(leads.fullName);
      case "city":
        return dir(leads.city);
      case "status":
        return dir(leads.status);
      case "priority":
        return dir(leads.priority);
      case "campaignName":
        return dir(campaigns.name);
      case "lastContact":
      default:
        return dir(leads.lastContact);
    }
  }

  async list(currentUser: JwtPayload, query: ListLeadsQuery) {
    const where = this.buildWhere(currentUser, query);
    const offset = (query.page - 1) * query.limit;

    const baseQuery = db
      .select({ lead: leads, campaignName: campaigns.name })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(where);

    const [countRow] = await db
      .select({ total: count() })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(where);

    const rows = await baseQuery
      .orderBy(this.orderBy(query))
      .limit(query.limit)
      .offset(offset);

    const notesMap = await this.loadNotes(rows.map((r) => r.lead.id));
    const items = rows.map((r) =>
      toLead(r.lead, r.campaignName, notesMap.get(r.lead.id) ?? []),
    );

    return {
      items,
      total: countRow?.total ?? 0,
      page: query.page,
      limit: query.limit,
    };
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
    return { assigned: leadIds.length };
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
