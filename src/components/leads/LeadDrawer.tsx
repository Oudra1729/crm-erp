import { Lead, LeadStatus } from '@/types';
import { useAppStore } from '@/store/appStore';
import { useLeadActions } from '@/hooks/useLeadActions';
import { LeadStatusBadge, PriorityBadge } from './LeadStatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { X, Phone, Mail, MapPin, Tag, Clock, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const STATUS_BUTTONS: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'Converted', label: 'Converti', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' },
  { status: 'Interested', label: 'Intéressé', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300' },
  { status: 'Callback', label: 'Rappel', color: 'bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-950/50 dark:text-violet-300' },
  { status: 'Not Interested', label: 'Pas intéressé', color: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400' },
  { status: 'No Answer', label: 'Pas réponse', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-950/50 dark:text-orange-300' },
];

interface Props {
  lead: Lead | null;
  onClose: () => void;
}

export function LeadDrawer({ lead, onClose }: Props) {
  const { agents } = useAppStore();
  const { updateStatus: patchStatus, addLeadNote } = useLeadActions();
  const [noteText, setNoteText] = useState('');

  const agentName = (id: string | null) => agents.find(a => a.id === id)?.fullName ?? 'Non assigné';

  const updateStatus = (status: LeadStatus) => {
    if (!lead) return;
    patchStatus(lead.id, status);
    toast.success(`Statut: ${status}`);
  };

  const addNote = () => {
    if (!lead || !noteText.trim()) return;
    addLeadNote(lead.id, noteText.trim());
    setNoteText('');
    toast.success('Note ajoutée');
  };

  return (
    <AnimatePresence>
      {lead && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl"
            data-testid="lead-drawer"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-foreground">{lead.fullName}</h2>
                  <LeadStatusBadge status={lead.status} />
                  <PriorityBadge priority={lead.priority} />
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{lead.campaignName}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onClose} data-testid="button-close-drawer">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick status update */}
            <div className="px-5 py-3 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Mise à jour rapide</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_BUTTONS.map(btn => (
                  <button
                    key={btn.status}
                    onClick={() => updateStatus(btn.status)}
                    className={cn('px-2.5 py-1 rounded-lg text-xs font-medium transition-colors', btn.color)}
                    data-testid={`button-status-${btn.status}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="overview" className="h-full flex flex-col">
                <TabsList className="px-5 rounded-none border-b border-border bg-transparent justify-start gap-0 h-10">
                  <TabsTrigger value="overview" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Vue</TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Notes ({lead.notes.length})</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Historique</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto">
                  {/* Overview */}
                  <TabsContent value="overview" className="p-5 space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: Phone, label: 'Téléphone', value: lead.phone },
                        { icon: Mail, label: 'Email', value: lead.email },
                        { icon: MapPin, label: 'Ville', value: lead.city },
                        { icon: User, label: 'Agent', value: agentName(lead.assignedAgentId) },
                        { icon: Clock, label: 'Dernier contact', value: format(new Date(lead.lastContact), 'dd MMM HH:mm', { locale: fr }) },
                        { icon: Clock, label: 'Créé le', value: format(new Date(lead.createdAt), 'dd MMM yyyy', { locale: fr }) },
                      ].map(item => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <item.icon className="h-3 w-3" />{item.label}
                          </div>
                          <p className="text-sm font-medium text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {lead.tags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <Tag className="h-3 w-3" />Tags
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {lead.tags.map(tag => (
                            <span key={tag} className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-border">
                      <Button className="w-full gap-2" size="sm" onClick={() => toast.info(`Appel vers ${lead.phone}`)} data-testid="button-call-lead">
                        <Phone className="h-4 w-4" />Appeler maintenant
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Notes */}
                  <TabsContent value="notes" className="p-5 space-y-4 mt-0">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Ajouter une note..."
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        className="text-sm resize-none"
                        rows={3}
                        data-testid="textarea-note"
                      />
                      <Button size="sm" onClick={addNote} disabled={!noteText.trim()} className="gap-2" data-testid="button-add-note">
                        <MessageSquare className="h-3.5 w-3.5" />Ajouter la note
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {lead.notes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Aucune note pour ce lead.</p>
                      ) : (
                        lead.notes.map(note => (
                          <div key={note.id} className="bg-muted/50 rounded-xl p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground">{note.authorName}</span>
                              <span className="text-xs text-muted-foreground">{format(new Date(note.createdAt), 'dd MMM HH:mm', { locale: fr })}</span>
                            </div>
                            <p className="text-sm text-foreground">{note.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Timeline */}
                  <TabsContent value="timeline" className="p-5 mt-0">
                    <div className="space-y-3">
                      {[
                        { label: 'Lead créé', time: lead.createdAt, color: 'bg-blue-500' },
                        { label: 'Premier contact', time: lead.lastContact, color: 'bg-violet-500' },
                        { label: `Statut: ${lead.status}`, time: lead.lastContact, color: 'bg-amber-500' },
                      ].map((event, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1', event.color)} />
                            {idx < 2 && <div className="w-px flex-1 bg-border mt-1 mb-0 h-6" />}
                          </div>
                          <div className="pb-3">
                            <p className="text-sm font-medium text-foreground">{event.label}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(event.time), 'dd MMM yyyy HH:mm', { locale: fr })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
