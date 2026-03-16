import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { agents } from "@/lib/mock-data";
import type { Agent } from "@/lib/mock-data";
import { StatusDot } from "@/components/command/StatusDot";
import { ExpandableOverlay } from "@/components/command/ExpandableOverlay";
import {
  RotateCw, ArrowLeftRight, MessageCircle, X, Send, ChevronRight,
  Activity, Clock, AlertTriangle, CheckCircle, Settings, History,
  BarChart3, Bot, Zap, Wrench, LineChart, Search, Filter,
} from "lucide-react";

const roleIcons: Record<string, React.ElementType> = {
  Dispatcher: Zap,
  Developer: Bot,
  Operations: Wrench,
  Analyst: LineChart,
  Researcher: Search,
};

const statusFilters = ["all", "online", "idle", "offline", "error"] as const;

function AgentCard({ agent, index, onExpand }: { agent: Agent; index: number; onExpand: (a: Agent) => void }) {
  const RoleIcon = roleIcons[agent.role] || Bot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, type: "spring" }}
      className="glass-panel-hover p-5 relative group cursor-pointer"
      onClick={() => onExpand(agent)}
    >
      {agent.status === "online" && (
        <div className="absolute top-3 right-3">
          <div className="h-2 w-2 rounded-full bg-glow-success glow-dot-online" />
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
          agent.status === "online" ? "bg-primary/15 border border-primary/30" :
          agent.status === "idle" ? "bg-glow-warning/10 border border-glow-warning/20" :
          agent.status === "error" ? "bg-glow-danger/10 border border-glow-danger/20" :
          "bg-secondary/50 border border-border/30"
        )}>
          <RoleIcon className={cn(
            "h-6 w-6",
            agent.status === "online" ? "text-primary" :
            agent.status === "idle" ? "text-glow-warning" :
            agent.status === "error" ? "text-glow-danger" :
            "text-muted-foreground"
          )} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{agent.name}</h3>
            <StatusDot status={agent.status} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mono uppercase tracking-wider">{agent.role}</p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { icon: CheckCircle, color: "text-glow-success", val: agent.tasksCompleted, label: "Tasks" },
          { icon: Clock, color: "text-primary", val: `${agent.responseTime}s`, label: "Resp." },
          { icon: Activity, color: "text-glow-success", val: `${agent.uptime}%`, label: "Up" },
        ].map((m) => (
          <div key={m.label} className="text-center p-2 rounded-md bg-secondary/20">
            <m.icon className={cn("h-3 w-3 mx-auto mb-0.5", m.color)} />
            <p className="text-sm font-semibold text-foreground">{m.val}</p>
            <p className="text-[9px] text-muted-foreground mono">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Model info */}
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
  const RoleIcon = roleIcons[agent.role] || Bot;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-xl flex items-center justify-center",
          agent.status === "online" ? "bg-primary/15 border border-primary/30" : "bg-secondary/50 border border-border/30"
        )}>
          <RoleIcon className={cn("h-7 w-7", agent.status === "online" ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">{agent.name}</h3>
            <StatusDot status={agent.status} size="md" />
          </div>
          <p className="text-xs text-muted-foreground mono uppercase tracking-wider">{agent.role}</p>
          <p className="text-[10px] mono text-muted-foreground/60 mt-1">Last active: {agent.lastActivity}</p>
        </div>
      </div>

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
  const [messages, setMessages] = useState([
    { from: "system", text: `Connected to ${agent.name} (${agent.model})` },
    { from: "agent", text: `Hello! I'm ${agent.name}, your ${agent.role.toLowerCase()}. How can I help?` },
  ]);
  const [input, setInput] = useState("");
  const RoleIcon = roleIcons[agent.role] || Bot;

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    const userMsg = input;
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "agent", text: `Processing: "${userMsg}" — This is a mock response from ${agent.name}.` }]);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: "spring", duration: 0.4 }}
      className="glass-panel flex flex-col h-[500px] lg:h-full"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            agent.status === "online" ? "bg-primary/15" : "bg-secondary/50"
          )}>
            <RoleIcon className={cn("h-4 w-4", agent.status === "online" ? "text-primary" : "text-muted-foreground")} />
          </div>
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
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex", msg.from === "system" && "justify-center")}
          >
            {msg.from === "system" ? (
              <span className="text-[10px] mono text-muted-foreground/50 bg-secondary/30 px-2 py-1 rounded">{msg.text}</span>
            ) : (
              <div className={cn("max-w-[80%] p-3 rounded-lg text-xs", msg.from === "agent" ? "bg-secondary/50 text-foreground" : "bg-primary/20 text-primary ml-auto")}>{msg.text}</div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="p-3 border-t border-border/30">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Message ${agent.name}...`}
            className="flex-1 text-xs bg-secondary/50 border border-border/50 rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 mono"
          />
          <button onClick={handleSend} className="p-2 rounded-md bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const AgentsPage = () => {
  const [expandedAgent, setExpandedAgent] = useState<Agent | null>(null);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const [statusFilter, setStatusFilter] = useState<typeof statusFilters[number]>("all");

  const handleChat = () => {
    if (expandedAgent) {
      setChatAgent(expandedAgent);
      setExpandedAgent(null);
    }
  };

  const filtered = statusFilter === "all" ? agents : agents.filter((a) => a.status === statusFilter);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground glow-text">Agent Fleet</h1>
          <p className="text-sm text-muted-foreground mono mt-1">
            {agents.filter((a) => a.status === "online").length} online · {agents.filter((a) => a.status === "idle").length} idle · {agents.filter((a) => a.status === "offline").length} offline
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-2.5 py-1.5 text-[10px] mono rounded-md border transition-colors capitalize",
                statusFilter === f
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "bg-secondary/30 border-border/30 text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="flex gap-6">
        <div className={cn("flex-1 grid gap-4 transition-all", chatAgent ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
          {filtered.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} onExpand={setExpandedAgent} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex items-center justify-center h-40 text-sm text-muted-foreground mono">
              No agents matching filter
            </div>
          )}
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
