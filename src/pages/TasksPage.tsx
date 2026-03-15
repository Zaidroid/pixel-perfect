import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { tasks } from "@/lib/mock-data";
import { Circle, Clock, CheckCircle2, Ban, Plus } from "lucide-react";

const statusIcons = { todo: Circle, in_progress: Clock, done: CheckCircle2, blocked: Ban };
const statusColors = { todo: "text-muted-foreground", in_progress: "text-primary", done: "text-glow-success", blocked: "text-glow-danger" };
const priorityColors = {
  P0: "bg-glow-danger/20 text-glow-danger border-glow-danger/30",
  P1: "bg-glow-warning/20 text-glow-warning border-glow-warning/30",
  P2: "bg-primary/20 text-primary border-primary/30",
  P3: "bg-secondary text-muted-foreground border-border",
};

const statusLabels = { todo: "To Do", in_progress: "In Progress", done: "Done", blocked: "Blocked" };

const TasksPage = () => {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground glow-text">Tasks</h1>
          <p className="text-sm text-muted-foreground mono mt-1">{tasks.length} total tasks</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors border border-primary/20">
          <Plus className="h-3 w-3" /> New Task
        </button>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {["all", "todo", "in_progress", "done", "blocked"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "text-[11px] mono px-3 py-1.5 rounded-md transition-colors border",
              filter === s ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary/50 text-muted-foreground border-border/30 hover:bg-secondary"
            )}
          >
            {s === "all" ? "All" : statusLabels[s as keyof typeof statusLabels]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((task, i) => {
          const Icon = statusIcons[task.status];
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="glass-panel-hover p-4 flex items-center gap-4 cursor-pointer"
            >
              <Icon className={cn("h-5 w-5 shrink-0", statusColors[task.status])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] mono text-muted-foreground">{task.assignee}</span>
                  <span className="text-[10px] mono text-muted-foreground/50">{task.project}</span>
                  <span className="text-[10px] mono text-muted-foreground/40">{task.deadline}</span>
                </div>
              </div>
              <span className="text-[10px] mono text-muted-foreground/60 px-2 py-0.5 rounded bg-secondary/50 border border-border/30">
                {task.category}
              </span>
              <span className={cn("text-[9px] mono font-bold px-1.5 py-0.5 rounded border", priorityColors[task.priority])}>
                {task.priority}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksPage;
