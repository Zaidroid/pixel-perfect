import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { agents, tasks, services } from "@/lib/mock-data";
import {
  Briefcase, FolderKanban, GitBranch, Clock, CheckCircle2,
  TrendingUp, Users, ArrowRight, Plus, ExternalLink, Circle, Ban,
} from "lucide-react";
import { ExpandableOverlay } from "@/components/command/ExpandableOverlay";

interface Project {
  id: string;
  name: string;
  description: string;
  agents: string[];
  taskCount: number;
  completedCount: number;
  status: "active" | "paused" | "completed";
  lastUpdate: string;
}

const projects: Project[] = [
  {
    id: "openclaw", name: "OpenClaw", description: "AI-powered command center for managing agents and services",
    agents: ["Fawwaz", "Tamador", "Ihab"],
    taskCount: 12, completedCount: 8, status: "active", lastUpdate: "2 min ago",
  },
  {
    id: "hope", name: "Hope in Hand", description: "Charity platform with AI-assisted outreach and donor management",
    agents: ["Nour", "Zaid"],
    taskCount: 7, completedCount: 3, status: "active", lastUpdate: "1 hr ago",
  },
  {
    id: "infrabot", name: "InfraBot", description: "Automated infrastructure monitoring and self-healing",
    agents: ["Ihab"],
    taskCount: 5, completedCount: 5, status: "completed", lastUpdate: "2 days ago",
  },
];

const statusColors = {
  active: "bg-glow-success/15 text-glow-success",
  paused: "bg-glow-warning/15 text-glow-warning",
  completed: "bg-primary/15 text-primary",
};

const WorkPage = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const workTasks = tasks.filter((t) => t.project === "OpenClaw" || t.project === "Hope in Hand");
  const activeTasks = workTasks.filter((t) => t.status === "in_progress" || t.status === "todo");
  const runningServices = services.filter((s) => s.status === "running");

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-24">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-foreground glow-text">Work</h1>
        <p className="text-sm text-muted-foreground mono mt-1">Projects and team operations</p>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Projects", value: projects.filter((p) => p.status === "active").length, icon: FolderKanban, color: "text-primary" },
          { label: "Open Tasks", value: activeTasks.length, icon: Circle, color: "text-glow-warning" },
          { label: "Active Agents", value: agents.filter((a) => a.status === "online").length, icon: Users, color: "text-glow-success" },
          { label: "Services Up", value: runningServices.length, icon: TrendingUp, color: "text-glow-success" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            className="glass-panel p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("h-4 w-4", stat.color)} />
              <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className={cn("text-2xl font-bold font-display", stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Projects</h2>
          <button className="flex items-center gap-1 text-[10px] mono text-primary hover:text-primary/80 transition-colors">
            <Plus className="h-3 w-3" /> New Project
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="glass-panel-hover p-5 cursor-pointer group"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{project.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{project.description}</p>
                </div>
                <span className={cn("text-[9px] mono font-bold px-2 py-1 rounded capitalize", statusColors[project.status])}>{project.status}</span>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] mono text-muted-foreground">Progress</span>
                  <span className="text-[10px] mono text-muted-foreground">{project.completedCount}/{project.taskCount}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(project.completedCount / project.taskCount) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>

              {/* Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] mono text-muted-foreground">{project.agents.join(", ")}</span>
                </div>
                <span className="text-[10px] mono text-muted-foreground/40">{project.lastUpdate}</span>
              </div>

              <div className="absolute inset-0 rounded-lg bg-primary/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent work activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h2 className="text-sm font-semibold text-foreground mb-4">Active Work Items</h2>
        <div className="space-y-2">
          {activeTasks.map((task, i) => (
            <div key={task.id} className="glass-panel p-3 flex items-center gap-3">
              <div className={cn(
                "h-2 w-2 rounded-full shrink-0",
                task.status === "in_progress" ? "bg-primary" : "bg-muted-foreground"
              )} />
              <span className="text-xs text-foreground flex-1">{task.title}</span>
              <span className={cn(
                "text-[9px] mono font-bold px-1.5 py-0.5 rounded",
                task.priority === "P0" ? "bg-glow-danger/20 text-glow-danger" :
                task.priority === "P1" ? "bg-glow-warning/20 text-glow-warning" :
                "bg-primary/20 text-primary"
              )}>{task.priority}</span>
              <span className="text-[10px] mono text-muted-foreground/50">{task.assignee}</span>
              <span className="text-[10px] mono text-muted-foreground/30">{task.project}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Project detail overlay */}
      <ExpandableOverlay
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name}
        size="lg"
        tabs={selectedProject ? [
          {
            id: "overview",
            label: "Overview",
            content: (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/30 text-center">
                    <p className="text-lg font-bold text-foreground">{selectedProject.taskCount}</p>
                    <p className="text-[10px] mono text-muted-foreground">Total Tasks</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/30 text-center">
                    <p className="text-lg font-bold text-glow-success">{selectedProject.completedCount}</p>
                    <p className="text-[10px] mono text-muted-foreground">Completed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/30 text-center">
                    <p className="text-lg font-bold text-primary">{selectedProject.agents.length}</p>
                    <p className="text-[10px] mono text-muted-foreground">Agents</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] mono text-muted-foreground uppercase tracking-wider mb-2">Progress</h3>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(selectedProject.completedCount / selectedProject.taskCount) * 100}%` }} />
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "team",
            label: "Team",
            content: (
              <div className="space-y-3">
                {selectedProject.agents.map((name) => {
                  const agent = agents.find((a) => a.name === name);
                  return agent ? (
                    <div key={name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{agent.name}</p>
                        <p className="text-[10px] mono text-muted-foreground">{agent.role} · {agent.model}</p>
                      </div>
                      <span className={cn(
                        "text-[9px] mono px-1.5 py-0.5 rounded",
                        agent.status === "online" ? "bg-glow-success/15 text-glow-success" : "bg-secondary text-muted-foreground"
                      )}>{agent.status}</span>
                    </div>
                  ) : null;
                })}
              </div>
            ),
          },
          {
            id: "tasks",
            label: "Tasks",
            content: (
              <div className="space-y-2">
                {workTasks.filter((t) => t.project === selectedProject.name).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                    <div className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      task.status === "done" ? "bg-glow-success" :
                      task.status === "in_progress" ? "bg-primary" :
                      task.status === "blocked" ? "bg-glow-danger" : "bg-muted-foreground"
                    )} />
                    <span className="text-xs text-foreground flex-1">{task.title}</span>
                    <span className={cn(
                      "text-[9px] mono font-bold px-1.5 py-0.5 rounded",
                      task.priority === "P0" ? "bg-glow-danger/20 text-glow-danger" :
                      task.priority === "P1" ? "bg-glow-warning/20 text-glow-warning" :
                      "bg-primary/20 text-primary"
                    )}>{task.priority}</span>
                  </div>
                ))}
              </div>
            ),
          },
        ] : undefined}
      >
        {null}
      </ExpandableOverlay>
    </div>
  );
};

export default WorkPage;
