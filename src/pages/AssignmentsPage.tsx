import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, User, Users, ChevronRight, Check } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { useAppStore } from '@/store/appStore';
import { useLeadActions } from '@/hooks/useLeadActions';
import { Lead } from '@/types';
import { Button } from '@/components/ui/button';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function AssignmentsPage() {
  const { leads, agents } = useAppStore();
  const { assignAgent } = useLeadActions();
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  const unassigned = leads.filter(l => !l.assignedAgentId);

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAssign = () => {
    if (!selectedAgent || selectedLeads.size === 0) {
      toast.error('Sélectionnez des leads et un agent');
      return;
    }
    assignAgent([...selectedLeads], selectedAgent);
    toast.success(`${selectedLeads.size} lead(s) assigné(s)`);
    setSelectedLeads(new Set());
    setSelectedAgent('');
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Assignations</h1>
          <p className="text-sm text-muted-foreground">{unassigned.length} leads non assignés</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unassigned leads */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Leads non assignés</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedLeads(new Set(unassigned.map(l => l.id)))}
              >
                Tout sélectionner
              </Button>
            </div>
            <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {unassigned.map((lead, idx) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => toggleLead(lead.id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors',
                    selectedLeads.has(lead.id) && 'bg-primary/5'
                  )}
                  data-testid={`assign-lead-${lead.id}`}
                >
                  <div className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                    selectedLeads.has(lead.id) ? 'bg-primary border-primary' : 'border-border'
                  )}>
                    {selectedLeads.has(lead.id) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 text-xs font-bold">
                    {lead.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{lead.fullName}</p>
                    <p className="text-xs text-muted-foreground">{lead.phone} — {lead.campaignName}</p>
                  </div>
                  <LeadStatusBadge status={lead.status} size="sm" />
                </motion.div>
              ))}
              {unassigned.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <GitBranch className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-foreground">Tous les leads sont assignés</p>
                </div>
              )}
            </div>
          </div>

          {/* Agent selector */}
          <div className="space-y-4">
            <div className="bg-card border border-card-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <p className="text-sm font-semibold text-foreground">Sélectionner un agent</p>
              </div>
              <div className="divide-y divide-border">
                {agents.map(agent => (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors',
                      selectedAgent === agent.id && 'bg-primary/10 border-l-2 border-primary'
                    )}
                    data-testid={`select-agent-${agent.id}`}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {agent.firstName.charAt(0)}
                      </div>
                      <span className={cn('absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card', agent.isOnline ? 'bg-emerald-500' : 'bg-gray-400')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{agent.fullName}</p>
                      <p className="text-xs text-muted-foreground">{agent.stats.assignedLeads} leads</p>
                    </div>
                    {selectedAgent === agent.id && <Check className="h-4 w-4 text-primary" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Assign CTA */}
            <div className="bg-card border border-card-border rounded-xl p-4 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Leads sélectionnés</span>
                  <span className="font-bold text-foreground">{selectedLeads.size}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Agent cible</span>
                  <span className="font-bold text-foreground">{selectedAgent ? agents.find(a => a.id === selectedAgent)?.fullName : '—'}</span>
                </div>
              </div>
              <Button
                className="w-full gap-2"
                disabled={selectedLeads.size === 0 || !selectedAgent}
                onClick={handleAssign}
                data-testid="button-assign"
              >
                <GitBranch className="h-4 w-4" />
                Assigner {selectedLeads.size > 0 ? `(${selectedLeads.size})` : ''}
              </Button>
            </div>
          </div>
        </div>

        {/* Assigned leads by agent */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Répartition des leads par agent</h2>
          <div className="space-y-3">
            {agents.map(agent => {
              const agentLeads = leads.filter(l => l.assignedAgentId === agent.id);
              const maxLeads = Math.max(...agents.map(a => leads.filter(l => l.assignedAgentId === a.id).length));
              return (
                <div key={agent.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {agent.firstName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{agent.fullName}</span>
                      <span className="text-muted-foreground">{agentLeads.length} leads</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: maxLeads > 0 ? `${(agentLeads.length / maxLeads) * 100}%` : '0%' }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
