import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tasks } from "@/lib/mock-data";
import { Circle, Clock, CheckCircle2, Ban } from "lucide-react";

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
  blocked: Ban,
};

const statusColors = {
  todo: "text-muted-foreground",
  in_progress: "text-primary",
  done: "text-glow-success",
  blocked: "text-glow-danger",
};

const priorityColors = {
  P0: "bg-glow-danger/20 text-glow-danger border-glow-danger/30",
  P1: "bg-glow-warning/20 text-glow-warning border-glow-warning/30",
  P2: "bg-primary/20 text-primary border-primary/30",
  P3: "bg-secondary text-muted-foreground border-border",
};

export function TaskList() {
  const activeTasks = tasks.filter((t) => t.status !== "done");

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Active Tasks</h3>
        <span className="text-[10px] mono text-muted-foreground">{activeTasks.length} active</span>
      </div>

      <div className="space-y-2">
        {activeTasks.map((task, i) => {
          const Icon = statusIcons[task.status];
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <Icon className={cn("h-4 w-4 shrink-0", statusColors[task.status])} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] mono text-muted-foreground">{task.assignee}</span>
                  <span className="text-[10px] text-muted-foreground/50">·</span>
                  <span className="text-[10px] mono text-muted-foreground/60">{task.deadline}</span>
                </div>
              </div>
              <span className={cn("text-[9px] mono font-semibold px-1.5 py-0.5 rounded border", priorityColors[task.priority])}>
                {task.priority}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
