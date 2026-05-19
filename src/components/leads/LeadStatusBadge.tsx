import { LeadStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  'New': { label: 'Nouveau', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800' },
  'In Progress': { label: 'En cours', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800' },
  'Callback': { label: 'Rappel', className: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border border-violet-200 dark:border-violet-800' },
  'Interested': { label: 'Intéressé', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' },
  'Converted': { label: 'Converti', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' },
  'Not Interested': { label: 'Pas intéressé', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700' },
  'No Answer': { label: 'Pas de réponse', className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800' },
  'Invalid Number': { label: 'Numéro invalide', className: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800' },
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export function LeadStatusBadge({ status, size = 'md' }: LeadStatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium whitespace-nowrap',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      cfg.className
    )} data-testid={`badge-status-${status.toLowerCase().replace(/\s+/g, '-')}`}>
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: 'High' | 'Medium' | 'Low' }) {
  const cfg = {
    High: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  };
  const label = { High: 'Haute', Medium: 'Moyenne', Low: 'Basse' };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap', cfg[priority])}>
      {label[priority]}
    </span>
  );
}
