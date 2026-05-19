import { useAppStore } from "@/store/appStore";
import {
  useUpdateLead,
  useAddLeadNote,
  useDeleteLead,
  useBulkAssignLeads,
} from "@/hooks/useAppData";
import type { Lead, LeadStatus } from "@/types";
import { toast } from "sonner";

export function useLeadActions() {
  const { leads, setLeads } = useAppStore();
  const updateLead = useUpdateLead();
  const addNote = useAddLeadNote();
  const deleteLead = useDeleteLead();
  const bulkAssign = useBulkAssignLeads();

  const updateStatus = (leadId: string, status: LeadStatus) => {
    setLeads(leads.map((l) => (l.id === leadId ? { ...l, status } : l)));
    updateLead.mutate(
      { id: leadId, status },
      { onError: () => toast.error("Échec de la mise à jour du lead") },
    );
  };

  const assignAgent = (leadIds: string[], agentId: string) => {
    bulkAssign.mutate(
      { leadIds, agentId },
      {
        onSuccess: (data) => setLeads(data),
        onError: () => toast.error("Échec de l'assignation"),
      },
    );
  };

  const addLeadNote = (leadId: string, content: string) => {
    addNote.mutate(
      { leadId, content },
      {
        onSuccess: (updated) =>
          setLeads(leads.map((l) => (l.id === leadId ? updated : l))),
        onError: () => toast.error("Impossible d'ajouter la note"),
      },
    );
  };

  const removeLead = (leadId: string) => {
    setLeads(leads.filter((l) => l.id !== leadId));
    deleteLead.mutate(leadId, {
      onError: () => toast.error("Impossible de supprimer le lead"),
    });
  };

  return { updateStatus, assignAgent, addLeadNote, removeLead, leads, setLeads };
}
