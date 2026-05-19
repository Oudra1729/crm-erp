import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Phone, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Users, Headphones } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, UserRole, ROLE_HOME } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const QUICK_LOGIN_ROLES: { role: UserRole; label: string; email: string; description: string; icon: React.ElementType; color: string; bg: string }[] = [
  {
    role: 'Admin',
    label: 'Administrateur',
    email: 'admin@prolead.com',
    description: 'Accès complet à tous les modules',
    icon: ShieldCheck,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/40',
  },
  {
    role: 'Supervisor',
    label: 'Superviseur',
    email: 'supervisor1@prolead.com',
    description: 'Dashboard, Leads, Campagnes, Agents',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40',
  },
  {
    role: 'Agent',
    label: 'Agent',
    email: 'agent1@prolead.com',
    description: 'Workspace, Tâches, Notifications',
    icon: Headphones,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
  },
];

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, loginQuick } = useAuth();
  const [email, setEmail] = useState('admin@prolead.com');
  const [password, setPassword] = useState('prolead123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<UserRole | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (result.success && result.user) {
      toast.success(`Bienvenue, ${result.user.fullName}`);
      setLocation(ROLE_HOME[result.user.role]);
    } else {
      toast.error(result.error ?? 'Email ou mot de passe incorrect');
    }
    setLoading(false);
  };

  const handleQuickLogin = async (role: UserRole) => {
    setQuickLoading(role);
    try {
      const user = await loginQuick(role);
      toast.success(`Connecté en tant que ${user.fullName}`);
      setLocation(ROLE_HOME[role]);
    } catch {
      toast.error('Connexion impossible — vérifiez que le backend est démarré');
    }
    setQuickLoading(null);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">ProLead CRM</span>
        </div>

        <div className="relative space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Gérez vos leads,<br />
              <span className="text-blue-400">boostez vos ventes</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              La plateforme tout-en-un pour vos équipes commerciales et call centers.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[{ value: '50K+', label: 'Leads gérés' }, { value: '98%', label: 'Satisfaction' }, { value: '3x', label: 'Plus rapide' }].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            {[
              { color: 'bg-blue-500/20 border-blue-500/30', label: 'Nouveaux leads', val: 124 },
              { color: 'bg-emerald-500/20 border-emerald-500/30', label: 'Convertis', val: 38 },
              { color: 'bg-violet-500/20 border-violet-500/30', label: 'En cours', val: 87 },
            ].map(item => (
              <div key={item.label} className={`flex-1 border rounded-xl p-3 ${item.color} backdrop-blur-sm`}>
                <p className="text-white font-bold text-lg">{item.val}</p>
                <p className="text-slate-400 text-xs">{item.label}</p>
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.val / 150) * 100}%` }}
                    transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-white/40 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Role preview badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { label: 'Admin', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
              { label: 'Superviseur', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
              { label: 'Agent', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
            ].map(r => (
              <span key={r.label} className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', r.color)}>
                {r.label}
              </span>
            ))}
            <span className="text-xs text-slate-500 self-center ml-1">Accès multi-rôles</span>
          </div>
        </div>

        <div className="relative text-sm text-slate-500">
          "La solution choisie par les meilleures équipes commerciales du Maroc."
        </div>
      </motion.div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto"
      >
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">ProLead CRM</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Connexion</h2>
            <p className="text-muted-foreground mt-1 text-sm">Bienvenue. Connectez-vous à votre espace.</p>
          </div>

          {/* Quick login cards */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accès rapide démo</p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_LOGIN_ROLES.map(({ role, label, email: e, description, icon: Icon, color, bg }) => (
                <button
                  key={role}
                  onClick={() => handleQuickLogin(role)}
                  disabled={quickLoading !== null}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center',
                    bg,
                    quickLoading === role ? 'opacity-70 cursor-wait' : 'cursor-pointer'
                  )}
                  data-testid={`button-quick-login-${role.toLowerCase()}`}
                >
                  {quickLoading === role ? (
                    <Loader2 className={cn('h-5 w-5 animate-spin', color)} />
                  ) : (
                    <Icon className={cn('h-5 w-5', color)} />
                  )}
                  <span className={cn('text-xs font-semibold', color)}>{label}</span>
                  <span className="text-[9px] text-muted-foreground leading-tight hidden sm:block">{description}</span>
                  <span className="text-[9px] text-muted-foreground/60 mt-0.5 hidden sm:block">{e}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="px-3 text-xs text-muted-foreground">ou connexion manuelle</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="h-11"
                data-testid="input-email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                <a href="/forgot-password" className="text-xs text-primary hover:underline">Mot de passe oublié ?</a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 pr-10"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-border"
                data-testid="checkbox-remember"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground select-none cursor-pointer">
                Se souvenir de moi
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold gap-2"
              disabled={loading || quickLoading !== null}
              data-testid="button-submit-login"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Connexion en cours...</>
              ) : (
                <>Se connecter <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          {/* Credentials table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/40 px-4 py-2.5 border-b border-border">
              <p className="text-xs font-semibold text-foreground">Comptes de démonstration</p>
              <p className="text-[10px] text-muted-foreground">Mot de passe universel : <span className="font-mono">prolead123</span></p>
            </div>
            <div className="divide-y divide-border">
              {[
                { role: 'Admin', email: 'admin@prolead.com', name: 'Tarik Mansour', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300' },
                { role: 'Superviseur', email: 'supervisor1@prolead.com', name: 'Karim Bennani', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
                { role: 'Agent', email: 'agent1@prolead.com', name: 'Hiba Berrada', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
              ].map(c => (
                <button
                  key={c.email}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => { setEmail(c.email); setPassword('prolead123'); }}
                  data-testid={`credential-${c.role.toLowerCase()}`}
                >
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0', c.badge)}>{c.role}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{c.email}</p>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
