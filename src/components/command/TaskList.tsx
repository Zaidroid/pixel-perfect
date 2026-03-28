import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tasks } from "@/lib/mock-data";
import { Circle, Clock, CheckCircle2, Ban, ChevronRight } from "lucide-react";

const statusConfig = {
  todo: { icon: Circle, color: "text-muted-foreground", label: "To Do", bar: "bg-muted-foreground" },
  in_progress: { icon: Clock, color: "text-primary", label: "In Progress", bar: "bg-primary" },
  done: { icon: CheckCircle2, color: "text-glow-success", label: "Done", bar: "bg-glow-success" },
  blocked: { icon: Ban, color: "text-glow-danger", label: "Blocked", bar: "bg-glow-danger" },
};

const priorityColors = {
  P0: "bg-glow-danger/20 text-glow-danger",
  P1: "bg-glow-warning/20 text-glow-warning",
  P2: "bg-primary/20 text-primary",
  P3: "bg-secondary text-muted-foreground",
};

const columns: Array<"todo" | "in_progress" | "done" | "blocked"> = ["in_progress", "todo", "blocked"];

export function TaskList() {
  const totalDone = tasks.filter(t => t.status === "done").length;
  const progressPct = (totalDone / tasks.length) * 100;

  return (
    <div className="glass-panel p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
        <span className="text-[10px] mono text-muted-foreground">{totalDone}/{tasks.length} done</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-glow-success"
        />
      </div>

      {/* Status breakdown mini bar */}
      <div className="flex gap-0.5 h-1 rounded-full overflow-hidden mb-4">
        {(["done", "in_progress", "todo", "blocked"] as const).map((s) => {
          const count = tasks.filter((t) => t.status === s).length;
          const pct = (count / tasks.length) * 100;
          return <div key={s} className={cn("rounded-full transition-all", statusConfig[s].bar)} style={{ width: `${pct}%` }} />;
        })}
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {columns.map((col) => {
          const config = statusConfig[col];
          const Icon = config.icon;
          const colTasks = tasks.filter((t) => t.status === col);
          if (colTasks.length === 0) return null;
          return (
            <div key={col}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={cn("h-3 w-3", config.color)} />
                <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">{config.label}</span>
                <span className="text-[10px] mono text-muted-foreground/40 ml-auto">{colTasks.length}</span>
              </div>
              {colTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/20 transition-colors group cursor-pointer"
                >
                  <span className="text-[11px] text-foreground truncate flex-1">{task.title}</span>
                  <span className={cn("text-[8px] mono font-bold px-1.5 py-0.5 rounded", priorityColors[task.priority])}>
                    {task.priority}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors" />
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
