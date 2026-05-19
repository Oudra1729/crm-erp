import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, Phone, Users, CheckCircle2, BarChart3 } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { LEADS_EVOLUTION, CONVERSION_FUNNEL, AGENT_PERFORMANCE, DAILY_ACTIVITY, LEADS_BY_SOURCE } from '@/data/analytics';
import { useAppStore } from '@/store/appStore';

const DATE_RANGES = ['7 jours', '30 jours', '3 mois', '6 mois'] as const;

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<string>('30 jours');
  const { leads, agents } = useAppStore();

  const converted = leads.filter(l => l.status === 'Converted').length;
  const convRate = leads.length > 0 ? ((converted / leads.length) * 100).toFixed(1) : '0';
  const totalCalls = agents.reduce((s, a) => s + a.stats.todaysCalls, 0);
  const avgConv = (agents.reduce((s, a) => s + a.stats.conversionRate, 0) / agents.length).toFixed(1);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Analytiques</h1>
            <p className="text-sm text-muted-foreground">Analyse de performance complète</p>
          </div>
          <div className="flex items-center gap-2">
            {DATE_RANGES.map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  dateRange === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                data-testid={`filter-date-${r}`}
              >
                {r}
              </button>
            ))}
            <Button variant="outline" size="sm" className="gap-2 ml-2" onClick={() => toast.info('Export rapport')} data-testid="button-export-report">
              <Download className="h-3.5 w-3.5" />Exporter
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Taux de conversion" value={`${convRate}%`} icon={<TrendingUp className="h-4 w-4" />} trend={2.3} trendLabel="vs période préc." color="blue" index={0} />
          <StatCard title="Leads convertis" value={converted} icon={<CheckCircle2 className="h-4 w-4" />} trend={8.1} trendLabel="vs période préc." color="green" index={1} />
          <StatCard title="Appels totaux" value={totalCalls} icon={<Phone className="h-4 w-4" />} trend={-1.4} trendLabel="vs période préc." color="amber" index={2} />
          <StatCard title="Conv. moy. agents" value={`${avgConv}%`} icon={<Users className="h-4 w-4" />} color="purple" index={3} />
        </div>

        {/* Main charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Evolution line chart */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Taux de conversion (évolution)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={LEADS_EVOLUTION} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} interval={5} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="Nouveaux" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Nouveaux leads" />
                <Line type="monotone" dataKey="Convertis" stroke="#10b981" strokeWidth={2.5} dot={false} name="Convertis" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Leads by source */}
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Leads par source</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={LEADS_BY_SOURCE} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {LEADS_BY_SOURCE.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {LEADS_BY_SOURCE.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.fill }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily activity */}
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Activité quotidienne</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={DAILY_ACTIVITY} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="Appels" fill="#3b82f6" radius={[3,3,0,0]} />
                <Bar dataKey="Conversions" fill="#10b981" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Agent productivity */}
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Productivité agents</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left text-xs font-semibold text-muted-foreground">Agent</th>
                    <th className="pb-2 text-right text-xs font-semibold text-muted-foreground">Appels</th>
                    <th className="pb-2 text-right text-xs font-semibold text-muted-foreground">Conv.</th>
                    <th className="pb-2 text-right text-xs font-semibold text-muted-foreground">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  {AGENT_PERFORMANCE.sort((a, b) => b.conversions - a.conversions).map((a, idx) => {
                    const calls = Math.floor(a.conversions * (100 / 28));
                    const rate = ((a.conversions / calls) * 100).toFixed(1);
                    return (
                      <tr key={a.name} className="border-b border-border last:border-0" data-testid={`row-perf-${idx}`}>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                              {a.name.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-foreground">{a.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-right text-xs text-muted-foreground">{calls}</td>
                        <td className="py-2.5 text-right text-xs font-medium text-foreground">{a.conversions}</td>
                        <td className="py-2.5 text-right">
                          <span className={`text-xs font-bold ${parseFloat(rate) >= 20 ? 'text-emerald-500' : parseFloat(rate) >= 15 ? 'text-amber-500' : 'text-red-400'}`}>{rate}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Entonnoir de conversion complet</h2>
          <div className="flex items-end justify-center gap-4 h-48">
            {CONVERSION_FUNNEL.map((item, idx) => {
              const maxVal = CONVERSION_FUNNEL[0].value;
              const height = (item.value / maxVal) * 100;
              return (
                <motion.div
                  key={item.stage}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: idx * 0.1 + 0.2, duration: 0.6, ease: 'easeOut' }}
                  className="flex-1 rounded-t-lg flex flex-col items-center justify-start pt-2 min-h-[20px]"
                  style={{ backgroundColor: item.fill + '30', border: `2px solid ${item.fill}` }}
                >
                  <span className="text-xs font-bold" style={{ color: item.fill }}>{item.value}</span>
                </motion.div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-3">
            {CONVERSION_FUNNEL.map(item => (
              <div key={item.stage} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.fill }} />{item.stage}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
