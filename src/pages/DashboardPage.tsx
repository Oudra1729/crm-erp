import { PageTransition } from '@/components/shared/PageTransition';
import { StatCard } from '@/components/shared/StatCard';
import { useAppStore } from '@/store/appStore';
import { LEADS_EVOLUTION, CONVERSION_FUNNEL, AGENT_PERFORMANCE, CAMPAIGN_PERFORMANCE, RECENT_ACTIVITY } from '@/data/analytics';
import {
  Users, UserCheck, Megaphone, TrendingUp, Phone, CheckCircle2,
  Upload, Plus, UserPlus, GitBranch, Clock, FileText, ArrowRight, Activity
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  import: Upload,
  status: Activity,
  note: FileText,
  callback: Clock,
  assign: UserCheck,
  call: Phone,
};

const ACTIVITY_COLORS: Record<string, string> = {
  import: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  status: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  note: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
  callback: 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400',
  assign: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400',
  call: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
};

export function DashboardPage() {
  const { leads, agents, campaigns } = useAppStore();

  const totalLeads = leads.length;
  const activeAgents = agents.filter(a => a.isOnline).length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  const converted = leads.filter(l => l.status === 'Converted').length;
  const convRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : '0';
  const todayCalls = agents.reduce((s, a) => s + a.stats.todaysCalls, 0);

  const quickActions = [
    { label: 'Importer CSV', icon: Upload, href: '/import', color: 'text-blue-500' },
    { label: 'Créer campagne', icon: Plus, href: '/campaigns', color: 'text-violet-500' },
    { label: 'Ajouter agent', icon: UserPlus, href: '/agents', color: 'text-emerald-500' },
    { label: 'Assigner leads', icon: GitBranch, href: '/assignments', color: 'text-amber-500' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de votre activité commerciale</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Leads" value={totalLeads} icon={<Users className="h-4 w-4" />} trend={12.5} trendLabel="vs hier" color="blue" index={0} />
          <StatCard title="Agents actifs" value={`${activeAgents}/${agents.length}`} icon={<UserCheck className="h-4 w-4" />} color="green" index={1} />
          <StatCard title="Campagnes actives" value={activeCampaigns} icon={<Megaphone className="h-4 w-4" />} color="purple" index={2} />
          <StatCard title="Leads convertis" value={converted} icon={<CheckCircle2 className="h-4 w-4" />} trend={8.3} trendLabel="vs hier" color="green" index={3} />
          <StatCard title="Taux de conversion" value={`${convRate}%`} icon={<TrendingUp className="h-4 w-4" />} trend={2.1} trendLabel="vs hier" color="cyan" index={4} />
          <StatCard title="Appels aujourd'hui" value={todayCalls} icon={<Phone className="h-4 w-4" />} trend={-3.2} trendLabel="vs hier" color="amber" index={5} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Leads evolution */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Évolution des leads (30 jours)</h2>
              <span className="text-xs text-muted-foreground">Derniers 30 jours</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={LEADS_EVOLUTION} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="Nouveaux" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Convertis" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Rappels" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3">
              {[{ label: 'Nouveaux', color: '#3b82f6' }, { label: 'Convertis', color: '#10b981' }, { label: 'Rappels', color: '#f59e0b' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Conversion funnel */}
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Entonnoir de conversion</h2>
            <div className="space-y-2">
              {CONVERSION_FUNNEL.map((item, idx) => (
                <div key={item.stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.stage}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                  <div className="h-5 bg-muted rounded-md overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / CONVERSION_FUNNEL[0].value) * 100}%` }}
                      transition={{ delay: idx * 0.1 + 0.3, duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-md"
                      style={{ backgroundColor: item.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Campaign performance */}
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Performance campagnes</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={CAMPAIGN_PERFORMANCE} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="leads" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Leads" />
                <Bar dataKey="converted" fill="#10b981" radius={[3, 3, 0, 0]} name="Convertis" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Agent performance */}
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Top agents (conversions)</h2>
            <div className="space-y-3">
              {AGENT_PERFORMANCE.sort((a, b) => b.conversions - a.conversions).map((agent, idx) => (
                <div key={agent.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">#{idx + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{agent.name}</span>
                      <span className="text-muted-foreground">{agent.conversions}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(agent.conversions / 55) * 100}%` }}
                        transition={{ delay: idx * 0.1 + 0.3, duration: 0.6 }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent activity */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Activité récente</h2>
              <Link href="/leads">
                <button className="text-xs text-primary hover:underline flex items-center gap-1">
                  Tout voir <ArrowRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((item, idx) => {
                const Icon = ACTIVITY_ICONS[item.type] ?? Activity;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-3"
                  >
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', ACTIVITY_COLORS[item.type])}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.subject}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, icon: Icon, href, color }) => (
                <Link key={label} href={href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all cursor-pointer text-center"
                    data-testid={`quick-action-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className={cn('h-5 w-5', color)} />
                    <span className="text-xs font-medium text-foreground leading-tight">{label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
