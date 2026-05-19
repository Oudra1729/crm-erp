import { eq, sql, and, ne } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users, leads } from "../../db/schema.js";
import { NotFoundError } from "../../shared/errors.js";
import { toAgent } from "../../shared/mappers.js";

export class AgentsService {
  private async agentStats(agentId: string) {
    const [row] = await db
      .select({
        assignedLeads: sql<number>`count(*)::int`,
        converted: sql<number>`count(*) filter (where ${leads.status} = 'Converted')::int`,
      })
      .from(leads)
      .where(eq(leads.assignedAgentId, agentId));

    const assigned = row?.assignedLeads ?? 0;
    const converted = row?.converted ?? 0;
    const conversionRate = assigned > 0 ? Math.round((converted / assigned) * 1000) / 10 : 0;

    return {
      assignedLeads: assigned,
      converted,
      conversionRate,
      todaysCalls: Math.floor(Math.random() * 40),
    };
  }

  async list() {
    const agentUsers = await db
      .select()
      .from(users)
      .where(ne(users.role, "Admin"));

    const result = [];
    for (const user of agentUsers) {
      const stats = await this.agentStats(user.id);
      result.push(toAgent(user, stats));
    }
    return result;
  }

  async listAllIncludingAdmin() {
    const allUsers = await db.select().from(users);
    const result = [];
    for (const user of allUsers) {
      const stats = await this.agentStats(user.id);
      result.push(toAgent(user, stats));
    }
    return result;
  }

  async getById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) throw new NotFoundError("Agent not found");
    const stats = await this.agentStats(user.id);
    return toAgent(user, stats);
  }

  async setOnline(id: string, isOnline: boolean) {
    const [user] = await db
      .update(users)
      .set({ isOnline, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new NotFoundError("Agent not found");
    const stats = await this.agentStats(user.id);
    return toAgent(user, stats);
  }
}

export const agentsService = new AgentsService();
