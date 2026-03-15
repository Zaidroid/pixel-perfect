import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/mock-data";
import { StatusDot } from "./StatusDot";

interface AgentOrbProps {
  agent: Agent;
  index: number;
  onClick?: () => void;
}

export function AgentOrb({ agent, index, onClick }: AgentOrbProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "glass-panel-hover p-4 flex flex-col items-center gap-2 cursor-pointer relative group min-w-[120px]"
      )}
    >
      {/* Pulse ring for online agents */}
      {agent.status === "online" && (
        <div className="absolute inset-0 rounded-lg border border-primary/20 animate-pulse-ring pointer-events-none" />
      )}

      <div className="text-3xl mb-1" style={{ animation: agent.status === "online" ? "float 3s ease-in-out infinite" : undefined, animationDelay: `${index * 0.4}s` }}>
        {agent.avatar}
      </div>

      <div className="flex items-center gap-1.5">
        <StatusDot status={agent.status} size="sm" />
        <span className="text-sm font-medium text-foreground">{agent.name}</span>
      </div>

      <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">
        {agent.role}
      </span>

      <div className="text-[10px] mono text-muted-foreground/60 flex items-center gap-1">
        <span className={cn(
          "px-1 py-0.5 rounded text-[8px] font-semibold",
          agent.modelType === "PAID" ? "bg-glow-warning/20 text-glow-warning" : "bg-glow-success/20 text-glow-success"
        )}>
          {agent.modelType}
        </span>
        {agent.model.split(" ")[0]}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.button>
  );
}
