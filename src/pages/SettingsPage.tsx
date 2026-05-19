import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, User, Lock, Bell, Palette, Shield, Save, Eye, EyeOff } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

const PERMISSIONS = [
  { role: 'Admin', permissions: ['Voir tous les leads', 'Créer des campagnes', 'Gérer les agents', 'Accès aux rapports', 'Paramètres système'] },
  { role: 'Superviseur', permissions: ['Voir tous les leads', 'Créer des campagnes', 'Voir agents', 'Accès aux rapports'] },
  { role: 'Agent', permissions: ['Voir ses leads', 'Mettre à jour les statuts', 'Ajouter des notes'] },
];

export function SettingsPage() {
  const { setTheme, resolvedTheme } = useTheme();
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    emailLeads: true,
    emailCampaigns: false,
    smsCallback: true,
    smsCampaigns: false,
    pushNew: true,
    pushStatus: true,
  });

  const handleSave = () => toast.success('Paramètres sauvegardés');

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">Paramètres</h1>
          <p className="text-sm text-muted-foreground">Gérez les préférences de votre espace de travail</p>
        </div>

        <Tabs defaultValue="company">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="company" className="text-xs gap-1.5"><Building2 className="h-3.5 w-3.5" />Société</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs gap-1.5"><User className="h-3.5 w-3.5" />Profil</TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5"><Lock className="h-3.5 w-3.5" />Sécurité</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs gap-1.5"><Bell className="h-3.5 w-3.5" />Notifications</TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs gap-1.5"><Palette className="h-3.5 w-3.5" />Apparence</TabsTrigger>
            <TabsTrigger value="roles" className="text-xs gap-1.5"><Shield className="h-3.5 w-3.5" />Rôles</TabsTrigger>
          </TabsList>

          {/* Company */}
          <TabsContent value="company" className="mt-6">
            <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-semibold text-foreground">Informations de la société</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Nom de la société', placeholder: 'ProLead Inc.', defaultValue: 'ProLead CRM' },
                  { label: 'Site web', placeholder: 'https://...', defaultValue: 'https://prolead.ma' },
                  { label: 'Secteur', placeholder: 'Secteur d\'activité', defaultValue: 'Immobilier / Finance' },
                  { label: 'Fuseau horaire', placeholder: 'Fuseau horaire', defaultValue: 'Africa/Casablanca' },
                ].map(f => (
                  <div key={f.label} className="space-y-1.5">
                    <Label className="text-xs">{f.label}</Label>
                    <Input defaultValue={f.defaultValue} placeholder={f.placeholder} className="h-9 text-sm" data-testid={`input-${f.label.toLowerCase().replace(/\s/g, '-')}`} />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Adresse</Label>
                <Input defaultValue="123 Boulevard Mohammed V, Casablanca" className="h-9 text-sm" />
              </div>
              <Button size="sm" className="gap-2" onClick={handleSave} data-testid="button-save-company">
                <Save className="h-3.5 w-3.5" />Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="mt-6">
            <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-semibold text-foreground">Mon profil</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">T</div>
                <div>
                  <Button variant="outline" size="sm" onClick={() => toast.info('Upload photo')}>Changer la photo</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG jusqu'à 2MB</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Prénom', defaultValue: 'Tarik' },
                  { label: 'Nom', defaultValue: 'Mansour' },
                  { label: 'Email', defaultValue: 'tarik.mansour@prolead.com' },
                  { label: 'Téléphone', defaultValue: '+212 611 111 111' },
                ].map(f => (
                  <div key={f.label} className="space-y-1.5">
                    <Label className="text-xs">{f.label}</Label>
                    <Input defaultValue={f.defaultValue} className="h-9 text-sm" />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Bio</Label>
                <textarea
                  defaultValue="Administrateur de la plateforme ProLead CRM. Expert en gestion de leads et performance commerciale."
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  rows={3}
                />
              </div>
              <Button size="sm" className="gap-2" onClick={handleSave} data-testid="button-save-profile">
                <Save className="h-3.5 w-3.5" />Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="mt-6">
            <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-semibold text-foreground">Sécurité du compte</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input type={showOldPwd ? 'text' : 'password'} placeholder="••••••••" className="h-9 text-sm pr-10" data-testid="input-old-password" />
                    <button type="button" onClick={() => setShowOldPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showOldPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input type={showNewPwd ? 'text' : 'password'} placeholder="••••••••" className="h-9 text-sm pr-10" data-testid="input-new-password" />
                    <button type="button" onClick={() => setShowNewPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Confirmer le nouveau mot de passe</Label>
                  <Input type="password" placeholder="••••••••" className="h-9 text-sm" data-testid="input-confirm-password" />
                </div>
                <Button size="sm" onClick={() => toast.success('Mot de passe mis à jour')} data-testid="button-change-password">Changer le mot de passe</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Authentification à deux facteurs</p>
                  <p className="text-xs text-muted-foreground">Ajoutez une couche de sécurité supplémentaire</p>
                </div>
                <Switch onCheckedChange={v => toast.success(v ? '2FA activé' : '2FA désactivé')} />
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-6">
            <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-semibold text-foreground">Préférences de notifications</h3>
              {[
                { section: 'Email', items: [
                  { key: 'emailLeads', label: 'Nouveaux leads assignés', desc: 'Recevoir un email à chaque nouveau lead' },
                  { key: 'emailCampaigns', label: 'Alertes campagnes', desc: 'Mises à jour et alertes de performance' },
                ]},
                { section: 'SMS', items: [
                  { key: 'smsCallback', label: 'Rappels planifiés', desc: 'Alertes SMS pour les rappels clients' },
                  { key: 'smsCampaigns', label: 'Campagnes actives', desc: 'Alertes SMS pour les nouvelles campagnes' },
                ]},
                { section: 'Push', items: [
                  { key: 'pushNew', label: 'Nouveaux leads', desc: 'Notifications push pour nouveaux leads' },
                  { key: 'pushStatus', label: 'Changements de statut', desc: 'Notifications push pour les mises à jour de statut' },
                ]},
              ].map(section => (
                <div key={section.section}>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{section.section}</p>
                  <div className="space-y-3">
                    {section.items.map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                          checked={notifSettings[item.key as keyof typeof notifSettings]}
                          onCheckedChange={v => setNotifSettings(s => ({ ...s, [item.key]: v }))}
                          data-testid={`switch-${item.key}`}
                        />
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="mt-6">
            <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-semibold text-foreground">Apparence</h3>
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Thème</p>
                <div className="flex gap-3">
                  {[
                    { value: 'light', label: 'Clair', preview: 'bg-white border-gray-200' },
                    { value: 'dark', label: 'Sombre', preview: 'bg-gray-900 border-gray-700' },
                    { value: 'system', label: 'Système', preview: 'bg-gradient-to-r from-white to-gray-900' },
                  ].map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={cn(
                        'flex-1 rounded-xl border-2 p-4 transition-colors text-center',
                        resolvedTheme === t.value || (t.value === 'system') ? 'border-primary' : 'border-border hover:border-primary/50'
                      )}
                      data-testid={`theme-${t.value}`}
                    >
                      <div className={cn('w-full h-12 rounded-lg mb-2 border', t.preview)} />
                      <p className="text-xs font-medium text-foreground">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Couleur d'accent</p>
                <div className="flex gap-3">
                  {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'].map(color => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-foreground/30 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => toast.info(`Couleur ${color} sélectionnée`)}
                      data-testid={`color-${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Roles */}
          <TabsContent value="roles" className="mt-6">
            <div className="bg-card border border-card-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Rôles et permissions</h3>
              </div>
              <div className="divide-y divide-border">
                {PERMISSIONS.map(role => (
                  <div key={role.role} className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-semibold',
                        role.role === 'Admin' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300' :
                        role.role === 'Superviseur' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      )}>{role.role}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map(perm => (
                        <div key={perm} className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="text-xs text-foreground">{perm}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
