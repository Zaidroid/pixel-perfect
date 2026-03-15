import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tasks } from "@/lib/mock-data";
import type { TaskItem } from "@/lib/mock-data";
import { Circle, Clock, CheckCircle2, Ban, Plus, GripVertical } from "lucide-react";
import { ExpandableOverlay } from "@/components/command/ExpandableOverlay";

const statusConfig = {
  todo: { icon: Circle, color: "text-muted-foreground", label: "To Do", columnColor: "border-muted-foreground/30" },
  in_progress: { icon: Clock, color: "text-primary", label: "In Progress", columnColor: "border-primary/30" },
  done: { icon: CheckCircle2, color: "text-glow-success", label: "Done", columnColor: "border-glow-success/30" },
  blocked: { icon: Ban, color: "text-glow-danger", label: "Blocked", columnColor: "border-glow-danger/30" },
};

const priorityColors = {
  P0: "bg-glow-danger/20 text-glow-danger border-glow-danger/30",
  P1: "bg-glow-warning/20 text-glow-warning border-glow-warning/30",
  P2: "bg-primary/20 text-primary border-primary/30",
  P3: "bg-secondary text-muted-foreground border-border",
};

const columns: Array<TaskItem["status"]> = ["todo", "in_progress", "done", "blocked"];

function KanbanCard({ task, index, onClick }: { task: TaskItem; index: number; onClick: () => void }) {
  const config = statusConfig[task.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="glass-panel-hover p-3 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0 mt-0.5 transition-colors" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground leading-relaxed">{task.title}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={cn("text-[9px] mono font-bold px-1.5 py-0.5 rounded border", priorityColors[task.priority])}>
              {task.priority}
            </span>
            <span className="text-[10px] mono text-muted-foreground/60">{task.assignee}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] mono text-muted-foreground/40">{task.deadline}</span>
            <span className="text-[10px] mono text-muted-foreground/30 px-1.5 py-0.5 rounded bg-secondary/30">{task.category}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const TasksPage = () => {
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

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

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const config = statusConfig[col];
          const Icon = config.icon;
          const colTasks = tasks.filter((t) => t.status === col);

          return (
            <motion.div
              key={col}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col"
            >
              {/* Column header */}
              <div className={cn("flex items-center gap-2 mb-3 pb-2 border-b-2", config.columnColor)}>
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="text-sm font-semibold text-foreground">{config.label}</span>
                <span className="text-[10px] mono text-muted-foreground ml-auto bg-secondary/50 px-1.5 py-0.5 rounded">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2 flex-1 min-h-[100px]">
                {colTasks.map((task, i) => (
                  <KanbanCard key={task.id} task={task} index={i} onClick={() => setSelectedTask(task)} />
                ))}
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-border/30 text-[10px] mono text-muted-foreground/40">
                    No tasks
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Task Detail Overlay */}
      <ExpandableOverlay isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Details">
        {selectedTask && (() => {
          const config = statusConfig[selectedTask.status];
          const Icon = config.icon;
          return (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-lg bg-secondary/30")}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{selectedTask.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[10px] mono font-bold px-1.5 py-0.5 rounded border", priorityColors[selectedTask.priority])}>
                      {selectedTask.priority}
                    </span>
                    <span className={cn("text-xs mono", config.color)}>{config.label}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Assignee", value: selectedTask.assignee },
                  { label: "Project", value: selectedTask.project },
                  { label: "Deadline", value: selectedTask.deadline },
                  { label: "Category", value: selectedTask.category },
                ].map((field) => (
                  <div key={field.label} className="p-3 rounded-md bg-secondary/30 border border-border/30">
                    <p className="text-[10px] mono text-muted-foreground uppercase mb-1">{field.label}</p>
                    <p className="text-sm font-medium text-foreground">{field.value}</p>
                  </div>
                ))}
              </div>

              {/* Status change */}
              <div>
                <p className="text-[10px] mono text-muted-foreground uppercase tracking-wider mb-2">Move to</p>
                <div className="flex gap-2 flex-wrap">
                  {columns.filter((c) => c !== selectedTask.status).map((col) => {
                    const c = statusConfig[col];
                    const CI = c.icon;
                    return (
                      <button key={col} className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/30 transition-colors">
                        <CI className={cn("h-3 w-3", c.color)} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-md bg-secondary/30 border border-border/30">
                <p className="text-[10px] mono text-muted-foreground uppercase mb-2">Description</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No description provided. Click to add a description for this task.
                </p>
              </div>
            </div>
          );
        })()}
      </ExpandableOverlay>
    </div>
  );
};

export default TasksPage;
