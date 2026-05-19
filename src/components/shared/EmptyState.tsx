import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon ? (
        <div className="mb-4 text-muted-foreground">{icon}</div>
      ) : (
        <svg className="mb-4 w-16 h-16 text-muted-foreground/40" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="16" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2"/>
          <circle cx="32" cy="32" r="6" stroke="currentColor" strokeWidth="2"/>
          <path d="M26 32h-6M44 32h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
