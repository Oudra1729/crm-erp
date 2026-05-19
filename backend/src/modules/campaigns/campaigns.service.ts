import { eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { campaigns, leads } from "../../db/schema.js";
import { NotFoundError, ForbiddenError } from "../../shared/errors.js";
import { toCampaign } from "../../shared/mappers.js";
import type { JwtPayload } from "../../middleware/auth.js";

export class CampaignsService {
  private async campaignStats(campaignId: string) {
    const [row] = await db
      .select({
        totalLeads: sql<number>`count(*)::int`,
        leadsAssigned: sql<number>`count(*) filter (where ${leads.assignedAgentId} is not null)::int`,
        converted: sql<number>`count(*) filter (where ${leads.status} = 'Converted')::int`,
        numberOfAgents: sql<number>`count(distinct ${leads.assignedAgentId})::int`,
      })
      .from(leads)
      .where(eq(leads.campaignId, campaignId));

    const total = row?.totalLeads ?? 0;
    const converted = row?.converted ?? 0;
    const conversionRate = total > 0 ? Math.round((converted / total) * 1000) / 10 : 0;

    return {
      leadsAssigned: row?.leadsAssigned ?? 0,
      totalLeads: total,
      conversionRate,
      numberOfAgents: row?.numberOfAgents ?? 0,
    };
  }

  async list() {
    const rows = await db.select().from(campaigns).orderBy(sql`${campaigns.createdAt} DESC`);
    const result = [];
    for (const c of rows) {
      result.push(toCampaign(c, await this.campaignStats(c.id)));
    }
    return result;
  }

  async getById(id: string) {
    const [c] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    if (!c) throw new NotFoundError("Campaign not found");
    return toCampaign(c, await this.campaignStats(c.id));
  }

  async create(
    data: {
      name: string;
      description?: string;
      status?: typeof campaigns.$inferSelect.status;
      startDate: string;
      endDate: string;
    },
    currentUser: JwtPayload,
  ) {
    if (currentUser.role === "Agent") throw new ForbiddenError();
    const [created] = await db
      .insert(campaigns)
      .values({
        name: data.name,
        description: data.description ?? "",
        status: data.status ?? "Draft",
        startDate: data.startDate,
        endDate: data.endDate,
      })
      .returning();
    return this.getById(created.id);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      status: typeof campaigns.$inferSelect.status;
      startDate: string;
      endDate: string;
    }>,
    currentUser: JwtPayload,
  ) {
    if (currentUser.role === "Agent") throw new ForbiddenError();
    const [updated] = await db
      .update(campaigns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    if (!updated) throw new NotFoundError("Campaign not found");
    return this.getById(updated.id);
  }

  async remove(id: string, currentUser: JwtPayload) {
    if (currentUser.role !== "Admin") throw new ForbiddenError();
    const [deleted] = await db.delete(campaigns).where(eq(campaigns.id, id)).returning();
    if (!deleted) throw new NotFoundError("Campaign not found");
    return { id };
  }
}

export const campaignsService = new CampaignsService();
