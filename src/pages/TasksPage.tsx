import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Square, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTasks, useUpdateTask, useCreateTask } from '@/hooks/useAppData';
import type { TaskDto } from '@/lib/api-types';

const PRIORITY_CONFIG = {
  high: { label: 'Haute', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-950/30' },
  medium: { label: 'Moyenne', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-950/30' },
  low: { label: 'Basse', color: 'text-muted-foreground', bg: 'bg-muted' },
};

export function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

  const toggleTask = (task: TaskDto) => {
    updateTask.mutate(
      { id: task.id, done: !task.done },
      { onError: () => toast.error('Impossible de mettre à jour la tâche') },
    );
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    createTask.mutate(
      { title: newTask, priority: 'medium' },
      {
        onSuccess: () => {
          setNewTask('');
          toast.success('Tâche ajoutée');
        },
        onError: () => toast.error('Impossible d\'ajouter la tâche'),
      },
    );
  };

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const pending = tasks.filter(t => !t.done).length;
  const done = tasks.filter(t => t.done).length;

  if (isLoading) {
    return (
      <PageTransition>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-[40vh] text-muted-foreground gap-2"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          Chargement des tâches...
        </motion.div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-2xl"
      >
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-foreground">Tâches</h1>
          <p className="text-sm text-muted-foreground">{pending} en attente, {done} terminées</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-card-border rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-foreground">{tasks.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total</p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center"
          >
            <p className="text-xl font-bold text-amber-600">{pending}</p>
            <p className="text-xs text-amber-600/70 mt-0.5">En attente</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center"
          >
            <p className="text-xl font-bold text-emerald-600">{done}</p>
            <p className="text-xs text-emerald-600/70 mt-0.5">Terminées</p>
          </motion.div>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Nouvelle tâche..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            className="h-10"
            data-testid="input-new-task"
          />
          <Button onClick={addTask} className="gap-2 flex-shrink-0" data-testid="button-add-task" disabled={createTask.isPending}>
            <Plus className="h-4 w-4" />Ajouter
          </Button>
        </div>

        <div className="flex gap-2">
          {(['all', 'pending', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}
              data-testid={`filter-${f}`}
            >
              {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : 'Terminées'}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((task, idx) => {
            const pc = PRIORITY_CONFIG[task.priority];
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border transition-colors group',
                  task.done ? 'bg-muted/30 border-border' : 'bg-card border-card-border'
                )}
                data-testid={`task-${task.id}`}
              >
                <button onClick={() => toggleTask(task)} className="flex-shrink-0 mt-0.5" data-testid={`checkbox-task-${task.id}`}>
                  {task.done
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    : <Square className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  }
                </button>
                <motion.div layout className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', task.done && 'line-through text-muted-foreground')}>{task.title}</p>
                  <motion.div layout className="flex items-center gap-2 mt-1.5">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', pc.bg, pc.color)}>{pc.label}</span>
                    {task.dueDate && (
                      <motion.div layout className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{task.dueDate}
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </PageTransition>
  );
}
