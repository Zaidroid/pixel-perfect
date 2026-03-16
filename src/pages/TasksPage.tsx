import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tasks as initialTasks } from "@/lib/mock-data";
import type { TaskItem } from "@/lib/mock-data";
import { Circle, Clock, CheckCircle2, Ban, Plus, X, Filter } from "lucide-react";
import { ExpandableOverlay } from "@/components/command/ExpandableOverlay";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

const statusConfig = {
  todo: { icon: Circle, color: "text-muted-foreground", label: "To Do", columnColor: "border-muted-foreground/30", bg: "bg-muted-foreground/5" },
  in_progress: { icon: Clock, color: "text-primary", label: "In Progress", columnColor: "border-primary/30", bg: "bg-primary/5" },
  done: { icon: CheckCircle2, color: "text-glow-success", label: "Done", columnColor: "border-glow-success/30", bg: "bg-glow-success/5" },
  blocked: { icon: Ban, color: "text-glow-danger", label: "Blocked", columnColor: "border-glow-danger/30", bg: "bg-glow-danger/5" },
};

const priorityColors = {
  P0: "bg-glow-danger/20 text-glow-danger border-glow-danger/30",
  P1: "bg-glow-warning/20 text-glow-warning border-glow-warning/30",
  P2: "bg-primary/20 text-primary border-primary/30",
  P3: "bg-secondary text-muted-foreground border-border",
};

const columns: Array<TaskItem["status"]> = ["todo", "in_progress", "done", "blocked"];
const priorities: Array<TaskItem["priority"]> = ["P0", "P1", "P2", "P3"];

function KanbanCard({ task, index, onClick }: { task: TaskItem; index: number; onClick: () => void }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "glass-panel-hover p-3 cursor-pointer group mb-2 transition-shadow",
            snapshot.isDragging && "shadow-[0_0_30px_-5px_hsl(var(--glow-primary)/0.3)] border-primary/40"
          )}
          onClick={onClick}
        >
          <p className="text-xs font-medium text-foreground leading-relaxed mb-2">{task.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
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
      )}
    </Draggable>
  );
}

const emptyTask: Omit<TaskItem, "id"> = {
  title: "",
  status: "todo",
  priority: "P2",
  assignee: "",
  project: "OpenClaw",
  deadline: "",
  category: "Feature",
};

const TasksPage = () => {
  const [taskList, setTaskList] = useState<TaskItem[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState(emptyTask);
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskItem["status"];

    setTaskList((prev) => {
      // Remove from source
      const updated = prev.filter((t) => t.id !== draggableId);
      const movedTask = prev.find((t) => t.id === draggableId);
      if (!movedTask) return prev;

      const withNewStatus = { ...movedTask, status: newStatus };

      // Insert at correct position
      const colTasks = updated.filter((t) => t.status === newStatus);
      const otherTasks = updated.filter((t) => t.status !== newStatus);
      colTasks.splice(destination.index, 0, withNewStatus);

      return [...otherTasks, ...colTasks];
    });
  }, []);

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    const task: TaskItem = {
      ...newTask,
      id: `t${Date.now()}`,
    };
    setTaskList((prev) => [...prev, task]);
    setNewTask(emptyTask);
    setShowNewTask(false);
  };

  const handleMoveTask = (taskId: string, newStatus: TaskItem["status"]) => {
    setTaskList((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    setSelectedTask((prev) => prev ? { ...prev, status: newStatus } : null);
  };

  const filteredTasks = filterPriority === "all" ? taskList : taskList.filter((t) => t.priority === filterPriority);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground glow-text">Tasks</h1>
          <p className="text-sm text-muted-foreground mono mt-1">{taskList.length} total tasks</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <button
              onClick={() => setFilterPriority("all")}
              className={cn(
                "px-2 py-1 text-[10px] mono rounded border transition-colors",
                filterPriority === "all" ? "bg-primary/15 border-primary/30 text-primary" : "bg-secondary/30 border-border/30 text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {priorities.map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={cn(
                  "px-2 py-1 text-[10px] mono rounded border transition-colors",
                  filterPriority === p ? priorityColors[p] : "bg-secondary/30 border-border/30 text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors border border-primary/20"
          >
            <Plus className="h-3 w-3" /> New Task
          </button>
        </div>
      </motion.div>

      {/* Kanban Board with DnD */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const config = statusConfig[col];
            const Icon = config.icon;
            const colTasks = filteredTasks.filter((t) => t.status === col);

            return (
              <motion.div
                key={col}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col"
              >
                <div className={cn("flex items-center gap-2 mb-3 pb-2 border-b-2", config.columnColor)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <span className="text-sm font-semibold text-foreground">{config.label}</span>
                  <span className="text-[10px] mono text-muted-foreground ml-auto bg-secondary/50 px-1.5 py-0.5 rounded">
                    {colTasks.length}
                  </span>
                </div>

                <Droppable droppableId={col}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 min-h-[120px] rounded-lg p-1 transition-colors",
                        snapshot.isDraggingOver && config.bg
                      )}
                    >
                      {colTasks.map((task, i) => (
                        <KanbanCard key={task.id} task={task} index={i} onClick={() => setSelectedTask(task)} />
                      ))}
                      {provided.placeholder}
                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-border/30 text-[10px] mono text-muted-foreground/40">
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </motion.div>
            );
          })}
        </div>
      </DragDropContext>

      {/* New Task Overlay */}
      <ExpandableOverlay isOpen={showNewTask} onClose={() => setShowNewTask(false)} title="New Task">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] mono text-muted-foreground uppercase tracking-wider block mb-1.5">Title</label>
            <input
              value={newTask.title}
              onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
              placeholder="What needs to be done?"
              className="w-full text-sm bg-secondary/50 border border-border/50 rounded-md px-3 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 mono"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] mono text-muted-foreground uppercase tracking-wider block mb-1.5">Priority</label>
              <div className="flex gap-1.5">
                {priorities.map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewTask((prev) => ({ ...prev, priority: p }))}
                    className={cn(
                      "flex-1 px-2 py-2 text-[10px] mono font-bold rounded border transition-colors",
                      newTask.priority === p ? priorityColors[p] : "bg-secondary/30 border-border/30 text-muted-foreground"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] mono text-muted-foreground uppercase tracking-wider block mb-1.5">Status</label>
              <div className="flex gap-1.5 flex-wrap">
                {columns.map((s) => {
                  const c = statusConfig[s];
                  const CI = c.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => setNewTask((prev) => ({ ...prev, status: s }))}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1.5 text-[10px] mono rounded border transition-colors",
                        newTask.status === s ? "bg-primary/15 border-primary/30 text-primary" : "bg-secondary/30 border-border/30 text-muted-foreground"
                      )}
                    >
                      <CI className="h-3 w-3" /> {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] mono text-muted-foreground uppercase tracking-wider block mb-1.5">Assignee</label>
              <input
                value={newTask.assignee}
                onChange={(e) => setNewTask((p) => ({ ...p, assignee: e.target.value }))}
                placeholder="Who's responsible?"
                className="w-full text-xs bg-secondary/50 border border-border/50 rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 mono"
              />
            </div>
            <div>
              <label className="text-[10px] mono text-muted-foreground uppercase tracking-wider block mb-1.5">Deadline</label>
              <input
                value={newTask.deadline}
                onChange={(e) => setNewTask((p) => ({ ...p, deadline: e.target.value }))}
                placeholder="e.g. Tomorrow, Mar 20"
                className="w-full text-xs bg-secondary/50 border border-border/50 rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] mono text-muted-foreground uppercase tracking-wider block mb-1.5">Project</label>
              <input
                value={newTask.project}
                onChange={(e) => setNewTask((p) => ({ ...p, project: e.target.value }))}
                className="w-full text-xs bg-secondary/50 border border-border/50 rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 mono"
              />
            </div>
            <div>
              <label className="text-[10px] mono text-muted-foreground uppercase tracking-wider block mb-1.5">Category</label>
              <input
                value={newTask.category}
                onChange={(e) => setNewTask((p) => ({ ...p, category: e.target.value }))}
                className="w-full text-xs bg-secondary/50 border border-border/50 rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 mono"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowNewTask(false)}
              className="flex-1 py-2.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTask}
              disabled={!newTask.title.trim()}
              className={cn(
                "flex-1 py-2.5 text-xs rounded-md transition-colors border",
                newTask.title.trim()
                  ? "bg-primary/15 hover:bg-primary/25 text-primary border-primary/30"
                  : "bg-secondary/30 text-muted-foreground/50 border-border/30 cursor-not-allowed"
              )}
            >
              Create Task
            </button>
          </div>
        </div>
      </ExpandableOverlay>

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

              <div>
                <p className="text-[10px] mono text-muted-foreground uppercase tracking-wider mb-2">Move to</p>
                <div className="flex gap-2 flex-wrap">
                  {columns.filter((c) => c !== selectedTask.status).map((col) => {
                    const c = statusConfig[col];
                    const CI = c.icon;
                    return (
                      <button
                        key={col}
                        onClick={() => handleMoveTask(selectedTask.id, col)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/30 transition-colors"
                      >
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
