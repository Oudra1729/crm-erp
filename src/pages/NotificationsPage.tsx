import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Users, Megaphone, Settings, CheckCheck, X, Info } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useDeleteNotification,
} from '@/hooks/useAppData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EmptyState } from '@/components/shared/EmptyState';

type FilterTab = 'all' | 'unread' | 'lead' | 'campaign' | 'system';

const TYPE_CONFIG = {
  lead: { icon: Users, color: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
  campaign: { icon: Megaphone, color: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400' },
  system: { icon: Settings, color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

export function NotificationsPage() {
  const { notifications } = useAppStore();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const markReadMutation = useMarkNotificationRead();
  const deleteMutation = useDeleteNotification();
  const [filter, setFilter] = useState<FilterTab>('all');

  const markAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => toast.success('Toutes les notifications marquées comme lues'),
    });
  };

  const markRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const dismiss = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Notification supprimée'),
    });
  };

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.type === filter;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Toutes', count: notifications.length },
    { key: 'unread', label: 'Non lues', count: notifications.filter(n => !n.isRead).length },
    { key: 'lead', label: 'Leads', count: notifications.filter(n => n.type === 'lead').length },
    { key: 'campaign', label: 'Campagnes', count: notifications.filter(n => n.type === 'campaign').length },
    { key: 'system', label: 'Système', count: notifications.filter(n => n.type === 'system').length },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {notifications.filter(n => !n.isRead).length} non lue(s)
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllRead} data-testid="button-mark-all-read">
            <CheckCheck className="h-3.5 w-3.5" />Tout marquer lu
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
                filter === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
              data-testid={`tab-${t.key}`}
            >
              {t.label}
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10px]', filter === t.key ? 'bg-white/20' : 'bg-background')}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <EmptyState
              title="Aucune notification"
              description="Vous êtes à jour. Aucune notification dans cette catégorie."
              icon={<Bell className="h-12 w-12 opacity-20" />}
            />
          ) : (
            filtered.map((notif, idx) => {
              const cfg = TYPE_CONFIG[notif.type];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer group',
                    notif.isRead
                      ? 'bg-card border-card-border hover:bg-muted/30'
                      : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                  )}
                  onClick={() => markRead(notif.id)}
                  data-testid={`notification-${notif.id}`}
                >
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', cfg.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-medium', notif.isRead ? 'text-foreground' : 'text-foreground font-semibold')}>
                        {notif.title}
                        {!notif.isRead && <span className="ml-2 w-1.5 h-1.5 bg-primary rounded-full inline-block align-middle" />}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(notif.createdAt), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {format(new Date(notif.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
                    data-testid={`button-dismiss-${notif.id}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </PageTransition>
  );
}
