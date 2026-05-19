import { sql, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { leads, users, campaigns } from "../../db/schema.js";

export class AnalyticsService {
  async dashboard() {
    const [totals] = await db
      .select({
        totalLeads: sql<number>`count(*)::int`,
        converted: sql<number>`count(*) filter (where ${leads.status} = 'Converted')::int`,
        inProgress: sql<number>`count(*) filter (where ${leads.status} = 'In Progress')::int`,
        newLeads: sql<number>`count(*) filter (where ${leads.status} = 'New')::int`,
      })
      .from(leads);

    const total = totals?.totalLeads ?? 0;
    const converted = totals?.converted ?? 0;
    const conversionRate = total > 0 ? Math.round((converted / total) * 1000) / 10 : 0;

    const leadsByStatus = await db
      .select({
        status: leads.status,
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .groupBy(leads.status);

    const agentPerformance = await db
      .select({
        agentId: users.id,
        agentName: users.fullName,
        assigned: sql<number>`count(${leads.id})::int`,
        converted: sql<number>`count(*) filter (where ${leads.status} = 'Converted')::int`,
      })
      .from(users)
      .leftJoin(leads, eq(leads.assignedAgentId, users.id))
      .where(eq(users.role, "Agent"))
      .groupBy(users.id, users.fullName)
      .orderBy(sql`count(*) filter (where ${leads.status} = 'Converted') desc`)
      .limit(10);

    const leadsByCampaign = await db
      .select({
        campaignId: campaigns.id,
        campaignName: campaigns.name,
        count: sql<number>`count(${leads.id})::int`,
      })
      .from(campaigns)
      .leftJoin(leads, eq(leads.campaignId, campaigns.id))
      .groupBy(campaigns.id, campaigns.name);

    const last7Days = await db.execute(sql`
      SELECT to_char(d::date, 'DD Mon') as label,
             count(l.id)::int as count
      FROM generate_series(current_date - interval '6 days', current_date, '1 day') d
      LEFT JOIN leads l ON l.created_at::date = d::date
      GROUP BY d::date
      ORDER BY d::date
    `);

    return {
      summary: {
        totalLeads: total,
        converted,
        conversionRate,
        inProgress: totals?.inProgress ?? 0,
        newLeads: totals?.newLeads ?? 0,
      },
      leadsByStatus,
      agentPerformance: agentPerformance.map((a) => ({
        name: a.agentName,
        assigned: a.assigned,
        converted: a.converted,
        rate: a.assigned > 0 ? Math.round((a.converted / a.assigned) * 1000) / 10 : 0,
      })),
      leadsByCampaign,
      leadsEvolution: (last7Days.rows as { label: string; count: number }[]).map((r) => ({
        date: r.label,
        leads: r.count,
      })),
    };
  }
}

export const analyticsService = new AnalyticsService();
