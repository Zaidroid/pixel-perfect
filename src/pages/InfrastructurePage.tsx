import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { services } from "@/lib/mock-data";
import { ServiceCard } from "@/components/command/ServiceCard";
import { ExpandableOverlay } from "@/components/command/ExpandableOverlay";
import {
  Server, Activity, Terminal, Cpu, MemoryStick, HardDrive, Wifi,
  ArrowUp, Gauge, ChevronRight, X, Plus, Maximize2, Minimize2, RefreshCw,
} from "lucide-react";

// ── Sub-tab types ──
type SubTab = "services" | "monitoring" | "terminal";

// ── Monitoring helpers ──
function generateSeries(points: number, min: number, max: number) {
  const data: number[] = [];
  let val = min + Math.random() * (max - min);
  for (let i = 0; i < points; i++) {
    val += (Math.random() - 0.5) * (max - min) * 0.15;
    val = Math.max(min, Math.min(max, val));
    data.push(Math.round(val * 10) / 10);
  }
  return data;
}

function Sparkline({ data, max, color, height = 50 }: { data: number[]; max: number; color: string; height?: number }) {
  const w = 100;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - (v / max) * height}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className={color} stopOpacity="0.25" />
          <stop offset="100%" className={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#sg-${color})`} points={`0,${height} ${pts} ${w},${height}`} opacity="0.5" />
      <polyline fill="none" stroke="currentColor" className={color} strokeWidth="1.5" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

interface MetricSeries {
  label: string; icon: React.ElementType; unit: string; color: string;
  current: number; data: number[]; max: number;
}

// ── Terminal types ──
interface TermLine { type: "input" | "output" | "error" | "system"; text: string; timestamp: string; }
interface Tab { id: string; name: string; history: TermLine[]; }

const mockResponses: Record<string, string[]> = {
  help: ["Available: status, agents, services, logs <name>, restart <id>, clear, ping, uptime"],
  status: ["CPU: 24.5% | MEM: 67.3% | Disk: 42.8% | Uptime: 14d 6h"],
  agents: ["● Fawwaz (online) ● Tamador (online) ○ Ihab (idle) ● Nour (online) ✕ Zaid (offline)"],
  services: ["▶ Cmd Center :3005 | ▶ Ollama :11434 | ▶ n8n :5678 | ▶ PostgreSQL :5432 | ■ Grafana | ✕ Prometheus"],
  ping: ["PING openclaw (192.168.0.118): 3 packets, 0% loss, avg 0.40ms"],
  uptime: ["14 days, 6 hours, 23 minutes | Load: 0.82, 0.95, 1.02"],
};
function getTs() { return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }); }

// ── Services Sub ──
function ServicesTab() {
  const running = services.filter(s => s.status === "running").length;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground mono">{running}/{services.length} running</span>
        <div className="h-1.5 w-1.5 rounded-full bg-glow-success animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {services.map((service, i) => <ServiceCard key={service.id} service={service} index={i} />)}
      </div>
    </div>
  );
}

// ── Monitoring Sub ──
function MonitoringTab() {
  const [tick, setTick] = useState(0);
  const [expanded, setExpanded] = useState<MetricSeries | null>(null);

  const metrics: MetricSeries[] = [
    { label: "CPU", icon: Cpu, unit: "%", color: "text-primary", current: 24.5 + Math.sin(tick * 0.3) * 5, data: generateSeries(40, 10, 60), max: 100 },
    { label: "Memory", icon: MemoryStick, unit: "%", color: "text-glow-warning", current: 67.3 + Math.cos(tick * 0.2) * 3, data: generateSeries(40, 50, 85), max: 100 },
    { label: "Disk I/O", icon: HardDrive, unit: "MB/s", color: "text-primary", current: 12.4 + Math.sin(tick * 0.5) * 4, data: generateSeries(40, 2, 30), max: 50 },
    { label: "Net In", icon: Wifi, unit: "MB/s", color: "text-glow-success", current: 8.2 + Math.random() * 2, data: generateSeries(40, 2, 20), max: 30 },
    { label: "Net Out", icon: ArrowUp, unit: "MB/s", color: "text-glow-success", current: 3.8 + Math.random(), data: generateSeries(40, 1, 10), max: 15 },
    { label: "Swap", icon: Gauge, unit: "%", color: "text-muted-foreground", current: 15.2 + Math.sin(tick * 0.1) * 2, data: generateSeries(40, 5, 30), max: 100 },
  ];

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 2000); return () => clearInterval(iv); }, []);

  const processData = [
    { name: "ollama", cpu: 18.5, mem: "4.0 GB", pid: 1842 },
    { name: "node (n8n)", cpu: 2.1, mem: "256 MB", pid: 2103 },
    { name: "postgres", cpu: 1.8, mem: "512 MB", pid: 1456 },
    { name: "redis-server", cpu: 0.3, mem: "64 MB", pid: 1789 },
    { name: "cmd-center", cpu: 4.2, mem: "312 MB", pid: 2201 },
  ];

  const alerts = [
    { severity: "warning", msg: "Redis memory usage at 85% threshold", time: "12m ago" },
    { severity: "error", msg: "Prometheus container exited (code 137)", time: "1h ago" },
    { severity: "info", msg: "Agent Zaid response time exceeding 3s", time: "4h ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-glow-success animate-pulse" />
        <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">Live</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-panel-hover p-3 cursor-pointer" onClick={() => setExpanded(m)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <m.icon className={cn("h-3.5 w-3.5", m.color)} />
                <span className="text-[11px] font-medium text-foreground">{m.label}</span>
              </div>
              <span className={cn("text-sm font-bold mono", m.color)}>{m.current.toFixed(1)}{m.unit}</span>
            </div>
            <Sparkline data={m.data} max={m.max} color={m.color} height={40} />
          </motion.div>
        ))}
      </div>

      {/* Processes */}
      <div className="glass-panel overflow-hidden">
        <div className="px-3 py-2 border-b border-border/20 flex items-center gap-2">
          <Activity className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">Top Processes</span>
        </div>
        <table className="w-full text-xs mono">
          <thead>
            <tr className="border-b border-border/15">
              <th className="text-left p-2.5 text-[9px] text-muted-foreground/60 uppercase font-medium">Name</th>
              <th className="text-right p-2.5 text-[9px] text-muted-foreground/60 uppercase font-medium">PID</th>
              <th className="text-right p-2.5 text-[9px] text-muted-foreground/60 uppercase font-medium">CPU</th>
              <th className="text-right p-2.5 text-[9px] text-muted-foreground/60 uppercase font-medium">Mem</th>
            </tr>
          </thead>
          <tbody>
            {processData.sort((a, b) => b.cpu - a.cpu).map(p => (
              <tr key={p.pid} className="border-b border-border/5 hover:bg-secondary/10 transition-colors">
                <td className="p-2.5 text-foreground/80">{p.name}</td>
                <td className="p-2.5 text-right text-muted-foreground/50">{p.pid}</td>
                <td className={cn("p-2.5 text-right", p.cpu > 10 ? "text-glow-warning" : "text-muted-foreground/70")}>{p.cpu}%</td>
                <td className="p-2.5 text-right text-muted-foreground/50">{p.mem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerts */}
      <div className="space-y-1.5">
        {alerts.map((a, i) => (
          <div key={i} className={cn(
            "glass-panel p-2.5 flex items-center gap-3 border-l-2",
            a.severity === "error" ? "border-l-glow-danger" : a.severity === "warning" ? "border-l-glow-warning" : "border-l-primary"
          )}>
            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0",
              a.severity === "error" ? "bg-glow-danger" : a.severity === "warning" ? "bg-glow-warning" : "bg-primary"
            )} />
            <span className="text-[11px] text-foreground/80 flex-1">{a.msg}</span>
            <span className="text-[9px] mono text-muted-foreground/30 shrink-0">{a.time}</span>
          </div>
        ))}
      </div>

      <ExpandableOverlay isOpen={!!expanded} onClose={() => setExpanded(null)} title={expanded?.label ?? ""}>
        {expanded && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <expanded.icon className={cn("h-6 w-6", expanded.color)} />
              <span className={cn("text-3xl font-bold mono", expanded.color)}>{expanded.current.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">{expanded.unit}</span>
            </div>
            <Sparkline data={expanded.data} max={expanded.max} color={expanded.color} height={100} />
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Avg", value: (expanded.data.reduce((a, b) => a + b, 0) / expanded.data.length).toFixed(1) },
                { label: "Peak", value: Math.max(...expanded.data).toFixed(1) },
                { label: "Low", value: Math.min(...expanded.data).toFixed(1) },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-lg bg-secondary/20 border border-border/15 text-center">
                  <p className="text-[9px] mono text-muted-foreground uppercase">{s.label}</p>
                  <p className="text-lg font-bold text-foreground mono">{s.value}{expanded.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </ExpandableOverlay>
    </div>
  );
}

// ── Terminal Sub ──
function TerminalTab() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "main", name: "main", history: [{ type: "system", text: "OpenClaw Terminal v1.0 — Type 'help'", timestamp: getTs() }] },
  ]);
  const [activeTab, setActiveTab] = useState("main");
  const [input, setInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentTab = tabs.find(t => t.id === activeTab)!;

  useEffect(() => {
    scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight);
  }, [currentTab?.history.length]);

  const pushLine = (tabId: string, line: TermLine) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, history: [...t.history, line] } : t));
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const ts = getTs();
    pushLine(activeTab, { type: "input", text: cmd, timestamp: ts });
    if (trimmed === "clear") {
      setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, history: [{ type: "system", text: "Cleared", timestamp: ts }] } : t));
      return;
    }
    const base = trimmed.split(" ")[0];
    const resp = mockResponses[base];
    if (resp) {
      setTimeout(() => resp.forEach((line, i) => setTimeout(() => pushLine(activeTab, { type: "output", text: line, timestamp: ts }), i * 20)), 50);
    } else {
      setTimeout(() => pushLine(activeTab, { type: "error", text: `command not found: ${trimmed}`, timestamp: ts }), 30);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!input.trim()) return; handleCommand(input); setInput(""); };
  const addTab = () => { const id = `t-${Date.now()}`; const name = `tab-${tabs.length + 1}`; setTabs(p => [...p, { id, name, history: [{ type: "system", text: `Session '${name}' started`, timestamp: getTs() }] }]); setActiveTab(id); };
  const closeTab = (id: string) => { if (tabs.length <= 1) return; const nt = tabs.filter(t => t.id !== id); setTabs(nt); if (activeTab === id) setActiveTab(nt[0].id); };

  return (
    <div className={cn(isFullscreen && "fixed inset-0 z-50 bg-background")}>
      <div className={cn("glass-panel flex flex-col overflow-hidden", isFullscreen ? "h-full rounded-none" : "h-[500px]")}>
        <div className="flex items-center bg-secondary/20 border-b border-border/20 px-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("flex items-center gap-1.5 px-3 py-2 text-[10px] mono border-b-2 transition-colors",
                activeTab === tab.id ? "border-primary text-primary bg-background/30" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              <Terminal className="h-2.5 w-2.5" />{tab.name}
              {tabs.length > 1 && <span onClick={e => { e.stopPropagation(); closeTab(tab.id); }} className="ml-1 hover:text-glow-danger"><X className="h-2 w-2" /></span>}
            </button>
          ))}
          <button onClick={addTab} className="p-2 text-muted-foreground/40 hover:text-foreground"><Plus className="h-2.5 w-2.5" /></button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="ml-auto p-2 text-muted-foreground/40 hover:text-foreground">
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-0.5" onClick={() => inputRef.current?.focus()}>
          {currentTab.history.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-[9px] mono text-muted-foreground/20 shrink-0 w-14 select-none">{line.timestamp}</span>
              {line.type === "input" ? (
                <div className="flex items-center gap-1"><ChevronRight className="h-2.5 w-2.5 text-primary" /><span className="text-[11px] mono text-primary">{line.text}</span></div>
              ) : line.type === "error" ? (
                <span className="text-[11px] mono text-glow-danger">{line.text}</span>
              ) : line.type === "system" ? (
                <span className="text-[11px] mono text-muted-foreground/40 italic">{line.text}</span>
              ) : (
                <span className="text-[11px] mono text-foreground/70 whitespace-pre">{line.text}</span>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2.5 border-t border-border/20 bg-secondary/5">
          <ChevronRight className="h-3 w-3 text-primary shrink-0" />
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Enter command..." autoFocus
            className="flex-1 text-[11px] mono bg-transparent text-foreground placeholder:text-muted-foreground/25 focus:outline-none" />
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──
const subTabs: { id: SubTab; label: string; icon: React.ElementType }[] = [
  { id: "services", label: "Services", icon: Server },
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "terminal", label: "Terminal", icon: Terminal },
];

const InfrastructurePage = () => {
  const [activeTab, setActiveTab] = useState<SubTab>("services");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Infrastructure</h1>
          <p className="text-xs text-muted-foreground mono mt-1">Services, monitoring, and terminal access</p>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/15 border border-border/15 w-fit">
        {subTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2 text-[11px] mono rounded-lg transition-all duration-200",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}>
            {activeTab === tab.id && (
              <motion.div layoutId="infra-tab" className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} />
            )}
            <tab.icon className="h-3 w-3 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {activeTab === "services" && <ServicesTab />}
          {activeTab === "monitoring" && <MonitoringTab />}
          {activeTab === "terminal" && <TerminalTab />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default InfrastructurePage;
