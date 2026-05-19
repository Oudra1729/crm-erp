import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Megaphone, UserCheck, GitBranch, BarChart3,
  Upload, CheckSquare, Headphones, Bell, Settings, Search, ArrowRight,
  Phone, User, TrendingUp, Hash
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
  keywords?: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const NAV_COMMANDS = [
  { label: 'Dashboard', description: 'Vue d\'ensemble', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Leads', description: 'Gestion des leads CRM', icon: Users, path: '/leads' },
  { label: 'Campagnes', description: 'Gestion des campagnes', icon: Megaphone, path: '/campaigns' },
  { label: 'Agents', description: 'Équipe commerciale', icon: UserCheck, path: '/agents' },
  { label: 'Assignations', description: 'Assigner des leads', icon: GitBranch, path: '/assignments' },
  { label: 'Analytiques', description: 'Rapports et statistiques', icon: BarChart3, path: '/analytics' },
  { label: 'Import CSV', description: 'Importer des données', icon: Upload, path: '/import' },
  { label: 'Tâches', description: 'Mes tâches', icon: CheckSquare, path: '/tasks' },
  { label: 'Workspace', description: 'Espace agent call center', icon: Headphones, path: '/workspace' },
  { label: 'Notifications', description: 'Centre de notifications', icon: Bell, path: '/notifications' },
  { label: 'Paramètres', description: 'Configuration système', icon: Settings, path: '/settings' },
];

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [, setLocation] = useLocation();
  const { leads, agents, campaigns } = useAppStore();

  const navigate = useCallback((path: string) => {
    setLocation(path);
    onClose();
    setQuery('');
  }, [setLocation, onClose]);

  const allCommands: CommandItem[] = [
    ...NAV_COMMANDS.map(n => ({
      id: `nav-${n.path}`,
      label: n.label,
      description: n.description,
      icon: n.icon,
      action: () => navigate(n.path),
      category: 'Navigation',
      keywords: [n.label.toLowerCase()],
    })),
    ...leads.slice(0, 20).map(l => ({
      id: `lead-${l.id}`,
      label: l.fullName,
      description: `${l.phone} · ${l.status}`,
      icon: User,
      action: () => navigate('/leads'),
      category: 'Leads',
      keywords: [l.fullName.toLowerCase(), l.phone, l.email.toLowerCase()],
    })),
    ...agents.map(a => ({
      id: `agent-${a.id}`,
      label: a.fullName,
      description: `${a.role} · ${a.isOnline ? 'En ligne' : 'Hors ligne'}`,
      icon: UserCheck,
      action: () => navigate('/agents'),
      category: 'Agents',
      keywords: [a.fullName.toLowerCase(), a.email.toLowerCase(), a.role.toLowerCase()],
    })),
    ...campaigns.map(c => ({
      id: `camp-${c.id}`,
      label: c.name,
      description: `${c.status} · ${c.stats.totalLeads} leads`,
      icon: Megaphone,
      action: () => navigate('/campaigns'),
      category: 'Campagnes',
      keywords: [c.name.toLowerCase()],
    })),
  ];

  const filtered = query.trim()
    ? allCommands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(query.toLowerCase()) ||
        cmd.keywords?.some(k => k.includes(query.toLowerCase()))
      )
    : allCommands.filter(c => c.category === 'Navigation');

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const flatItems = Object.values(grouped).flat();

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    if (!open) { setQuery(''); return; }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, flatItems.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && flatItems[activeIndex]) { flatItems[activeIndex].action(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, flatItems, activeIndex, onClose]);

  // Track flat index per group item
  let flatIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-24 -translate-x-1/2 z-50 w-full max-w-lg"
            data-testid="command-palette"
          >
            <div className="bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Rechercher une page, un lead, un agent..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  data-testid="command-input"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors text-xs">Effacer</button>
                )}
                <kbd className="hidden sm:flex items-center gap-1 bg-muted border border-border rounded px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto py-2">
                {flatItems.length === 0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">
                    Aucun résultat pour "<span className="text-foreground">{query}</span>"
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{category}</div>
                      {items.map(item => {
                        const currentFlatIdx = flatIdx++;
                        const isActive = activeIndex === currentFlatIdx;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left',
                              isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                            )}
                            onMouseEnter={() => setActiveIndex(currentFlatIdx)}
                            onClick={item.action}
                            data-testid={`cmd-item-${item.id}`}
                          >
                            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                              {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                            </div>
                            {isActive && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer hints */}
              <div className="border-t border-border px-4 py-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span><kbd className="bg-muted border border-border rounded px-1">↑↓</kbd> Naviguer</span>
                <span><kbd className="bg-muted border border-border rounded px-1">↵</kbd> Ouvrir</span>
                <span><kbd className="bg-muted border border-border rounded px-1">ESC</kbd> Fermer</span>
                <span className="ml-auto">{flatItems.length} résultat(s)</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
