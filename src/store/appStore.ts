import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  createElement,
} from "react";
import { Lead, Agent, Campaign, Notification } from "../types";
import {
  useLeads,
  useAgents,
  useCampaigns,
  useNotifications,
} from "@/hooks/useAppData";

interface AppState {
  leads: Lead[];
  agents: Agent[];
  campaigns: Campaign[];
  notifications: Notification[];
  sidebarCollapsed: boolean;
  isLoading: boolean;
  setLeads: (leads: Lead[]) => void;
  setAgents: (agents: Agent[]) => void;
  setCampaigns: (campaigns: Campaign[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  unreadCount: number;
  refetchAll: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const leadsQuery = useLeads();
  const agentsQuery = useAgents();
  const campaignsQuery = useCampaigns();
  const notificationsQuery = useNotifications();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (leadsQuery.data) setLeads(leadsQuery.data);
  }, [leadsQuery.data]);

  useEffect(() => {
    if (agentsQuery.data) setAgents(agentsQuery.data);
  }, [agentsQuery.data]);

  useEffect(() => {
    if (campaignsQuery.data) setCampaigns(campaignsQuery.data);
  }, [campaignsQuery.data]);

  useEffect(() => {
    if (notificationsQuery.data) setNotifications(notificationsQuery.data);
  }, [notificationsQuery.data]);

  const isLoading =
    leadsQuery.isLoading ||
    agentsQuery.isLoading ||
    campaignsQuery.isLoading ||
    notificationsQuery.isLoading;

  const refetchAll = () => {
    leadsQuery.refetch();
    agentsQuery.refetch();
    campaignsQuery.refetch();
    notificationsQuery.refetch();
  };

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return createElement(AppContext.Provider, {
    value: {
      leads,
      agents,
      campaigns,
      notifications,
      sidebarCollapsed,
      isLoading,
      unreadCount,
      setLeads,
      setAgents,
      setCampaigns,
      setNotifications,
      toggleSidebar,
      setSidebarCollapsed,
      refetchAll,
    },
  }, children);
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}
