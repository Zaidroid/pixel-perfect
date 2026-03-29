import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { agents } from "@/lib/mock-data";
import { ExpandableOverlay } from "@/components/command/ExpandableOverlay";
import {
  FolderOpen, Plus, Check, X, Clock, AlertTriangle,
  GitBranch, Users, BarChart3, Sparkles, ChevronRight,
  Search, Filter, ArrowUpRight, Bot, Lightbulb,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "planning" | "completed" | "paused";
  progress: number;
  agents: string[];
  tasks: { total: number; done: number };
  lastUpdate: string;
  category: string;
}

interface Approval {
  id: string;
  title: string;
  description: string;
  suggestedBy: string;
  category: string;
  priority: "high" | "medium" | "low";
  reasoning: string;
  estimatedEffort: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
}

const mockProjects: Project[] = [
  { id: "p1", name: "OpenClaw Dashboard", description: "Command center for multi-agent orchestration", status: "active", progress: 72, agents: ["fawwaz", "tamador"], tasks: { total: 24, done: 17 }, lastUpdate: "2m ago", category: "Product" },
  { id: "p2", name: "Hope in Hand", description: "Charity platform with AI-powered matching", status: "active", progress: 45, agents: ["nour", "zaid"], tasks: { total: 18, done: 8 }, lastUpdate: "1h ago", category: "Social Impact" },
  { id: "p3", name: "API Gateway v2", description: "Unified API layer with rate limiting and auth", status: "planning", progress: 15, agents: ["tamador", "ihab"], tasks: { total: 12, done: 2 }, lastUpdate: "3h ago", category: "Infrastructure" },
  { id: "p4", name: "Knowledge Base", description: "Centralized documentation and learning system", status: "paused", progress: 30, agents: ["zaid"], tasks: { total: 8, done: 2 }, lastUpdate: "2d ago", category: "Internal" },
  { id: "p5", name: "Email Triage System", description: "Automated email classification and routing", status: "completed", progress: 100, agents: ["fawwaz", "ihab"], tasks: { total: 15, done: 15 }, lastUpdate: "5d ago", category: "Automation" },
];

const mockApprovals: Approval[] = [
  { id: "a1", title: "Customer Feedback Analyzer", description: "Build a sentiment analysis pipeline for incoming support tickets to identify urgent issues automatically.", suggestedBy: "nour", category: "Analytics", priority: "high", reasoning: "We're getting 200+ tickets/day. Manual triage misses ~15% of urgent issues. An ML pipeline could reduce response time by 40%.", estimatedEffort: "2 weeks", timestamp: "1h ago", status: "pending" },
  { id: "a2", title: "Auto-scaling Infrastructure", description: "Implement dynamic resource allocation based on agent workload patterns.", suggestedBy: "ihab", category: "Infrastructure", priority: "medium", reasoning: "Current fixed allocation wastes 30% resources during off-peak. Auto-scaling could save $400/mo and improve peak performance.", estimatedEffort: "1 week", timestamp: "3h ago", status: "pending" },
  { id: "a3", title: "Weekly Report Generator", description: "Automated weekly progress reports compiled from all agent activities and project metrics.", suggestedBy: "fawwaz", category: "Automation", priority: "low", reasoning: "You spend ~2 hours every Monday compiling reports. This could be fully automated with data we already collect.", estimatedEffort: "3 days", timestamp: "6h ago", status: "pending" },
  { id: "a4", title: "Competitor Price Monitor", description: "Real-time competitor pricing tracker with alerts for significant changes.", suggestedBy: "zaid", category: "Research", priority: "medium", reasoning: "Based on my research, competitors adjust pricing bi-weekly. We're currently 2-3 days behind on detecting changes.", estimatedEffort: "5 days", timestamp: "1d ago", status: "pending" },
];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: "text-glow-success", bg: "bg-glow-success/10 border-glow-success/20", label: "Active" },
  planning: { color: "text-primary", bg: "bg-primary/10 border-primary/20", label: "Planning" },
  completed: { color: "text-muted-foreground", bg: "bg-secondary/30 border-border/20", label: "Done" },
  paused: { color: "text-glow-warning", bg: "bg-glow-warning/10 border-glow-warning/20", label: "Paused" },
};

const priorityConfig: Record<string, { color: string; bg: string }> = {
  high: { color: "text-glow-danger", bg: "bg-glow-danger/10 border-glow-danger/20" },
  medium: { color: "text-glow-warning", bg: "bg-glow-warning/10 border-glow-warning/20" },
  low: { color: "text-muted-foreground", bg: "bg-secondary/20 border-border/20" },
};

const ProjectsPage = () => {
  const [view, setView] = useState<"projects" | "approvals">("projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [approvals, setApprovals] = useState(mockApprovals);
  const [search, setSearch] = useState("");

  const handleApproval = (id: string, decision: "approved" | "rejected") => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: decision } : a));
  };

  const filteredProjects = mockProjects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const pendingApprovals = approvals.filter(a => a.status === "pending");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Projects</h1>
          <p className="text-xs text-muted-foreground mono mt-1">
            {mockProjects.filter(p => p.status === "active").length} active · {pendingApprovals.length} pending approval{pendingApprovals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-[11px] mono rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 transition-colors">
          <Plus className="h-3 w-3" /> New Project
        </button>
      </div>

      {/* View toggle + search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/15 border border-border/15">
          <button onClick={() => setView("projects")}
            className={cn("relative flex items-center gap-1.5 px-4 py-2 text-[11px] mono rounded-lg transition-all",
              view === "projects" ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            {view === "projects" && <motion.div layoutId="proj-tab" className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20" transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} />}
            <FolderOpen className="h-3 w-3 relative z-10" />
            <span className="relative z-10">Projects</span>
          </button>
          <button onClick={() => setView("approvals")}
            className={cn("relative flex items-center gap-1.5 px-4 py-2 text-[11px] mono rounded-lg transition-all",
              view === "approvals" ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            {view === "approvals" && <motion.div layoutId="proj-tab" className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20" transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} />}
            <Lightbulb className="h-3 w-3 relative z-10" />
            <span className="relative z-10">Approvals</span>
            {pendingApprovals.length > 0 && (
              <span className="relative z-10 ml-1 px-1.5 py-0.5 rounded-full bg-glow-warning/15 text-glow-warning text-[8px] font-bold">
                {pendingApprovals.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full text-[11px] mono bg-secondary/15 border border-border/20 rounded-lg pl-8 pr-3 py-2 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-colors" />
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === "projects" ? (
          <motion.div key="projects" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project, i) => {
                const status = statusConfig[project.status];
                const assignedAgents = agents.filter(a => project.agents.includes(a.id));
                return (
                  <motion.div key={project.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="glass-panel p-5 cursor-pointer group hover:border-border/40 transition-all"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-foreground truncate">{project.name}</h3>
                          <span className={cn("px-1.5 py-0.5 text-[7px] mono font-bold uppercase rounded border", status.bg, status.color)}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 line-clamp-1">{project.description}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-all shrink-0 mt-1" />
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] mono text-muted-foreground/50">Progress</span>
                        <span className="text-[9px] mono text-foreground/70 font-bold">{project.progress}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-secondary/30 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className={cn("h-full rounded-full", project.status === "completed" ? "bg-glow-success" : "bg-primary")} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {assignedAgents.slice(0, 3).map(a => (
                          <div key={a.id} className="w-5 h-5 rounded-md bg-secondary/30 border border-border/15 flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                            {a.name[0]}
                          </div>
                        ))}
                        {assignedAgents.length > 3 && (
                          <span className="text-[8px] mono text-muted-foreground/40">+{assignedAgents.length - 3}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] mono text-muted-foreground/40">
                        <span>{project.tasks.done}/{project.tasks.total} tasks</span>
                        <span>·</span>
                        <span>{project.lastUpdate}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="approvals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="space-y-3">
              {approvals.map((approval, i) => {
                const agent = agents.find(a => a.id === approval.suggestedBy);
                const priority = priorityConfig[approval.priority];
                const isPending = approval.status === "pending";
                return (
                  <motion.div key={approval.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "glass-panel p-5 transition-all",
                      !isPending && "opacity-50"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Agent avatar */}
                      <div className="w-9 h-9 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary/70" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="text-sm font-semibold text-foreground">{approval.title}</h3>
                              <span className={cn("px-1.5 py-0.5 text-[7px] mono font-bold uppercase rounded border", priority.bg, priority.color)}>
                                {approval.priority}
                              </span>
                              <span className="px-1.5 py-0.5 text-[7px] mono text-muted-foreground/50 bg-secondary/20 rounded border border-border/10">
                                {approval.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground/60">{approval.description}</p>
                          </div>
                          <span className="text-[9px] mono text-muted-foreground/30 shrink-0">{approval.timestamp}</span>
                        </div>

                        {/* Reasoning */}
                        <div className="p-3 rounded-lg bg-secondary/10 border border-border/10">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles className="h-3 w-3 text-primary/50" />
                            <span className="text-[9px] mono text-muted-foreground/50 uppercase tracking-wider">Agent Reasoning</span>
                          </div>
                          <p className="text-[11px] text-foreground/70 leading-relaxed">{approval.reasoning}</p>
                        </div>

                        {/* Meta + Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-[9px] mono text-muted-foreground/40">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {agent?.name}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {approval.estimatedEffort}</span>
                          </div>

                          {isPending ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleApproval(approval.id, "rejected")}
                                className="flex items-center gap-1 px-3 py-1.5 text-[10px] mono rounded-lg bg-secondary/20 border border-border/20 text-muted-foreground hover:text-glow-danger hover:border-glow-danger/20 transition-all">
                                <X className="h-3 w-3" /> Reject
                              </button>
                              <button onClick={() => handleApproval(approval.id, "approved")}
                                className="flex items-center gap-1 px-3 py-1.5 text-[10px] mono rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 transition-all">
                                <Check className="h-3 w-3" /> Approve
                              </button>
                            </div>
                          ) : (
                            <span className={cn("text-[10px] mono font-bold uppercase",
                              approval.status === "approved" ? "text-glow-success" : "text-glow-danger"
                            )}>
                              {approval.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Detail Overlay */}
      <ExpandableOverlay isOpen={!!selectedProject} onClose={() => setSelectedProject(null)}
        title={selectedProject?.name ?? ""} subtitle={selectedProject ? `${selectedProject.category} · ${selectedProject.lastUpdate}` : ""}
        icon={selectedProject ? <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20"><FolderOpen className="h-5 w-5 text-primary" /></div> : undefined}
        size="lg"
      >
        {selectedProject && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground/70">{selectedProject.description}</p>

            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: BarChart3, label: "Progress", val: `${selectedProject.progress}%`, color: "text-primary" },
                { icon: Check, label: "Done", val: `${selectedProject.tasks.done}`, color: "text-glow-success" },
                { icon: AlertTriangle, label: "Remaining", val: `${selectedProject.tasks.total - selectedProject.tasks.done}`, color: "text-glow-warning" },
                { icon: Users, label: "Agents", val: `${selectedProject.agents.length}`, color: "text-primary" },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl bg-secondary/15 border border-border/15 text-center">
                  <s.icon className={cn("h-4 w-4 mx-auto mb-1.5", s.color)} />
                  <p className="text-lg font-bold text-foreground tabular-nums">{s.val}</p>
                  <p className="text-[9px] text-muted-foreground mono">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-secondary/10 border border-border/10">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[9px] mono text-muted-foreground uppercase tracking-wider">Assigned Agents</span>
              </div>
              <div className="space-y-2">
                {agents.filter(a => selectedProject.agents.includes(a.id)).map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/15">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{a.name[0]}</div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{a.name}</p>
                      <p className="text-[9px] mono text-muted-foreground/50">{a.role}</p>
                    </div>
                    <div className={cn("h-1.5 w-1.5 rounded-full",
                      a.status === "online" ? "bg-glow-success" : a.status === "idle" ? "bg-glow-warning" : "bg-muted-foreground/30"
                    )} />
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] mono text-muted-foreground/50">Overall Progress</span>
                <span className="text-xs font-bold text-foreground mono">{selectedProject.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/30 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${selectedProject.progress}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full bg-primary" />
              </div>
            </div>
          </div>
        )}
      </ExpandableOverlay>
    </motion.div>
  );
};

export default ProjectsPage;
