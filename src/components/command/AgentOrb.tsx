import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/mock-data";
import { StatusDot } from "./StatusDot";
import { ExpandableOverlay } from "./ExpandableOverlay";
import { CheckCircle, Clock, AlertTriangle, Activity, ChevronRight, RotateCw, ArrowLeftRight, MessageCircle, BarChart3, Bot, Zap, Wrench, LineChart, Search } from "lucide-react";

const roleIcons: Record<string, React.ElementType> = {
  Dispatcher: Zap,
  Developer: Bot,
  Operations: Wrench,
  Analyst: LineChart,
  Researcher: Search,
};

interface AgentOrbProps {
  agent: Agent;
  index: number;
}

export function AgentOrb({ agent, index }: AgentOrbProps) {
  const [expanded, setExpanded] = useState(false);
  const RoleIcon = roleIcons[agent.role] || Bot;

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(true)}
        className={cn("glass-panel-hover p-4 flex flex-col items-center gap-2 cursor-pointer relative group min-w-[120px]")}
      >
        {/* Subtle online indicator - just a small dot, no pulsing border */}
        {agent.status === "online" && (
          <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-glow-success glow-dot-online" />
        )}
        
        {/* Icon-based avatar instead of emoji */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-1",
          agent.status === "online" ? "bg-primary/15 border border-primary/30" :
          agent.status === "idle" ? "bg-glow-warning/10 border border-glow-warning/20" :
          agent.status === "error" ? "bg-glow-danger/10 border border-glow-danger/20" :
          "bg-secondary/50 border border-border/30"
        )}>
          <RoleIcon className={cn(
            "h-5 w-5",
            agent.status === "online" ? "text-primary" :
            agent.status === "idle" ? "text-glow-warning" :
            agent.status === "error" ? "text-glow-danger" :
            "text-muted-foreground"
          )} />
        </div>

        <div className="flex items-center gap-1.5">
          <StatusDot status={agent.status} size="sm" />
          <span className="text-sm font-medium text-foreground">{agent.name}</span>
        </div>
        <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">{agent.role}</span>
        <div className="text-[10px] mono text-muted-foreground/60 flex items-center gap-1">
          <span className={cn("px-1 py-0.5 rounded text-[8px] font-semibold", agent.modelType === "PAID" ? "bg-glow-warning/20 text-glow-warning" : "bg-glow-success/20 text-glow-success")}>
            {agent.modelType}
          </span>
          {agent.model.split(" ")[0]}
        </div>
        <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.button>

      <ExpandableOverlay isOpen={expanded} onClose={() => setExpanded(false)} title={agent.name}>
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center",
              agent.status === "online" ? "bg-primary/15 border border-primary/30" :
              "bg-secondary/50 border border-border/30"
            )}>
              <RoleIcon className={cn("h-7 w-7", agent.status === "online" ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">{agent.name}</h3>
                <StatusDot status={agent.status} size="md" />
              </div>
              <p className="text-xs text-muted-foreground mono uppercase tracking-wider">{agent.role}</p>
              <p className="text-[10px] mono text-muted-foreground/60 mt-1">Last active: {agent.lastActivity}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
            <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">Model Chain</span>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs mono text-foreground px-2.5 py-1.5 rounded bg-secondary border border-border">{agent.model}</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              <span className="text-xs mono text-muted-foreground px-2.5 py-1.5 rounded bg-secondary/50 border border-border/50">{agent.fallbackModel}</span>
              <span className={cn("ml-auto text-[9px] font-bold px-2 py-1 rounded", agent.modelType === "PAID" ? "bg-glow-warning/20 text-glow-warning" : "bg-glow-success/20 text-glow-success")}>
                {agent.modelType}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: CheckCircle, color: "text-glow-success", val: agent.tasksCompleted, label: "Tasks" },
              { icon: Clock, color: "text-primary", val: `${agent.responseTime}s`, label: "Response" },
              { icon: AlertTriangle, color: "text-glow-warning", val: `${agent.errorRate}%`, label: "Errors" },
              { icon: Activity, color: "text-glow-success", val: `${agent.uptime}%`, label: "Uptime" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-md bg-secondary/30 border border-border/30 text-center">
                <s.icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
                <p className="text-lg font-semibold text-foreground">{s.val}</p>
                <p className="text-[10px] text-muted-foreground mono">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">Activity (24h)</span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {[3, 5, 2, 8, 6, 4, 7, 9, 5, 3, 6, 8, 4, 7, 5, 6, 9, 3, 2, 5, 7, 4, 6, 8].map((v, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(v / 9) * 100}%` }} transition={{ duration: 0.3, delay: i * 0.02 }} className="flex-1 rounded-sm bg-primary/60" />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/30 transition-colors">
              <RotateCw className="h-3.5 w-3.5" /> Restart
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/30 transition-colors">
              <ArrowLeftRight className="h-3.5 w-3.5" /> Swap Model
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors">
              <MessageCircle className="h-3.5 w-3.5" /> Chat
            </button>
          </div>
        </div>
      </ExpandableOverlay>
    </>
  );
}
