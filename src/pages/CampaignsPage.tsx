import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Users, TrendingUp, MoreHorizontal, ChevronRight } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { useAppStore } from '@/store/appStore';
import { Campaign, CampaignStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { CAMPAIGN_DAILY_DATA } from '@/data/campaigns';

const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string }> = {
  Active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  Draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  Completed: { label: 'Terminée', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
  Paused: { label: 'En pause', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
};

function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const progress = campaign.stats.totalLeads > 0
    ? (campaign.stats.leadsAssigned / campaign.stats.totalLeads) * 100
    : 0;
  const cfg = STATUS_CONFIG[campaign.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border border-card-border rounded-xl p-5 hover:shadow-md transition-shadow group"
      data-testid={`card-campaign-${campaign.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-foreground truncate">{campaign.name}</h3>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', cfg.className)}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{campaign.description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" data-testid={`menu-campaign-${campaign.id}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info('Détails campagne')}>Voir détails</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('Modifier campagne')}>Modifier</DropdownMenuItem>
            <DropdownMenuSeparator />
            {campaign.status === 'Active' && (
              <DropdownMenuItem className="text-amber-500" onClick={() => toast.warning('Campagne en pause')}>Mettre en pause</DropdownMenuItem>
            )}
            {campaign.status === 'Paused' && (
              <DropdownMenuItem className="text-emerald-500" onClick={() => toast.success('Campagne réactivée')}>Réactiver</DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-red-500" onClick={() => toast.error('Campagne supprimée')}>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{format(new Date(campaign.startDate), 'dd MMM yyyy', { locale: fr })}</span>
        <ChevronRight className="h-3 w-3" />
        <span>{format(new Date(campaign.endDate), 'dd MMM yyyy', { locale: fr })}</span>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Leads assignés</span>
          <span className="font-medium text-foreground">{campaign.stats.leadsAssigned}/{campaign.stats.totalLeads}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: index * 0.06 + 0.3, duration: 0.7 }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{progress.toFixed(0)}% de la cible</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-muted/40 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-3 w-3" />Conversion
          </div>
          <p className="text-sm font-bold text-foreground">{campaign.stats.conversionRate}%</p>
        </div>
        <div className="bg-muted/40 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Users className="h-3 w-3" />Agents
          </div>
          <p className="text-sm font-bold text-foreground">{campaign.stats.numberOfAgents}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function CampaignsPage() {
  const { campaigns } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = statusFilter === 'all' ? campaigns : campaigns.filter(c => c.status === statusFilter);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Campagnes</h1>
            <p className="text-sm text-muted-foreground">{campaigns.length} campagnes au total</p>
          </div>
          <Button className="gap-2" size="sm" onClick={() => toast.info('Nouvelle campagne')} data-testid="button-create-campaign">
            <Plus className="h-4 w-4" /> Créer une campagne
          </Button>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'Active', 'Draft', 'Paused', 'Completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
              data-testid={`filter-status-${s}`}
            >
              {s === 'all' ? 'Toutes' : STATUS_CONFIG[s as CampaignStatus].label}
              {' '}({s === 'all' ? campaigns.length : campaigns.filter(c => c.status === s).length})
            </button>
          ))}
        </div>

        {/* Campaign cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, idx) => <CampaignCard key={c.id} campaign={c} index={idx} />)}
        </div>

        {/* Chart */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Conversions par campagne (30 jours)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CAMPAIGN_DAILY_DATA.slice(-10)} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="Immobilier" fill="#3b82f6" radius={[3,3,0,0]} />
              <Bar dataKey="Assurance" fill="#8b5cf6" radius={[3,3,0,0]} />
              <Bar dataKey="Formation" fill="#10b981" radius={[3,3,0,0]} />
              <Bar dataKey="Télécom" fill="#f59e0b" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[
              { label: 'Immobilier', color: '#3b82f6' },
              { label: 'Assurance', color: '#8b5cf6' },
              { label: 'Formation', color: '#10b981' },
              { label: 'Télécom', color: '#f59e0b' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />{l.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
