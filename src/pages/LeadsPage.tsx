import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, Plus, ChevronLeft, ChevronRight,
  MoreHorizontal, ChevronUp, ChevronDown, LayoutGrid, List, X, Eye, Edit, Trash2, Phone
} from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { LeadStatusBadge, PriorityBadge } from '@/components/leads/LeadStatusBadge';
import { LeadDrawer } from '@/components/leads/LeadDrawer';
import { useAppStore } from '@/store/appStore';
import { useLeadActions } from '@/hooks/useLeadActions';
import { Lead, LeadStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PAGE_SIZE = 20;
const ALL_STATUSES: LeadStatus[] = ['New', 'In Progress', 'Callback', 'Interested', 'Converted', 'Not Interested', 'No Answer', 'Invalid Number'];

const KANBAN_COLS: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'New', label: 'Nouveau', color: 'border-t-blue-500' },
  { status: 'In Progress', label: 'En cours', color: 'border-t-amber-500' },
  { status: 'Callback', label: 'Rappel', color: 'border-t-violet-500' },
  { status: 'Interested', label: 'Intéressé', color: 'border-t-indigo-500' },
  { status: 'Converted', label: 'Converti', color: 'border-t-emerald-500' },
  { status: 'Not Interested', label: 'Pas intéressé', color: 'border-t-gray-400' },
];

type SortField = 'fullName' | 'city' | 'status' | 'priority' | 'lastContact' | 'campaignName';
type SortDir = 'asc' | 'desc';

export function LeadsPage() {
  const { leads, agents, campaigns } = useAppStore();
  const { updateStatus, removeLead } = useLeadActions();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('lastContact');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    let result = leads;
    if (search) result = result.filter(l =>
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.email.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter);
    if (campaignFilter !== 'all') result = result.filter(l => l.campaignId === campaignFilter);
    if (priorityFilter !== 'all') result = result.filter(l => l.priority === priorityFilter);
    result = [...result].sort((a, b) => {
      let va: string = a[sortField] ?? '';
      let vb: string = b[sortField] ?? '';
      if (sortDir === 'asc') return va < vb ? -1 : 1;
      return va > vb ? -1 : 1;
    });
    return result;
  }, [leads, search, statusFilter, campaignFilter, priorityFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map(l => l.id)));
  };

  const handleBulkDelete = () => {
    [...selected].forEach((id) => removeLead(id));
    toast.success(`${selected.size} lead(s) supprimé(s)`);
    setSelected(new Set());
  };

  const handleStatusUpdate = (lead: Lead, status: LeadStatus) => {
    updateStatus(lead.id, status);
    toast.success(`Statut mis à jour: ${lead.fullName}`);
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      : <ChevronUp className="h-3 w-3 opacity-0 group-hover:opacity-30" />;

  const agentName = (id: string | null) => agents.find(a => a.id === id)?.fullName ?? '—';

  return (
    <PageTransition>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Leads</h1>
            <p className="text-sm text-muted-foreground">{leads.length} leads au total</p>
          </div>
          <Button className="gap-2" size="sm" onClick={() => toast.info('Formulaire ajout lead')} data-testid="button-add-lead">
            <Plus className="h-4 w-4" /> Ajouter un lead
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, téléphone, email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9"
                data-testid="input-search-leads"
              />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-40 h-9" data-testid="select-status-filter">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={campaignFilter} onValueChange={v => { setCampaignFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44 h-9" data-testid="select-campaign-filter">
                <SelectValue placeholder="Campagne" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les campagnes</SelectItem>
                {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={v => { setPriorityFilter(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-9" data-testid="select-priority-filter">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="High">Haute</SelectItem>
                <SelectItem value="Medium">Moyenne</SelectItem>
                <SelectItem value="Low">Basse</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 ml-auto">
              <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => toast.info('Export CSV')} data-testid="button-export">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
              <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setViewMode('table')} data-testid="button-view-table">
                <List className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setViewMode('kanban')} data-testid="button-view-kanban">
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk actions */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <span className="text-sm font-medium text-primary">{selected.size} sélectionné(s)</span>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => toast.info('Assignation en masse')}>Assigner</Button>
                <Button variant="outline" size="sm" onClick={() => toast.info('Changement statut masse')}>Changer statut</Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} data-testid="button-bulk-delete">Supprimer</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(new Set())}><X className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table view */}
        {viewMode === 'table' && (
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 w-10">
                      <Checkbox
                        checked={selected.size === paginated.length && paginated.length > 0}
                        onCheckedChange={toggleAll}
                        data-testid="checkbox-select-all"
                      />
                    </th>
                    {([
                      { label: 'Nom', field: 'fullName' as SortField },
                      { label: 'Téléphone', field: null },
                      { label: 'Ville', field: 'city' as SortField },
                      { label: 'Campagne', field: 'campaignName' as SortField },
                      { label: 'Agent', field: null },
                      { label: 'Statut', field: 'status' as SortField },
                      { label: 'Priorité', field: 'priority' as SortField },
                      { label: 'Dernier contact', field: 'lastContact' as SortField },
                      { label: '', field: null },
                    ] as { label: string; field: SortField | null }[]).map(col => (
                      <th
                        key={col.label}
                        className={cn('px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap group', col.field && 'cursor-pointer hover:text-foreground')}
                        onClick={() => col.field && toggleSort(col.field)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.field && <SortIcon field={col.field} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {paginated.map((lead, idx) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className={cn(
                          'border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer',
                          selected.has(lead.id) && 'bg-primary/5'
                        )}
                        onClick={() => setDrawerLead(lead)}
                        data-testid={`row-lead-${lead.id}`}
                      >
                        <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(lead.id); }}>
                          <Checkbox checked={selected.has(lead.id)} onCheckedChange={() => toggleSelect(lead.id)} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                              {lead.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-xs">{lead.fullName}</p>
                              <p className="text-muted-foreground text-xs">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{lead.phone}</td>
                        <td className="px-4 py-3 text-xs text-foreground">{lead.city}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-32 truncate">{lead.campaignName}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{agentName(lead.assignedAgentId)}</td>
                        <td className="px-4 py-3"><LeadStatusBadge status={lead.status} size="sm" /></td>
                        <td className="px-4 py-3"><PriorityBadge priority={lead.priority} /></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(lead.lastContact), 'dd MMM HH:mm', { locale: fr })}
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`menu-lead-${lead.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDrawerLead(lead)}><Eye className="h-3.5 w-3.5 mr-2" />Voir</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { handleStatusUpdate(lead, 'Converted'); }}><Edit className="h-3.5 w-3.5 mr-2" />Marquer converti</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500" onClick={() => { removeLead(lead.id); toast.success('Lead supprimé'); }}>
                                <Trash2 className="h-3.5 w-3.5 mr-2" />Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
              <p className="text-xs text-muted-foreground">
                {filtered.length} résultat(s) — Page {page}/{totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 1} onClick={() => setPage(p => p - 1)} data-testid="button-prev-page">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page - 2 + i;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <Button key={p} variant={page === p ? 'default' : 'ghost'} size="icon" className="h-7 w-7 text-xs" onClick={() => setPage(p)}>{p}</Button>
                  );
                })}
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} data-testid="button-next-page">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Kanban view */}
        {viewMode === 'kanban' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {KANBAN_COLS.map(col => {
                const colLeads = filtered.filter(l => l.status === col.status);
                return (
                  <div key={col.status} className={cn('w-64 bg-card border border-card-border rounded-xl overflow-hidden border-t-4', col.color)}>
                    <div className="px-3 py-2.5 border-b border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{col.label}</span>
                        <span className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{colLeads.length}</span>
                      </div>
                    </div>
                    <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                      {colLeads.slice(0, 15).map(lead => (
                        <motion.div
                          key={lead.id}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => setDrawerLead(lead)}
                          className="bg-background border border-border rounded-lg p-3 cursor-pointer hover:border-primary/30 transition-colors"
                          data-testid={`kanban-card-${lead.id}`}
                        >
                          <p className="text-xs font-medium text-foreground">{lead.fullName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{lead.phone}</p>
                          <div className="flex items-center justify-between mt-2">
                            <PriorityBadge priority={lead.priority} />
                            <span className="text-[10px] text-muted-foreground truncate ml-2 max-w-20">{lead.campaignName.split(' ')[0]}</span>
                          </div>
                        </motion.div>
                      ))}
                      {colLeads.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-6">Aucun lead</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lead Drawer */}
      <LeadDrawer lead={drawerLead} onClose={() => setDrawerLead(null)} />
    </PageTransition>
  );
}
