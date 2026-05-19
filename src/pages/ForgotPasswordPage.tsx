import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl">ProLead CRM</span>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Email envoyé</h2>
            <p className="text-muted-foreground text-sm">
              Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation.
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-4 gap-2">
                <ArrowLeft className="h-4 w-4" /> Retour à la connexion
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Mot de passe oublié</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Entrez votre adresse email pour recevoir un lien de réinitialisation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
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
              <Button type="submit" className="w-full h-11" disabled={loading} data-testid="button-submit">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Envoi...</> : 'Envoyer le lien'}
              </Button>
            </form>

            <Link href="/login">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-login">
                <ArrowLeft className="h-4 w-4" /> Retour à la connexion
              </button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
