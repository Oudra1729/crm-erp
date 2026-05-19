import { sql, eq, and, gte } from "drizzle-orm";
import { db } from "../../db/index.js";
import { leads, users, campaigns } from "../../db/schema.js";

const FUNNEL_STAGES = [
  { status: "New", stage: "Nouveaux", fill: "#3b82f6" },
  { status: "In Progress", stage: "En cours", fill: "#8b5cf6" },
  { status: "Interested", stage: "Intéressés", fill: "#06b6d4" },
  { status: "Callback", stage: "Rappels", fill: "#f59e0b" },
  { status: "Converted", stage: "Convertis", fill: "#10b981" },
] as const;

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

function daysToInterval(days: number) {
  return sql`current_date - interval '${sql.raw(String(days - 1))} days'`;
}

export class AnalyticsService {
  async dashboard(days = 30) {
    const since = daysToInterval(days);

    const [totals] = await db
      .select({
        totalLeads: sql<number>`count(*)::int`,
        converted: sql<number>`count(*) filter (where ${leads.status} = 'Converted')::int`,
        inProgress: sql<number>`count(*) filter (where ${leads.status} = 'In Progress')::int`,
        newLeads: sql<number>`count(*) filter (where ${leads.status} = 'New')::int`,
      })
      .from(leads);

    const [periodTotals] = await db
      .select({
        totalLeads: sql<number>`count(*)::int`,
        converted: sql<number>`count(*) filter (where ${leads.status} = 'Converted')::int`,
      })
      .from(leads)
      .where(gte(leads.createdAt, since));

    const total = totals?.totalLeads ?? 0;
    const converted = totals?.converted ?? 0;
    const conversionRate = total > 0 ? Math.round((converted / total) * 1000) / 10 : 0;

    const periodTotal = periodTotals?.totalLeads ?? 0;
    const periodConverted = periodTotals?.converted ?? 0;
    const periodConvRate =
      periodTotal > 0 ? Math.round((periodConverted / periodTotal) * 1000) / 10 : 0;

    const leadsByStatus = await db
      .select({
        status: leads.status,
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .groupBy(leads.status);

    const statusMap = Object.fromEntries(leadsByStatus.map((r) => [r.status, r.count]));

    const conversionFunnel = FUNNEL_STAGES.map((s) => ({
      stage: s.stage,
      value: statusMap[s.status] ?? 0,
      fill: s.fill,
    }));

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
      .orderBy(sql`count(*) filter (where ${leads.status} = 'Converted') desc`);

    const leadsByCampaign = await db
      .select({
        campaignId: campaigns.id,
        campaignName: campaigns.name,
        count: sql<number>`count(${leads.id})::int`,
        converted: sql<number>`count(*) filter (where ${leads.status} = 'Converted')::int`,
      })
      .from(campaigns)
      .leftJoin(leads, eq(leads.campaignId, campaigns.id))
      .groupBy(campaigns.id, campaigns.name);

    const campaignTotal = leadsByCampaign.reduce((s, c) => s + c.count, 0);
    const leadsBySource = leadsByCampaign
      .filter((c) => c.count > 0)
      .map((c, idx) => ({
        name: c.campaignName.length > 18 ? c.campaignName.slice(0, 16) + "…" : c.campaignName,
        value: campaignTotal > 0 ? Math.round((c.count / campaignTotal) * 100) : 0,
        fill: CHART_COLORS[idx % CHART_COLORS.length],
      }));

    const evolutionResult = await db.execute(sql`
      SELECT to_char(d::date, 'DD Mon') as date,
             (SELECT count(*)::int FROM leads WHERE created_at::date = d::date) as nouveaux,
             (SELECT count(*)::int FROM leads WHERE status = 'Converted' AND updated_at::date = d::date) as convertis
      FROM generate_series(current_date - (${days} - 1) * interval '1 day', current_date, '1 day') d
      ORDER BY d::date
    `);

    const leadsEvolution = (
      evolutionResult.rows as { date: string; nouveaux: number; convertis: number }[]
    ).map((r) => ({
      date: r.date,
      Nouveaux: r.nouveaux,
      Convertis: r.convertis,
      Rappels: statusMap["Callback"] ?? 0,
    }));

    const dailyActivityResult = await db.execute(sql`
      SELECT to_char(d::date, 'Dy DD') as date,
             (SELECT count(*)::int FROM leads WHERE updated_at::date = d::date)::int as appels,
             (SELECT count(*)::int FROM lead_notes WHERE created_at::date = d::date)::int as notes,
             (SELECT count(*)::int FROM leads WHERE status = 'Converted' AND updated_at::date = d::date)::int as conversions
      FROM generate_series(current_date - 13 * interval '1 day', current_date, '1 day') d
      ORDER BY d::date
    `);

    const dailyActivity = (
      dailyActivityResult.rows as {
        date: string;
        appels: number;
        notes: number;
        conversions: number;
      }[]
    ).map((r) => ({
      date: r.date,
      Appels: r.appels,
      Notes: r.notes,
      Conversions: r.conversions,
    }));

    const campaignPerformance = leadsByCampaign.map((c) => ({
      name: c.campaignName.length > 12 ? c.campaignName.slice(0, 10) + "…" : c.campaignName,
      leads: c.count,
      converted: c.converted,
    }));

    const [activeAgents] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.role, "Agent"), eq(users.isOnline, true)));

    const [activeCampaigns] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(campaigns)
      .where(eq(campaigns.status, "Active"));

    const totalCalls = agentPerformance.reduce(
      (s, a) => s + Math.floor(a.converted * 2 + a.assigned * 0.1),
      0,
    );

    const avgAgentRate =
      agentPerformance.length > 0
        ? Math.round(
            (agentPerformance.reduce((s, a) => {
              const rate = a.assigned > 0 ? (a.converted / a.assigned) * 100 : 0;
              return s + rate;
            }, 0) /
              agentPerformance.length) *
              10,
          ) / 10
        : 0;

    return {
      summary: {
        totalLeads: total,
        converted,
        conversionRate,
        inProgress: totals?.inProgress ?? 0,
        newLeads: totals?.newLeads ?? 0,
        periodLeads: periodTotal,
        periodConverted,
        periodConversionRate: periodConvRate,
        activeAgents: activeAgents?.count ?? 0,
        activeCampaigns: activeCampaigns?.count ?? 0,
        totalCalls,
        avgAgentConversionRate: avgAgentRate,
      },
      leadsByStatus,
      agentPerformance: agentPerformance.map((a) => ({
        name: a.agentName,
        assigned: a.assigned,
        converted: a.converted,
        conversions: a.converted,
        rate: a.assigned > 0 ? Math.round((a.converted / a.assigned) * 1000) / 10 : 0,
      })),
      leadsByCampaign,
      leadsBySource,
      leadsEvolution,
      conversionFunnel,
      dailyActivity,
      campaignPerformance,
    };
  }
}

export const analyticsService = new AnalyticsService();
