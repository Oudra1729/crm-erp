import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, FileText, ChevronRight, X, Download } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { parseCsv } from '@/lib/csv';
import { downloadFile } from '@/lib/api';
import {
  useCampaigns,
  useImportHistory,
  useImportPreview,
  useExecuteImport,
} from '@/hooks/useAppData';
import type { ImportPreviewDto } from '@/lib/api-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Step = 'upload' | 'mapping' | 'validate' | 'progress' | 'success';

const SYSTEM_FIELDS = ['Prénom', 'Nom', 'Téléphone', 'Email', 'Adresse', 'Ville', 'Campagne', 'Notes'];
const CSV_COLUMNS = ['first_name', 'last_name', 'phone', 'email', 'address', 'city', 'campaign', 'remarks'];

const SAMPLE_ROWS = [
  { first_name: 'Fatima', last_name: 'El Amrani', phone: '+212 612 345 678', email: 'f.elamrani@gmail.com', city: 'Casablanca', campaign: 'Immobilier Q2' },
  { first_name: 'Youssef', last_name: 'Benchekroun', phone: '+212 623 456 789', email: 'y.benchekroun@hotmail.fr', city: 'Rabat', campaign: 'Assurance Vie' },
  { first_name: 'Leila', last_name: 'Moussaoui', phone: '+212 634 567 890', email: 'l.moussaoui@gmail.com', city: 'Marrakech', campaign: 'Formation Pro' },
];

const IMPORT_HISTORY_COLS = [
  { key: 'filename', label: 'Fichier' },
  { key: 'date', label: 'Date' },
  { key: 'imported', label: 'Importés' },
  { key: 'errors', label: 'Erreurs' },
  { key: 'status', label: 'Statut' },
  { key: 'user', label: 'Utilisateur' },
];

const STATUS_COLORS = {
  Succès: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  Partiel: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  Échec: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
};

export function ImportPage() {
  const { data: campaigns = [] } = useCampaigns();
  const { data: history = [] } = useImportHistory();
  const previewMutation = useImportPreview();
  const executeMutation = useExecuteImport();

  const [step, setStep] = useState<Step>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [preview, setPreview] = useState<ImportPreviewDto | null>(null);
  const [campaignId, setCampaignId] = useState('');
  const [importResult, setImportResult] = useState<{ imported: number; errors: number; warnings: number; skipped: number } | null>(null);
  const [progressVal, setProgressVal] = useState(0);

  const loadFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Veuillez importer un fichier .csv');
      return;
    }
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) {
      toast.error('Fichier CSV vide ou invalide');
      return;
    }
    setFileName(file.name);
    setParsedRows(rows);
    setPreview(null);
    toast.success(`Fichier "${file.name}" chargé (${rows.length} lignes)`);
    setStep('mapping');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void loadFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void loadFile(file);
  };

  const handleValidate = async () => {
    try {
      const result = await previewMutation.mutateAsync(parsedRows);
      setPreview(result);
      if (!campaignId && campaigns[0]) setCampaignId(campaigns[0].id);
      setStep('validate');
    } catch {
      toast.error('Erreur lors de la validation');
    }
  };

  const handleImport = async () => {
    if (!campaignId) {
      toast.error('Sélectionnez une campagne');
      return;
    }
    setStep('progress');
    setProgressVal(0);
    const timer = setInterval(() => setProgressVal(v => Math.min(v + 8, 90)), 200);
    try {
      const result = await executeMutation.mutateAsync({
        filename: fileName,
        campaignId,
        rows: parsedRows,
      });
      clearInterval(timer);
      setProgressVal(100);
      setImportResult(result);
      setStep('success');
      toast.success(`${result.imported} leads importés`);
    } catch {
      clearInterval(timer);
      toast.error('Import échoué');
      setStep('validate');
    }
  };

  const reset = () => {
    setStep('upload');
    setFileName('');
    setParsedRows([]);
    setPreview(null);
    setCampaignId('');
    setImportResult(null);
    setProgressVal(0);
  };

  const STEPS = [
    { key: 'upload', label: 'Fichier' },
    { key: 'mapping', label: 'Mapping' },
    { key: 'validate', label: 'Validation' },
    { key: 'progress', label: 'Import' },
    { key: 'success', label: 'Résultat' },
  ];

  const stepIndex = STEPS.findIndex(s => s.key === step);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Import CSV</h1>
          <p className="text-sm text-muted-foreground">Importez vos leads depuis un fichier CSV</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, idx) => (
            <div key={s.key} className="flex items-center">
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                idx === stepIndex ? 'bg-primary text-primary-foreground' :
                idx < stepIndex ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
              )}>
                {idx < stepIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">{idx + 1}</span>}
                {s.label}
              </div>
              {idx < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div
                className={cn(
                  'border-2 border-dashed rounded-2xl p-16 text-center transition-colors cursor-pointer',
                  isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                )}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('csv-input')?.click()}
                data-testid="dropzone-csv"
              >
                <motion.div animate={isDragging ? { scale: 1.1 } : { scale: 1 }}>
                  <Upload className={cn('h-12 w-12 mx-auto mb-4', isDragging ? 'text-primary' : 'text-muted-foreground/50')} />
                </motion.div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {isDragging ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier CSV'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">ou cliquez pour sélectionner un fichier</p>
                <p className="text-xs text-muted-foreground">Formats supportés: .csv — Taille max: 10 MB</p>
                <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadFile('/imports/template', 'modele-leads.csv')}>
                  <Download className="h-3.5 w-3.5" /> Télécharger le modèle CSV
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Mapping */}
          {step === 'mapping' && (
            <motion.div key="mapping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-card border border-card-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{fileName}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{parsedRows.length} lignes détectées</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Colonnes détectées</h3>
                <p className="text-xs text-muted-foreground mb-4">Mapping automatique : prénom, nom, téléphone, email, ville</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(parsedRows[0] ?? {}).map(col => (
                    <span key={col} className="text-xs font-mono bg-muted px-2 py-1 rounded-md">{col}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
                <Button size="sm" onClick={handleValidate} disabled={previewMutation.isPending} data-testid="button-validate">
                  Valider le mapping
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Validate */}
          {step === 'validate' && preview && (
            <motion.div key="validate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-card border border-card-border rounded-xl p-4">
                <Label className="text-sm mb-2 block">Campagne cible</Label>
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger><SelectValue placeholder="Choisir une campagne" /></SelectTrigger>
                  <SelectContent>
                    {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card border border-card-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{preview.totalRows}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total lignes</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{preview.valid}</p>
                  <p className="text-xs text-emerald-600/70 mt-1">Valides</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">{preview.warnings + preview.errors}</p>
                  <p className="text-xs text-amber-600/70 mt-1">Avertissements</p>
                </div>
              </div>
              <div className="bg-card border border-card-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Aperçu des données</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="px-4 py-2 text-left">Prénom</th>
                        <th className="px-4 py-2 text-left">Nom</th>
                        <th className="px-4 py-2 text-left">Téléphone</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Ville</th>
                        <th className="px-4 py-2 text-left">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.preview.map((row) => (
                        <tr key={row.index} className="border-b border-border last:border-0">
                          <td className="px-4 py-2">{row.firstName}</td>
                          <td className="px-4 py-2">{row.lastName}</td>
                          <td className="px-4 py-2">{row.phone}</td>
                          <td className="px-4 py-2">{row.email}</td>
                          <td className="px-4 py-2">{row.city}</td>
                          <td className="px-4 py-2">
                            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', row.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                              {row.valid ? 'Valide' : 'Avert.'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {(preview.warnings + preview.errors) > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      {preview.warnings + preview.errors} avertissement(s) détecté(s)
                    </p>
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                      Certaines lignes ont des données incomplètes ou invalides.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => setStep('mapping')}>Retour</Button>
                <Button size="sm" onClick={handleImport} data-testid="button-import">Lancer l'import</Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Progress */}
          {step === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-card-border rounded-xl p-10 text-center space-y-6">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="font-semibold text-foreground text-lg">Import en cours...</h3>
                <p className="text-sm text-muted-foreground mt-1">Traitement de {fileName}</p>
              </div>
              <div className="max-w-sm mx-auto space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progression</span>
                  <span>{progressVal}%</span>
                </div>
                <Progress value={progressVal} className="h-2" />
                <p className="text-xs text-muted-foreground">{Math.floor((progressVal / 100) * parsedRows.length)} / {parsedRows.length} leads traités</p>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-card-border rounded-xl p-10 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="flex justify-center"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
              </motion.div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Import réussi</h3>
                <p className="text-sm text-muted-foreground mt-1">Votre fichier a été importé avec succès</p>
              </div>
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{importResult?.imported ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Importés</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-amber-500">{importResult?.skipped ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Ignorés</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-emerald-500">{importResult?.errors ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Erreurs</p>
                </div>
              </div>
              <Button onClick={reset} data-testid="button-new-import">Nouvel import</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Import history */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Historique des imports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {IMPORT_HISTORY_COLS.map(c => (
                    <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(row => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20" data-testid={`row-import-${row.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{row.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(row.date), 'dd MMM yyyy', { locale: fr })}</td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{row.imported}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.errors}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[row.status])}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
