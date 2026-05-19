import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_HOME } from '@/hooks/useAuth';

export function AccessDeniedPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const home = user ? ROLE_HOME[user.role as keyof typeof ROLE_HOME] : '/login';

  return (
    <div className="flex-1 flex items-center justify-center p-8 min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldOff className="h-9 w-9 text-red-400" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-foreground mb-2">Accès refusé</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          Vous ne disposez pas des permissions nécessaires pour accéder à cette page.
        </p>
        {user && (
          <p className="text-xs text-muted-foreground mb-8">
            Rôle actuel :{' '}
            <span className={
              user.role === 'Admin' ? 'text-violet-400 font-semibold' :
              user.role === 'Supervisor' ? 'text-blue-400 font-semibold' :
              'text-emerald-400 font-semibold'
            }>
              {user.role === 'Admin' ? 'Administrateur' : user.role === 'Supervisor' ? 'Superviseur' : 'Agent'}
            </span>
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />Retour
          </Button>
          <Button size="sm" onClick={() => setLocation(home)} className="gap-2">
            <Home className="h-4 w-4" />Mon espace
          </Button>
        </div>

        {/* Permission hint */}
        <div className="mt-8 p-4 bg-muted/40 rounded-xl border border-border text-left">
          <p className="text-xs font-semibold text-foreground mb-2">Vos accès autorisés :</p>
          {user?.role === 'Supervisor' && (
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>Dashboard, Leads, Campagnes, Agents, Analytiques</li>
            </ul>
          )}
          {user?.role === 'Agent' && (
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>Workspace Agent, Tâches, Notifications</li>
            </ul>
          )}
          {user?.role === 'Admin' && (
            <p className="text-xs text-muted-foreground">Accès complet à tous les modules.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
