import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { agents } from "@/lib/mock-data";
import type { Agent } from "@/lib/mock-data";
import { StatusDot } from "@/components/command/StatusDot";
import { ExpandableOverlay } from "@/components/command/ExpandableOverlay";
import { RotateCw, ArrowLeftRight, MessageCircle, X, Send, ChevronRight, Activity, Clock, AlertTriangle, CheckCircle, Settings, History, BarChart3 } from "lucide-react";

function AgentCard({ agent, index, onExpand }: { agent: Agent; index: number; onExpand: (a: Agent) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, type: "spring" }}
      className="glass-panel-hover p-5 relative group cursor-pointer"
      onClick={() => onExpand(agent)}
    >
      {agent.status === "online" && (
        <div className="absolute top-3 right-3">
          <div className="h-2 w-2 rounded-full bg-glow-success glow-dot-online animate-pulse" />
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl" style={{ animation: agent.status === "online" ? "float 3s ease-in-out infinite" : undefined, animationDelay: `${index * 0.3}s` }}>
          {agent.avatar}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{agent.name}</h3>
            <StatusDot status={agent.status} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mono uppercase tracking-wider">{agent.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 text-glow-success" />
          <div>
            <p className="text-sm font-semibold text-foreground">{agent.tasksCompleted}</p>
            <p className="text-[10px] text-muted-foreground mono">Tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">{agent.responseTime}s</p>
            <p className="text-[10px] text-muted-foreground mono">Response</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] mono text-muted-foreground/60">
        <span className={cn(
          "px-1 py-0.5 rounded text-[8px] font-semibold",
          agent.modelType === "PAID" ? "bg-glow-warning/20 text-glow-warning" : "bg-glow-success/20 text-glow-success"
        )}>
          {agent.modelType}
        </span>
        {agent.model}
      </div>

      <p className="text-[10px] mono text-muted-foreground/40 mt-2">{agent.lastActivity}</p>
    </motion.div>
  );
}

function AgentExpandedContent({ agent, onChat }: { agent: Agent; onChat: () => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="text-5xl">{agent.avatar}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">{agent.name}</h3>
            <StatusDot status={agent.status} size="md" />
          </div>
          <p className="text-xs text-muted-foreground mono uppercase tracking-wider">{agent.role}</p>
          <p className="text-[10px] mono text-muted-foreground/60 mt-1">Last active: {agent.lastActivity}</p>
        </div>
      </div>

      {/* Model Chain */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">Model Chain</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs mono text-foreground px-2.5 py-1.5 rounded bg-secondary border border-border">{agent.model}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          <span className="text-xs mono text-muted-foreground px-2.5 py-1.5 rounded bg-secondary/50 border border-border/50">{agent.fallbackModel}</span>
          <span className={cn(
            "ml-auto text-[9px] font-bold px-2 py-1 rounded",
            agent.modelType === "PAID" ? "bg-glow-warning/20 text-glow-warning" : "bg-glow-success/20 text-glow-success"
          )}>
            {agent.modelType}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: CheckCircle, color: "text-glow-success", val: agent.tasksCompleted, label: "Tasks Done" },
          { icon: Clock, color: "text-primary", val: `${agent.responseTime}s`, label: "Avg Response" },
          { icon: AlertTriangle, color: "text-glow-warning", val: `${agent.errorRate}%`, label: "Error Rate" },
          { icon: Activity, color: "text-glow-success", val: `${agent.uptime}%`, label: "Uptime" },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-md bg-secondary/30 border border-border/30 text-center">
            <s.icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
            <p className="text-lg font-semibold text-foreground">{s.val}</p>
            <p className="text-[10px] text-muted-foreground mono">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Fake activity chart */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">Activity (24h)</span>
        </div>
        <div className="flex items-end gap-1 h-16">
          {[3, 5, 2, 8, 6, 4, 7, 9, 5, 3, 6, 8, 4, 7, 5, 6, 9, 3, 2, 5, 7, 4, 6, 8].map((v, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(v / 9) * 100}%` }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="flex-1 rounded-sm bg-primary/60"
            />
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <History className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">Recent Activity</span>
        </div>
        <div className="space-y-2">
          {[
            `Completed task T-${agent.tasksCompleted}`,
            `Model response in ${agent.responseTime}s`,
            `Heartbeat check passed`,
          ].map((act, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded bg-secondary/20 text-xs text-muted-foreground">
              <div className="h-1 w-1 rounded-full bg-primary" />
              {act}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/30 transition-colors">
          <RotateCw className="h-3.5 w-3.5" /> Restart
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/30 transition-colors">
          <ArrowLeftRight className="h-3.5 w-3.5" /> Swap Model
        </button>
        <button onClick={onChat} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors">
          <MessageCircle className="h-3.5 w-3.5" /> Chat
        </button>
      </div>
    </div>
  );
}

function ChatPanel({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [messages] = useState([
    { from: "system", text: `Connected to ${agent.name} (${agent.model})` },
    { from: "agent", text: `Hello! I'm ${agent.name}, your ${agent.role.toLowerCase()}. How can I help?` },
  ]);
  const [input, setInput] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: "spring", duration: 0.4 }}
      className="glass-panel flex flex-col h-[500px] lg:h-full"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <span className="text-xl">{agent.avatar}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
            <p className="text-[10px] mono text-muted-foreground">{agent.model}</p>
          </div>
          <StatusDot status={agent.status} size="sm" />
        </div>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-secondary text-muted-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.from === "system" && "justify-center")}>
            {msg.from === "system" ? (
              <span className="text-[10px] mono text-muted-foreground/50 bg-secondary/30 px-2 py-1 rounded">{msg.text}</span>
            ) : (
              <div className={cn("max-w-[80%] p-3 rounded-lg text-xs", msg.from === "agent" ? "bg-secondary/50 text-foreground" : "bg-primary/20 text-primary ml-auto")}>{msg.text}</div>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border/30">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message ${agent.name}...`}
            className="flex-1 text-xs bg-secondary/50 border border-border/50 rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 mono" />
          <button className="p-2 rounded-md bg-primary/20 text-primary hover:bg-primary/30 transition-colors"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}

const AgentsPage = () => {
  const [expandedAgent, setExpandedAgent] = useState<Agent | null>(null);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);

  const handleChat = () => {
    if (expandedAgent) {
      setChatAgent(expandedAgent);
      setExpandedAgent(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-foreground glow-text">Agent Fleet</h1>
        <p className="text-sm text-muted-foreground mono mt-1">
          {agents.filter((a) => a.status === "online").length} online · {agents.filter((a) => a.status === "idle").length} idle · {agents.filter((a) => a.status === "offline").length} offline
        </p>
      </motion.div>

      <div className="flex gap-6">
        <div className={cn("flex-1 grid gap-4 transition-all", chatAgent ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
          {agents.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} onExpand={setExpandedAgent} />
          ))}
        </div>

        <AnimatePresence>
          {chatAgent && (
            <div className="hidden lg:block w-[360px] shrink-0">
              <ChatPanel agent={chatAgent} onClose={() => setChatAgent(null)} />
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {chatAgent && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 p-4">
            <ChatPanel agent={chatAgent} onClose={() => setChatAgent(null)} />
          </div>
        )}
      </AnimatePresence>

      <ExpandableOverlay isOpen={!!expandedAgent} onClose={() => setExpandedAgent(null)} title={expandedAgent?.name ?? ""}>
        {expandedAgent && <AgentExpandedContent agent={expandedAgent} onChat={handleChat} />}
      </ExpandableOverlay>
    </div>
  );
};

export default AgentsPage;
