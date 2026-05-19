import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreHorizontal, TrendingUp, Phone, Users, CheckCircle2, X } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { useAppStore } from '@/store/appStore';
import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ROLE_LABELS = { Admin: 'Administrateur', Supervisor: 'Superviseur', Agent: 'Agent' };
const ROLE_COLORS = {
  Admin: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  Supervisor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  Agent: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="bg-card border border-card-border rounded-xl p-4 hover:shadow-md transition-shadow"
      data-testid={`card-agent-${agent.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {agent.firstName.charAt(0)}{agent.lastName.charAt(0)}
            </div>
            <span className={cn('absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card', agent.isOnline ? 'bg-emerald-500' : 'bg-gray-400')} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{agent.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" data-testid={`menu-agent-${agent.id}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info('Profil agent')}>Voir profil</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('Modifier agent')}>Modifier</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-amber-500" onClick={() => toast.warning('Agent suspendu')}>Suspendre</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500" onClick={() => toast.error('Agent supprimé')}>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[agent.role])}>{ROLE_LABELS[agent.role]}</span>
        <span className={cn('text-xs font-medium', agent.isOnline ? 'text-emerald-500' : 'text-muted-foreground')}>
          {agent.isOnline ? '● En ligne' : '○ Hors ligne'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {[
          { icon: Users, label: 'Leads', value: agent.stats.assignedLeads },
          { icon: CheckCircle2, label: 'Convertis', value: agent.stats.converted },
          { icon: TrendingUp, label: 'Conv.', value: `${agent.stats.conversionRate}%` },
          { icon: Phone, label: "Appels", value: agent.stats.todaysCalls },
        ].map(stat => (
          <div key={stat.label} className="bg-muted/40 rounded-lg p-2">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
              <stat.icon className="h-2.5 w-2.5" />{stat.label}
            </div>
            <p className="text-sm font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground mt-2.5">
        Actif: {format(new Date(agent.lastActivity), 'dd MMM HH:mm', { locale: fr })}
      </p>
    </motion.div>
  );
}

const PERF_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `J-${13 - i}`,
  Conversions: Math.floor(Math.random() * 6 + 1),
  Appels: Math.floor(Math.random() * 30 + 10),
}));

export function AgentsPage() {
  const { agents } = useAppStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = agents.filter(a => {
    const matchSearch = a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || a.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'online' ? a.isOnline : !a.isOnline);
    return matchSearch && matchRole && matchStatus;
  });

  const onlineCount = agents.filter(a => a.isOnline).length;

  return (
    <PageTransition>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Agents</h1>
            <p className="text-sm text-muted-foreground">
              <span className="text-emerald-500 font-medium">{onlineCount}</span> en ligne · {agents.length} total
            </p>
          </div>
          <Button className="gap-2" size="sm" onClick={() => toast.info('Formulaire ajout agent')} data-testid="button-add-agent">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un agent..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
              data-testid="input-search-agents"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36 h-9" data-testid="select-role-filter">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Supervisor">Superviseur</SelectItem>
              <SelectItem value="Agent">Agent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9" data-testid="select-status-filter">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="online">En ligne</SelectItem>
              <SelectItem value="offline">Hors ligne</SelectItem>
            </SelectContent>
          </Select>
          {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
            <Button variant="ghost" size="sm" className="h-9 gap-1.5" onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); }}>
              <X className="h-3.5 w-3.5" />Réinitialiser
            </Button>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((agent, idx) => (
              <AgentCard key={agent.id} agent={agent} index={idx} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              Aucun agent trouvé
            </div>
          )}
        </div>

        {/* Team perf chart */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Performance équipe (14 jours)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={PERF_DATA} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="Conversions" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Appels" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rankings table */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Classement des agents</h2>
            <span className="text-xs text-muted-foreground">{agents.length} agents</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {['#', 'Agent', 'Rôle', 'Leads', 'Convertis', 'Taux', 'Appels', 'Statut'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...agents].sort((a, b) => b.stats.conversionRate - a.stats.conversionRate).map((agent, idx) => (
                  <tr key={agent.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors" data-testid={`row-agent-${agent.id}`}>
                    <td className="px-4 py-3 text-xs font-bold text-muted-foreground">#{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-shrink-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {agent.firstName.charAt(0)}{agent.lastName.charAt(0)}
                          </div>
                          <span className={cn('absolute bottom-0 right-0 w-2 h-2 rounded-full border border-card', agent.isOnline ? 'bg-emerald-500' : 'bg-gray-400')} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{agent.fullName}</p>
                          <p className="text-[10px] text-muted-foreground truncate hidden sm:block">{agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[agent.role])}>{ROLE_LABELS[agent.role]}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{agent.stats.assignedLeads}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground">{agent.stats.converted}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-bold', agent.stats.conversionRate >= 20 ? 'text-emerald-500' : agent.stats.conversionRate >= 12 ? 'text-amber-500' : 'text-red-400')}>
                        {agent.stats.conversionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{agent.stats.todaysCalls}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium', agent.isOnline ? 'text-emerald-500' : 'text-muted-foreground')}>
                        {agent.isOnline ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
