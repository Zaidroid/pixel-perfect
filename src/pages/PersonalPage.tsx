import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { agents, tasks } from "@/lib/mock-data";
import type { Agent, TaskItem } from "@/lib/mock-data";
import {
  User, Target, Calendar, Clock, CheckCircle2, Circle, Ban,
  Plus, Sparkles, BookOpen, Coffee, Dumbbell, Brain,
  ArrowRight, TrendingUp,
} from "lucide-react";
import { ExpandableOverlay } from "@/components/command/ExpandableOverlay";

const personalGoals = [
  { id: "g1", title: "Read 2 chapters of 'Designing Data-Intensive Apps'", done: true, category: "Learning" },
  { id: "g2", title: "30 min workout", done: false, category: "Health" },
  { id: "g3", title: "Review weekly progress notes", done: false, category: "Review" },
  { id: "g4", title: "Meditate 10 minutes", done: true, category: "Wellness" },
  { id: "g5", title: "Prep meal plan for the week", done: false, category: "Health" },
];

const routines = [
  { icon: Coffee, label: "Morning Review", time: "07:00", status: "done" },
  { icon: Brain, label: "Deep Work Block", time: "09:00", status: "active" },
  { icon: BookOpen, label: "Learning Session", time: "14:00", status: "upcoming" },
  { icon: Dumbbell, label: "Exercise", time: "17:00", status: "upcoming" },
  { icon: Target, label: "Evening Reflection", time: "21:00", status: "upcoming" },
];

const categoryIcons: Record<string, React.ElementType> = {
  Learning: BookOpen, Health: Dumbbell, Review: Target, Wellness: Sparkles,
};

const PersonalPage = () => {
  const [goals, setGoals] = useState(personalGoals);
  const [selectedGoal, setSelectedGoal] = useState<typeof personalGoals[0] | null>(null);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");

  const myTasks = tasks.filter((t) => t.assignee === "Fawwaz" || t.assignee === "Ihab").slice(0, 4);
  const myAgents = agents.filter((a) => a.status === "online" || a.status === "idle").slice(0, 3);
  const doneCount = goals.filter((g) => g.done).length;

  const toggleGoal = (id: string) => {
    setGoals((p) => p.map((g) => g.id === id ? { ...g, done: !g.done } : g));
  };

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;
    setGoals((p) => [...p, { id: `g${Date.now()}`, title: newGoalTitle, done: false, category: "Review" }]);
    setNewGoalTitle("");
    setShowNewGoal(false);
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-24">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-foreground glow-text">Personal</h1>
        <p className="text-sm text-muted-foreground mono mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* Progress overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Daily Progress</h2>
          </div>
          <span className="text-lg font-bold mono text-primary">{doneCount}/{goals.length}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(doneCount / goals.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <p className="text-[10px] mono text-muted-foreground">{Math.round((doneCount / goals.length) * 100)}% completed today</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals checklist */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Today's Goals</h2>
            <button onClick={() => setShowNewGoal(true)} className="flex items-center gap-1 text-[10px] mono text-primary hover:text-primary/80 transition-colors">
              <Plus className="h-3 w-3" /> Add Goal
            </button>
          </div>
          <div className="space-y-2">
            {goals.map((goal, i) => {
              const CatIcon = categoryIcons[goal.category] || Target;
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="glass-panel-hover p-3 flex items-center gap-3 cursor-pointer group"
                  onClick={() => setSelectedGoal(goal)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleGoal(goal.id); }}
                    className={cn(
                      "shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                      goal.done
                        ? "bg-glow-success/20 border-glow-success text-glow-success"
                        : "border-border/50 hover:border-primary/50"
                    )}
                  >
                    {goal.done && <CheckCircle2 className="h-3 w-3" />}
                  </button>
                  <CatIcon className={cn("h-3.5 w-3.5 shrink-0", goal.done ? "text-muted-foreground/40" : "text-muted-foreground")} />
                  <span className={cn("text-sm flex-1", goal.done ? "text-muted-foreground/50 line-through" : "text-foreground")}>{goal.title}</span>
                  <span className="text-[9px] mono text-muted-foreground/40 px-1.5 py-0.5 rounded bg-secondary/30">{goal.category}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Daily routine */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-sm font-semibold text-foreground mb-4">Routine</h2>
          <div className="glass-panel p-4 space-y-1">
            {routines.map((r, i) => (
              <div
                key={r.label}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                  r.status === "active" && "bg-primary/8 border border-primary/15",
                  r.status === "done" && "opacity-50"
                )}
              >
                <r.icon className={cn(
                  "h-4 w-4 shrink-0",
                  r.status === "active" ? "text-primary" :
                  r.status === "done" ? "text-glow-success" : "text-muted-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{r.label}</p>
                  <p className="text-[10px] mono text-muted-foreground">{r.time}</p>
                </div>
                {r.status === "done" && <CheckCircle2 className="h-3 w-3 text-glow-success" />}
                {r.status === "active" && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* My assigned tasks */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="text-sm font-semibold text-foreground mb-4">My Tasks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {myTasks.map((task, i) => (
            <div key={task.id} className="glass-panel-hover p-4">
              <p className="text-xs font-medium text-foreground mb-2">{task.title}</p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[9px] mono font-bold px-1.5 py-0.5 rounded",
                  task.priority === "P0" ? "bg-glow-danger/20 text-glow-danger" :
                  task.priority === "P1" ? "bg-glow-warning/20 text-glow-warning" :
                  "bg-primary/20 text-primary"
                )}>{task.priority}</span>
                <span className="text-[10px] mono text-muted-foreground">{task.status.replace("_", " ")}</span>
                <span className="text-[10px] mono text-muted-foreground/40 ml-auto">{task.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Assigned agents */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-sm font-semibold text-foreground mb-4">Available Agents</h2>
        <div className="flex gap-3">
          {myAgents.map((a) => (
            <div key={a.id} className="glass-panel-hover p-4 flex-1 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2">
                <User className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs font-semibold text-foreground">{a.name}</p>
              <p className="text-[10px] mono text-muted-foreground">{a.role}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* New Goal Overlay */}
      <ExpandableOverlay isOpen={showNewGoal} onClose={() => setShowNewGoal(false)} title="New Goal">
        <div className="space-y-4">
          <input
            autoFocus
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            placeholder="What do you want to accomplish?"
            className="w-full text-sm bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowNewGoal(false)} className="flex-1 py-2.5 text-xs rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border/30 transition-colors">Cancel</button>
            <button onClick={addGoal} disabled={!newGoalTitle.trim()} className={cn("flex-1 py-2.5 text-xs rounded-lg transition-colors border", newGoalTitle.trim() ? "bg-primary/15 hover:bg-primary/25 text-primary border-primary/30" : "bg-secondary/30 text-muted-foreground/50 border-border/30")}>Add Goal</button>
          </div>
        </div>
      </ExpandableOverlay>
    </div>
  );
};

export default PersonalPage;
