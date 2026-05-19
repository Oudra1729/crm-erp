import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Megaphone, UserCheck, GitBranch,
  BarChart3, Upload, CheckSquare, Headphones, Bell, Settings,
  ChevronLeft, ChevronRight, LogOut, Phone, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItemDef {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: boolean;
}

// Navigation items per role
const NAV_BY_ROLE: Record<UserRole, NavItemDef[]> = {
  Admin: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leads', label: 'Leads', icon: Users },
    { path: '/campaigns', label: 'Campagnes', icon: Megaphone },
    { path: '/agents', label: 'Agents', icon: UserCheck },
    { path: '/assignments', label: 'Assignations', icon: GitBranch },
    { path: '/analytics', label: 'Analytiques', icon: BarChart3 },
    { path: '/import', label: 'Import CSV', icon: Upload },
    { path: '/tasks', label: 'Tâches', icon: CheckSquare },
    { path: '/workspace', label: 'Workspace', icon: Headphones },
  ],
  Supervisor: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leads', label: 'Leads', icon: Users },
    { path: '/campaigns', label: 'Campagnes', icon: Megaphone },
    { path: '/agents', label: 'Agents', icon: UserCheck },
    { path: '/analytics', label: 'Analytiques', icon: BarChart3 },
  ],
  Agent: [
    { path: '/workspace', label: 'Mon Workspace', icon: Headphones },
    { path: '/leads', label: 'Mes Leads', icon: Users },
    { path: '/tasks', label: 'Mes Tâches', icon: CheckSquare },
  ],
};

const BOTTOM_BY_ROLE: Record<UserRole, NavItemDef[]> = {
  Admin: [
    { path: '/notifications', label: 'Notifications', icon: Bell, badge: true },
    { path: '/settings', label: 'Paramètres', icon: Settings },
  ],
  Supervisor: [
    { path: '/notifications', label: 'Notifications', icon: Bell, badge: true },
  ],
  Agent: [
    { path: '/notifications', label: 'Notifications', icon: Bell, badge: true },
  ],
};

const ROLE_BADGE: Record<UserRole, { label: string; color: string }> = {
  Admin: { label: 'Admin', color: 'bg-violet-500/20 text-violet-300' },
  Supervisor: { label: 'Superviseur', color: 'bg-blue-500/20 text-blue-300' },
  Agent: { label: 'Agent', color: 'bg-emerald-500/20 text-emerald-300' },
};

function NavItem({
  path, label, icon: Icon, collapsed, badge, unreadCount
}: NavItemDef & { collapsed: boolean; unreadCount?: number }) {
  const [location] = useLocation();
  const isActive = location === path || (path !== '/dashboard' && location.startsWith(path));

  const content = (
    <Link href={path}>
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors relative',
          isActive
            ? 'bg-sidebar-accent text-white'
            : 'text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground'
        )}
        data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="relative flex-shrink-0">
          <Icon style={{ width: 18, height: 18 }} />
          {badge && unreadCount && unreadCount > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="active-indicator"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-l-full"
          />
        )}
      </div>
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return content;
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, unreadCount } = useAppStore();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const role: UserRole = (user?.role as UserRole) ?? 'Agent';
  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.Agent;
  const bottomItems = BOTTOM_BY_ROLE[role] ?? BOTTOM_BY_ROLE.Agent;
  const roleBadge = ROLE_BADGE[role];

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col h-screen bg-sidebar border-r border-sidebar-border flex-shrink-0 overflow-hidden"
      data-testid="sidebar"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border flex-shrink-0">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Phone className="h-4 w-4 text-white" />
        </div>
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="text-sm font-bold text-sidebar-foreground whitespace-nowrap">ProLead CRM</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role indicator strip (expanded only) */}
      <AnimatePresence initial={false}>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pt-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5 text-sidebar-foreground/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-sidebar-foreground/50">Espace</p>
                <p className="text-xs font-semibold text-sidebar-foreground truncate">
                  {role === 'Admin' ? 'Administration' : role === 'Supervisor' ? 'Supervision' : 'Agent Call Center'}
                </p>
              </div>
              <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0', roleBadge.color)}>
                {roleBadge.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(item => (
          <NavItem
            key={item.path}
            {...item}
            collapsed={sidebarCollapsed}
            unreadCount={unreadCount}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-2 border-t border-sidebar-border space-y-0.5">
        {bottomItems.map(item => (
          <NavItem
            key={item.path}
            {...item}
            collapsed={sidebarCollapsed}
            unreadCount={item.badge ? unreadCount : undefined}
          />
        ))}
      </div>

      {/* User info */}
      <div className="px-2 pb-3 border-t border-sidebar-border pt-3">
        <div className={cn('flex items-center gap-2.5 px-2 py-2 rounded-lg', sidebarCollapsed && 'justify-center')}>
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {user?.fullName?.charAt(0) ?? 'U'}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-sidebar rounded-full" />
          </div>
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-xs font-semibold text-sidebar-foreground whitespace-nowrap">{user?.fullName}</p>
                <p className="text-[10px] text-sidebar-foreground/50 whitespace-nowrap">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleLogout}
                className="text-sidebar-foreground/40 hover:text-red-400 transition-colors"
                data-testid="button-logout"
                title="Déconnexion"
              >
                <LogOut className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="px-2 pb-4">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-white/5 transition-colors text-xs"
          data-testid="button-toggle-sidebar"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Réduire</span></>}
        </button>
      </div>
    </motion.aside>
  );
}
