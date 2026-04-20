import React, { useState } from "react";
import { 
  useListTasks, 
  getListTasksQueryKey, 
  useGetStats, 
  getGetStatsQueryKey,
  useSyncEmails,
  useDeleteTask,
  useListAccounts,
  getListAccountsQueryKey,
  Task
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  RefreshCw, 
  CheckCircle2, 
  Copy,
  AlertTriangle,
  Mail,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

function getPriorityColor(priority: number) {
  if (priority >= 9) return "bg-red-500/10 text-red-500 border-red-500/20";
  if (priority >= 7) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (priority >= 4) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-green-500/10 text-green-500 border-green-500/20";
}

function getPriorityBarColor(priority: number) {
  if (priority >= 9) return "bg-red-500";
  if (priority >= 7) return "bg-orange-500";
  if (priority >= 4) return "bg-amber-500";
  return "bg-green-500";
}

function getCategoryColor(category: string) {
  switch (category) {
    case "Finance": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "Klient": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "Dodavatel": return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    case "Operativa": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const deleteTask = useDeleteTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      }
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(task.draftReply);
    toast({
      title: "Zkopírováno",
      description: "Návrh odpovědi byl zkopírován do schránky.",
      duration: 2000,
    });
  };

  const handleResolve = () => {
    deleteTask.mutate({ id: task.id });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className="overflow-hidden border-border bg-card/50 backdrop-blur-sm shadow-sm relative group">
        <div className="absolute left-0 top-0 bottom-0 w-1">
          <div className={`h-full w-full ${getPriorityBarColor(task.priority)} opacity-80`} />
        </div>
        
        <div className="p-4 pl-5">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant="outline" className={`text-xs font-mono font-medium ${getPriorityColor(task.priority)}`}>
                  P{task.priority}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getCategoryColor(task.category)}`}>
                  {task.category}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {task.accountEmail}
                </span>
                <span className="text-xs text-muted-foreground">
                  • {new Date(task.date).toLocaleString('cs-CZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </span>
              </div>
              <h3 className="font-semibold text-base text-foreground leading-tight line-clamp-1">
                {task.subject}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                Od: <span className="text-foreground/80">{task.from}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResolve}
                disabled={deleteTask.isPending}
                className="h-8 bg-background/50 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Vyřízeno
              </Button>
            </div>
          </div>
          
          <div className="bg-background/40 rounded-md p-3 text-sm text-foreground/90 border border-border/50 mb-3 font-mono leading-relaxed">
            {task.summary}
          </div>
          
          <div className="border border-border/50 rounded-md bg-background/20 overflow-hidden">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between p-2.5 px-3 text-sm font-medium hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                Draft odpovědi
              </span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border/50"
                >
                  <div className="p-3 bg-background/40">
                    <p className="text-sm whitespace-pre-wrap font-serif text-foreground/80 leading-relaxed mb-3">
                      {task.draftReply}
                    </p>
                    <div className="flex justify-end">
                      <Button variant="secondary" size="sm" onClick={handleCopy} className="h-7 text-xs">
                        <Copy className="w-3 h-3 mr-1.5" />
                        Kopírovat odpověď
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey(), refetchInterval: 30000 } });
  const { data: tasks, isLoading: tasksLoading } = useListTasks({ query: { queryKey: getListTasksQueryKey() } });
  const { data: accounts } = useListAccounts({ query: { queryKey: getListAccountsQueryKey() } });
  
  const syncMutation = useSyncEmails({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        
        if (data.errors && data.errors.length > 0) {
          toast({
            variant: "destructive",
            title: "Částečná synchronizace",
            description: `Zpracováno: ${data.synced}. Chyby: ${data.errors.length}`,
          });
        } else {
          toast({
            title: "Synchronizace dokončena",
            description: `Nově zpracovaných e-mailů: ${data.synced}`,
          });
        }
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Chyba synchronizace",
          description: err.message || "Nepodařilo se spustit synchronizaci.",
        });
      }
    }
  });

  const burningCount = stats?.burning || 0;
  const isBurning = burningCount > 0;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Top Status Bar */}
      <div className="border-b border-border bg-card p-4 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-xl border ${isBurning ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/20'}`}>
              {isBurning && (
                <div className="absolute inset-0 rounded-xl bg-red-500/20 animate-pulse blur-md" />
              )}
              <span className={`text-2xl font-bold font-mono z-10 ${isBurning ? 'text-red-500' : 'text-green-500'}`}>
                {burningCount}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Kolik úkolů hoří</h2>
              <p className="text-sm text-muted-foreground">Úkoly s prioritou 8 a vyšší</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {accounts?.map(account => (
              <Button 
                key={account.id}
                variant="outline"
                size="sm"
                onClick={() => syncMutation.mutate({ data: { accountId: account.id } })} 
                disabled={syncMutation.isPending}
                className="h-9 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncMutation.isPending && syncMutation.variables?.data?.accountId === account.id ? 'animate-spin' : ''}`} />
                Sync {account.label}
              </Button>
            ))}
            <Button 
              onClick={() => syncMutation.mutate({ data: {} })} 
              disabled={syncMutation.isPending}
              className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending && !syncMutation.variables?.data?.accountId ? 'animate-spin' : ''}`} />
              Sync Vše
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Triage Inbox
            </h2>
            <div className="text-sm text-muted-foreground">
              Celkem k vyřízení: <span className="font-mono font-medium text-foreground">{stats?.total || 0}</span>
            </div>
          </div>

          {tasksLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 rounded-lg bg-card/50 border border-border animate-pulse" />
              ))}
            </div>
          ) : !tasks || tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-lg bg-card/20">
              <CheckCircle2 className="w-12 h-12 text-green-500/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">Vše vyřízeno</h3>
              <p className="text-muted-foreground max-w-sm mt-1">Zatím nehoří žádné další úkoly. Zkuste synchronizovat schránky.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
