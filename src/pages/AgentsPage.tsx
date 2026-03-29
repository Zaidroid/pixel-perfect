import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { agents } from "@/lib/mock-data";
import type { Agent } from "@/lib/mock-data";
import { StatusDot } from "@/components/command/StatusDot";
import { ExpandableOverlay } from "@/components/command/ExpandableOverlay";
import { AgentNetworkGraph } from "@/components/command/AgentNetworkGraph";
import {
  RotateCw, ArrowLeftRight, MessageCircle, X, Send, ChevronRight,
  Activity, Clock, AlertTriangle, CheckCircle, Settings, History,
  BarChart3, Bot, Zap, Wrench, LineChart, Search, Filter, Network,
  Terminal, Cpu, TrendingUp,
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
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, type: "spring", stiffness: 200 }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="glass-panel p-5 relative group cursor-pointer hover:border-border/50 transition-all duration-300"
      onClick={() => onExpand(agent)}
    >
      {/* Status indicator line */}
      <div className={cn(
        "absolute top-0 left-4 right-4 h-[2px] rounded-b-full",
        agent.status === "online" ? "bg-glow-success" :
        agent.status === "idle" ? "bg-glow-warning" :
        agent.status === "error" ? "bg-glow-danger" :
        "bg-border/30"
      )} />

      <div className="flex items-center gap-4 mb-4 mt-1">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
          agent.status === "online" ? "bg-primary/10 border border-primary/25 group-hover:bg-primary/15 group-hover:shadow-[0_0_16px_-4px_hsl(var(--glow-primary)/0.3)]" :
          agent.status === "idle" ? "bg-glow-warning/8 border border-glow-warning/15" :
          agent.status === "error" ? "bg-glow-danger/8 border border-glow-danger/15" :
          "bg-secondary/40 border border-border/20"
        )}>
          <RoleIcon className={cn(
            "h-5 w-5",
            agent.status === "online" ? "text-primary" :
            agent.status === "idle" ? "text-glow-warning" :
            agent.status === "error" ? "text-glow-danger" :
            "text-muted-foreground"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground truncate">{agent.name}</h3>
            <StatusDot status={agent.status} size="sm" />
          </div>
          <p className="text-[10px] text-muted-foreground mono uppercase tracking-wider">{agent.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { val: agent.tasksCompleted, label: "Tasks", color: "text-glow-success" },
          { val: `${agent.responseTime}s`, label: "Resp", color: "text-primary" },
          { val: `${agent.uptime}%`, label: "Up", color: "text-glow-success" },
        ].map((m) => (
          <div key={m.label} className="text-center py-2 rounded-lg bg-secondary/15 border border-border/10">
            <p className={cn("text-sm font-bold tabular-nums", m.color)}>{m.val}</p>
            <p className="text-[8px] text-muted-foreground mono uppercase">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] mono text-muted-foreground/50">
          <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold", agent.modelType === "PAID" ? "bg-glow-warning/15 text-glow-warning" : "bg-glow-success/15 text-glow-success")}>
            {agent.modelType}
          </span>
          {agent.model.split(" ")[0]}
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-all duration-200" />
      </div>
    </motion.div>
  );
}

function AgentExpandedContent({ agent, onChat }: { agent: Agent; onChat: () => void }) {
  const RoleIcon = roleIcons[agent.role] || Bot;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center",
          agent.status === "online" ? "bg-primary/10 border border-primary/25" : "bg-secondary/40 border border-border/20"
        )}>
          <RoleIcon className={cn("h-6 w-6", agent.status === "online" ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">{agent.name}</h3>
            <StatusDot status={agent.status} size="md" />
          </div>
          <p className="text-[10px] text-muted-foreground mono uppercase tracking-wider">{agent.role}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-secondary/20 border border-border/15">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[9px] mono text-muted-foreground uppercase tracking-wider">Model Chain</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs mono text-foreground px-2.5 py-1.5 rounded-lg bg-secondary/50 border border-border/20">{agent.model}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
          <span className="text-xs mono text-muted-foreground/70 px-2.5 py-1.5 rounded-lg bg-secondary/30 border border-border/10">{agent.fallbackModel}</span>
          <span className={cn("ml-auto text-[8px] font-bold px-2 py-1 rounded-md", agent.modelType === "PAID" ? "bg-glow-warning/15 text-glow-warning" : "bg-glow-success/15 text-glow-success")}>
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
          <div key={s.label} className="p-3 rounded-xl bg-secondary/15 border border-border/15 text-center">
            <s.icon className={cn("h-4 w-4 mx-auto mb-1.5", s.color)} />
            <p className="text-lg font-bold text-foreground tabular-nums">{s.val}</p>
            <p className="text-[9px] text-muted-foreground mono">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-secondary/15 border border-border/15">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[9px] mono text-muted-foreground uppercase tracking-wider">Activity (24h)</span>
        </div>
        <div className="flex items-end gap-[3px] h-16">
          {[3,5,2,8,6,4,7,9,5,3,6,8,4,7,5,6,9,3,2,5,7,4,6,8].map((v, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(v / 9) * 100}%` }}
              transition={{ duration: 0.4, delay: i * 0.02 }}
              className="flex-1 rounded-sm bg-primary/50 hover:bg-primary/80 transition-colors cursor-crosshair"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-lg bg-secondary/30 hover:bg-secondary/50 text-foreground border border-border/20 transition-colors">
          <RotateCw className="h-3.5 w-3.5" /> Restart
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-lg bg-secondary/30 hover:bg-secondary/50 text-foreground border border-border/20 transition-colors">
          <ArrowLeftRight className="h-3.5 w-3.5" /> Swap Model
        </button>
        <button onClick={onChat} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors">
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
      setMessages((prev) => [...prev, { from: "agent", text: `Processing: "${userMsg}" -- This is a mock response from ${agent.name}.` }]);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="glass-panel flex flex-col h-[500px] lg:h-full"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", agent.status === "online" ? "bg-primary/10" : "bg-secondary/40")}>
            <RoleIcon className={cn("h-4 w-4", agent.status === "online" ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
            <p className="text-[9px] mono text-muted-foreground">{agent.model}</p>
          </div>
          <StatusDot status={agent.status} size="sm" />
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", msg.from === "system" && "justify-center")}>
            {msg.from === "system" ? (
              <span className="text-[9px] mono text-muted-foreground/40 bg-secondary/20 px-2 py-1 rounded">{msg.text}</span>
            ) : (
              <div className={cn("max-w-[80%] p-3 rounded-xl text-xs", msg.from === "agent" ? "bg-secondary/30 text-foreground" : "bg-primary/15 text-primary ml-auto")}>{msg.text}</div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="p-3 border-t border-border/20">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Message ${agent.name}...`}
            className="flex-1 text-xs bg-secondary/30 border border-border/30 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 mono transition-colors"
          />
          <button onClick={handleSend} className="p-2 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors">
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
  const [showNetwork, setShowNetwork] = useState(true);

  const handleChat = () => {
    if (expandedAgent) {
      setChatAgent(expandedAgent);
      setExpandedAgent(null);
    }
  };

  const filtered = statusFilter === "all" ? agents : agents.filter((a) => a.status === statusFilter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-[1440px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Agent Fleet</h1>
          <p className="text-xs text-muted-foreground mono mt-1">
            {agents.filter((a) => a.status === "online").length} online · {agents.filter((a) => a.status === "idle").length} idle · {agents.filter((a) => a.status === "offline").length} offline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNetwork(!showNetwork)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-[10px] mono rounded-lg border transition-all",
              showNetwork ? "bg-primary/10 border-primary/25 text-primary" : "bg-secondary/30 border-border/30 text-muted-foreground hover:text-foreground"
            )}
          >
            <Network className="h-3 w-3" /> Interactions
          </button>
          <div className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            {statusFilters.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "px-2.5 py-1.5 text-[10px] mono rounded-lg border transition-all capitalize",
                  statusFilter === f
                    ? "bg-primary/10 border-primary/25 text-primary"
                    : "bg-secondary/20 border-border/20 text-muted-foreground hover:text-foreground hover:border-border/40"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Cards Grid */}
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

      {/* Network Graph - below cards */}
      <AnimatePresence>
        {showNetwork && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-5">
              <div className="flex items-center gap-2 mb-4">
                <Network className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Agent Interactions</h2>
                <span className="text-[9px] mono text-muted-foreground/50 ml-auto">Real-time multi-agent communication</span>
              </div>
              <AgentNetworkGraph />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ExpandableOverlay
        isOpen={!!expandedAgent}
        onClose={() => setExpandedAgent(null)}
        title={expandedAgent?.name ?? ""}
        subtitle={expandedAgent ? `${expandedAgent.role} · ${expandedAgent.model}` : ""}
        icon={expandedAgent ? (
          <div className={cn("p-2.5 rounded-xl", expandedAgent.status === "online" ? "bg-primary/10 border border-primary/25" : "bg-secondary/40 border border-border/20")}>
            {(() => { const I = roleIcons[expandedAgent.role] || Bot; return <I className={cn("h-5 w-5", expandedAgent.status === "online" ? "text-primary" : "text-muted-foreground")} />; })()}
          </div>
        ) : undefined}
        statusBadge={expandedAgent ? <StatusDot status={expandedAgent.status} size="md" /> : undefined}
        size="lg"
        tabs={expandedAgent ? [
          { id: "overview", label: "Overview", icon: <Activity className="h-3 w-3" />, content: <AgentExpandedContent agent={expandedAgent} onChat={handleChat} /> },
          {
            id: "terminal",
            label: "Terminal",
            icon: <Terminal className="h-3 w-3" />,
            content: (
              <div className="bg-background/80 rounded-xl p-4 border border-border/20 h-48 overflow-y-auto font-mono">
                <p className="text-[11px] text-glow-success">$ agent status {expandedAgent.name.toLowerCase()}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Status: {expandedAgent.status}</p>
                <p className="text-[11px] text-muted-foreground">Model: {expandedAgent.model}</p>
                <p className="text-[11px] text-muted-foreground">Uptime: {expandedAgent.uptime}%</p>
                <p className="text-[11px] text-muted-foreground">Tasks: {expandedAgent.tasksCompleted} completed</p>
                <p className="text-[11px] text-muted-foreground mt-2">$ _</p>
              </div>
            ),
          },
          {
            id: "performance",
            label: "Performance",
            icon: <TrendingUp className="h-3 w-3" />,
            content: (
              <div className="space-y-4">
                {[
                  { label: "Response Time", val: `${expandedAgent.responseTime}s`, pct: Math.min(expandedAgent.responseTime / 5 * 100, 100), color: "bg-primary" },
                  { label: "Error Rate", val: `${expandedAgent.errorRate}%`, pct: expandedAgent.errorRate * 10, color: "bg-glow-warning" },
                  { label: "Uptime", val: `${expandedAgent.uptime}%`, pct: expandedAgent.uptime, color: "bg-glow-success" },
                  { label: "Task Throughput", val: `${Math.round(expandedAgent.tasksCompleted / 7)}/day`, pct: Math.min(expandedAgent.tasksCompleted / 2, 100), color: "bg-primary" },
                ].map((metric) => (
                  <div key={metric.label} className="p-3 rounded-xl bg-secondary/15 border border-border/15">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] mono text-muted-foreground uppercase">{metric.label}</span>
                      <span className="text-xs font-bold text-foreground mono tabular-nums">{metric.val}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary/30 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${metric.pct}%` }} transition={{ duration: 0.8 }} className={cn("h-full rounded-full", metric.color)} />
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
        ] : undefined}
      >
        {expandedAgent && <AgentExpandedContent agent={expandedAgent} onChat={handleChat} />}
      </ExpandableOverlay>
    </motion.div>
  );
};

export default AgentsPage;
