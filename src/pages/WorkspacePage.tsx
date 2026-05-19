import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, CheckCircle2, Clock, ChevronRight, MessageSquare, Calendar, SkipForward, PhoneCall, X } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { LeadStatusBadge, PriorityBadge } from '@/components/leads/LeadStatusBadge';
import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/hooks/useAuth';
import { useLeadActions } from '@/hooks/useLeadActions';
import { LeadStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const QUICK_STATUSES: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'Converted', label: 'Converti', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' },
  { status: 'Interested', label: 'Intéressé', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300' },
  { status: 'Callback', label: 'Rappel', color: 'bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-950/50 dark:text-violet-300' },
  { status: 'Not Interested', label: 'Pas intéressé', color: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400' },
  { status: 'No Answer', label: 'Pas de réponse', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-950/50 dark:text-orange-300' },
  { status: 'Invalid Number', label: 'Invalide', color: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-300' },
];

export function WorkspacePage() {
  const { leads, agents } = useAppStore();
  const { user } = useAuth();
  const { updateStatus: patchStatus, addLeadNote } = useLeadActions();
  const [queueIndex, setQueueIndex] = useState(0);
  const [note, setNote] = useState('');
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const myLeads = leads.filter(l => l.assignedAgentId === user?.id && l.status !== 'Converted');
  const donesToday = leads.filter(l => l.assignedAgentId === user?.id && l.status === 'Converted').length;
  const totalInQueue = myLeads.length;
  const currentLead = myLeads[queueIndex] ?? null;

  const updateStatus = (status: LeadStatus) => {
    if (!currentLead) return;
    patchStatus(currentLead.id, status);
    toast.success(`Statut mis à jour: ${status}`);
    if (queueIndex < totalInQueue - 1) setQueueIndex(i => i + 1);
  };

  const addNote = () => {
    if (!currentLead || !note.trim()) return;
    addLeadNote(currentLead.id, note.trim());
    setNote('');
    toast.success('Note ajoutée');
  };

  const handleCall = () => {
    setCallActive(true);
    toast.success(`Appel vers ${currentLead?.phone}`);
    const interval = setInterval(() => setCallDuration(d => d + 1), 1000);
    setTimeout(() => { clearInterval(interval); setCallActive(false); setCallDuration(0); }, 30000);
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Workspace Agent</h1>
            <p className="text-sm text-muted-foreground">Votre espace de travail personnalisé</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-card border border-card-border rounded-xl px-4 py-2 text-center">
              <p className="text-lg font-bold text-foreground">{donesToday}</p>
              <p className="text-xs text-muted-foreground">Terminés</p>
            </div>
            <div className="bg-card border border-card-border rounded-xl px-4 py-2 text-center">
              <p className="text-lg font-bold text-foreground">{totalInQueue}</p>
              <p className="text-xs text-muted-foreground">En file</p>
            </div>
            <div className="bg-card border border-card-border rounded-xl px-4 py-2 text-center">
              <p className="text-lg font-bold text-amber-500">{totalInQueue - queueIndex}</p>
              <p className="text-xs text-muted-foreground">Restants</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-96">
          {/* Call queue */}
          <div className="bg-card border border-card-border rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border bg-muted/20">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">File d'appels ({totalInQueue})</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {myLeads.map((lead, idx) => (
                <motion.div
                  key={lead.id}
                  onClick={() => setQueueIndex(idx)}
                  className={cn(
                    'px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors',
                    idx === queueIndex && 'bg-primary/10 border-l-2 border-primary'
                  )}
                  data-testid={`queue-item-${lead.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">{lead.fullName}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <PriorityBadge priority={lead.priority} />
                      {idx === queueIndex && <ChevronRight className="h-3 w-3 text-primary" />}
                    </div>
                  </div>
                </motion.div>
              ))}
              {myLeads.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
                  <p className="text-sm font-medium text-foreground">File vide</p>
                  <p className="text-xs text-muted-foreground mt-1">Tous vos leads ont été traités</p>
                </div>
              )}
            </div>
          </div>

          {/* Active lead */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {currentLead ? (
              <>
                {/* Lead info + call button */}
                <div className="bg-card border border-card-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-foreground">{currentLead.fullName}</h2>
                        <LeadStatusBadge status={currentLead.status} />
                        <PriorityBadge priority={currentLead.priority} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{currentLead.campaignName}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {queueIndex + 1}/{totalInQueue}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Téléphone</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{currentLead.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{currentLead.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ville</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{currentLead.city}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dernier contact</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">
                        {format(new Date(currentLead.lastContact), 'dd MMM HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  {/* Call button */}
                  <AnimatePresence mode="wait">
                    {callActive ? (
                      <motion.div
                        key="calling"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4"
                      >
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                          <PhoneCall className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">En cours d'appel...</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">{formatDuration(callDuration)}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-auto gap-2"
                          onClick={() => { setCallActive(false); setCallDuration(0); }}
                          data-testid="button-end-call"
                        >
                          <X className="h-4 w-4" />Terminer
                        </Button>
                      </motion.div>
                    ) : (
                      <Button
                        className="w-full h-11 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={handleCall}
                        data-testid="button-call"
                      >
                        <Phone className="h-5 w-5" />
                        Appeler {currentLead.phone}
                      </Button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick status + notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div className="bg-card border border-card-border rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Résultat de l'appel</p>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_STATUSES.map(s => (
                        <button
                          key={s.status}
                          onClick={() => updateStatus(s.status)}
                          className={cn('px-3 py-2 rounded-lg text-xs font-medium transition-colors text-center', s.color)}
                          data-testid={`button-quick-status-${s.status}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => { if (queueIndex < totalInQueue - 1) setQueueIndex(i => i + 1); else toast.info('Fin de la file'); }}
                        data-testid="button-skip"
                      >
                        <SkipForward className="h-3.5 w-3.5" />Lead suivant
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => toast.info('Rappel planifié')}
                        data-testid="button-schedule"
                      >
                        <Calendar className="h-3.5 w-3.5" />Planifier rappel
                      </Button>
                    </div>
                  </div>

                  <div className="bg-card border border-card-border rounded-xl p-4 space-y-3 flex flex-col">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes rapides</p>
                    <Textarea
                      placeholder="Note sur l'appel..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      className="flex-1 text-sm resize-none"
                      rows={4}
                      data-testid="textarea-workspace-note"
                    />
                    <Button size="sm" className="gap-2" onClick={addNote} disabled={!note.trim()} data-testid="button-save-note">
                      <MessageSquare className="h-3.5 w-3.5" />Enregistrer la note
                    </Button>
                    {currentLead.notes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Notes précédentes</p>
                        {currentLead.notes.slice(-2).map(n => (
                          <div key={n.id} className="bg-muted/50 rounded-lg p-2.5 text-xs text-foreground">
                            <p>{n.content}</p>
                            <p className="text-muted-foreground mt-1">{format(new Date(n.createdAt), 'dd MMM HH:mm', { locale: fr })}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Keyboard hints */}
                <div className="bg-muted/30 border border-border rounded-xl px-4 py-2.5 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>Raccourcis:</span>
                  <span><kbd className="bg-background border border-border rounded px-1.5 py-0.5 text-[10px]">→</kbd> Lead suivant</span>
                  <span><kbd className="bg-background border border-border rounded px-1.5 py-0.5 text-[10px]">C</kbd> Appeler</span>
                  <span><kbd className="bg-background border border-border rounded px-1.5 py-0.5 text-[10px]">N</kbd> Note</span>
                </div>
              </>
            ) : (
              <div className="bg-card border border-card-border rounded-xl flex-1 flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-foreground">File d'appels vide</h3>
                  <p className="text-sm text-muted-foreground mt-1">Tous les leads ont été traités pour aujourd'hui.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
