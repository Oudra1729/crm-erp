import { useLocation, useLocation as useWouterLocation } from 'wouter';
import { Bell, Sun, Moon, Search, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store/appStore';
import { useAuth, UserRole, ROLE_HOME } from '@/hooks/useAuth';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/campaigns': 'Campagnes',
  '/agents': 'Agents',
  '/assignments': 'Assignations',
  '/analytics': 'Analytiques',
  '/import': 'Import CSV',
  '/tasks': 'Tâches',
  '/workspace': 'Workspace Agent',
  '/notifications': 'Notifications',
  '/settings': 'Paramètres',
};

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  Admin: { label: 'Admin', className: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300' },
  Supervisor: { label: 'Superviseur', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  Agent: { label: 'Agent', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
};

export function Topbar() {
  const [location] = useLocation();
  const [, setLocation] = useWouterLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const { unreadCount } = useAppStore();
  const { user, logout } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);

  const currentLabel = Object.entries(ROUTE_LABELS).find(([k]) =>
    location === k || (k !== '/dashboard' && location.startsWith(k))
  )?.[1] ?? 'Dashboard';

  const role = (user?.role as UserRole) ?? 'Agent';
  const badge = ROLE_BADGE[role];

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-4 sticky top-0 z-30 flex-shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-1 min-w-0">
          <span className="hidden sm:block">ProLead</span>
          <ChevronRight className="h-3.5 w-3.5 hidden sm:block" />
          <span className="text-foreground font-medium truncate">{currentLabel}</span>
        </div>

        {/* Search trigger */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs border border-border hover:border-primary/40 hover:text-foreground transition-colors w-44 md:w-56"
          onClick={() => setCmdOpen(true)}
          data-testid="button-command-palette"
        >
          <Search className="h-3 w-3 flex-shrink-0" />
          <span className="flex-1 text-left">Rechercher...</span>
          <kbd className="hidden sm:inline-flex items-center bg-background border border-border rounded px-1.5 text-[10px] gap-0.5">
            <span>⌘</span><span>K</span>
          </kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            data-testid="button-theme-toggle"
          >
            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="h-8 w-8 relative" data-testid="button-notifications">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </Button>
          </Link>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-muted transition-colors ml-1"
                data-testid="button-user-menu"
              >
                <div className="relative">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.fullName?.charAt(0) ?? 'U'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-background rounded-full" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-xs font-semibold text-foreground leading-tight max-w-24 truncate">{user?.fullName}</span>
                  <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-tight', badge.className)}>{badge.label}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
                  <span className={cn('inline-flex text-[10px] px-2 py-0.5 rounded-full font-bold', badge.className)}>{badge.label}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {role === 'Admin' && (
                <DropdownMenuItem onClick={() => setLocation('/settings')}>Paramètres système</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setLocation(ROLE_HOME[role])}>Mon espace</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCmdOpen(true)}>
                <Search className="h-3.5 w-3.5 mr-2" />
                Recherche rapide
                <kbd className="ml-auto text-[10px] text-muted-foreground">⌘K</kbd>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500" data-testid="menu-logout">
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
