import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Terminal, ChevronRight, X, Plus, Maximize2, Minimize2 } from "lucide-react";

interface TermLine {
  type: "input" | "output" | "error" | "system";
  text: string;
  timestamp: string;
}

const mockResponses: Record<string, string[]> = {
  help: [
    "Available commands:",
    "  status       — Show system status",
    "  agents       — List active agents",
    "  services     — List running services",
    "  logs <name>  — Show recent logs for a service",
    "  restart <id> — Restart a service",
    "  clear        — Clear terminal",
    "  ping         — Test connectivity",
    "  uptime       — Show system uptime",
  ],
  status: [
    "┌─────────────────────────────────┐",
    "│  SYSTEM STATUS                  │",
    "├─────────────┬───────────────────┤",
    "│  CPU        │  24.5%            │",
    "│  Memory     │  67.3%            │",
    "│  Disk       │  42.8%            │",
    "│  Swap       │  15.2%            │",
    "│  Network In │  12.4 MB/s        │",
    "│  Uptime     │  14d 6h 23m       │",
    "└─────────────┴───────────────────┘",
  ],
  agents: [
    "AGENT FLEET — 3 online, 1 idle, 1 offline",
    "",
    "  ● Fawwaz     Dispatcher   online   GPT-4o",
    "  ● Tamador    Developer    online   Claude 3.5 Sonnet",
    "  ○ Ihab       Operations   idle     GPT-4o-mini",
    "  ● Nour       Analyst      online   Claude 3.5 Haiku",
    "  ✕ Zaid       Researcher   offline  Llama 3.1 70B",
  ],
  services: [
    "SERVICES — 6 running, 1 stopped, 1 error",
    "",
    "  ▶ Command Center   :3005    CPU 4.2%   MEM 312MB",
    "  ▶ Ollama LLM       :11434   CPU 18.5%  MEM 4096MB",
    "  ▶ n8n Workflows    :5678    CPU 2.1%   MEM 256MB",
    "  ▶ PostgreSQL       :5432    CPU 1.8%   MEM 512MB",
    "  ▶ Redis Cache      :6379    CPU 0.3%   MEM 64MB",
    "  ▶ Obsidian Sync    system   CPU 0.5%   MEM 128MB",
    "  ■ Grafana          :3000    STOPPED",
    "  ✕ Prometheus       :9090    ERROR",
  ],
  ping: [
    "PING openclaw-server (192.168.0.118): 56 data bytes",
    "64 bytes: icmp_seq=0 ttl=64 time=0.42 ms",
    "64 bytes: icmp_seq=1 ttl=64 time=0.38 ms",
    "64 bytes: icmp_seq=2 ttl=64 time=0.41 ms",
    "",
    "--- openclaw-server ping statistics ---",
    "3 packets transmitted, 3 received, 0% packet loss",
    "round-trip min/avg/max = 0.38/0.40/0.42 ms",
  ],
  uptime: [
    "14 days, 6 hours, 23 minutes, 12 seconds",
    "Load average: 0.82, 0.95, 1.02",
  ],
};

function getTimestamp() {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

interface Tab {
  id: string;
  name: string;
  history: TermLine[];
}

const TerminalPage = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "main",
      name: "main",
      history: [
        { type: "system", text: "OpenClaw Terminal v1.0 — Type 'help' for available commands", timestamp: getTimestamp() },
      ],
    },
  ]);
  const [activeTab, setActiveTab] = useState("main");
  const [input, setInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentTab?.history.length]);

  const pushLine = (tabId: string, line: TermLine) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, history: [...t.history, line] } : t))
    );
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const ts = getTimestamp();

    pushLine(activeTab, { type: "input", text: cmd, timestamp: ts });

    if (trimmed === "clear") {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab
            ? { ...t, history: [{ type: "system", text: "Terminal cleared", timestamp: ts }] }
            : t
        )
      );
      return;
    }

    const baseCmd = trimmed.split(" ")[0];
    const response = mockResponses[baseCmd];

    if (response) {
      setTimeout(() => {
        response.forEach((line, i) => {
          setTimeout(() => {
            pushLine(activeTab, { type: "output", text: line, timestamp: ts });
          }, i * 30);
        });
      }, 100);
    } else if (trimmed.startsWith("logs")) {
      const svc = trimmed.split(" ")[1] || "unknown";
      setTimeout(() => {
        [
          `Fetching logs for '${svc}'...`,
          `[INFO]  Service started successfully`,
          `[INFO]  Listening on configured port`,
          `[WARN]  High memory usage detected`,
          `[INFO]  Healthcheck passed`,
        ].forEach((line, i) => {
          setTimeout(() => pushLine(activeTab, { type: "output", text: line, timestamp: ts }), i * 40);
        });
      }, 100);
    } else if (trimmed.startsWith("restart")) {
      const svc = trimmed.split(" ")[1] || "unknown";
      setTimeout(() => {
        pushLine(activeTab, { type: "output", text: `Restarting service '${svc}'...`, timestamp: ts });
        setTimeout(() => pushLine(activeTab, { type: "output", text: `Service '${svc}' restarted successfully.`, timestamp: ts }), 800);
      }, 100);
    } else {
      setTimeout(() => {
        pushLine(activeTab, { type: "error", text: `command not found: ${trimmed}`, timestamp: ts });
      }, 50);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleCommand(input);
    setInput("");
  };

  const addTab = () => {
    const id = `tab-${Date.now()}`;
    const name = `tab-${tabs.length + 1}`;
    setTabs((prev) => [
      ...prev,
      { id, name, history: [{ type: "system", text: `New session '${name}' started`, timestamp: getTimestamp() }] },
    ]);
    setActiveTab(id);
  };

  const closeTab = (id: string) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id) setActiveTab(newTabs[0].id);
  };

  return (
    <div className={cn("max-w-[1400px] mx-auto", isFullscreen && "fixed inset-0 z-50 p-0 max-w-none")}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex flex-col", isFullscreen ? "h-full" : "h-[calc(100vh-8rem)]")}
      >
        {/* Header */}
        {!isFullscreen && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground glow-text">Terminal</h1>
              <p className="text-sm text-muted-foreground mono mt-1">System command interface</p>
            </div>
          </div>
        )}

        {/* Terminal Window */}
        <div className={cn("glass-panel flex flex-col overflow-hidden", isFullscreen ? "flex-1 rounded-none" : "flex-1 rounded-lg")}>
          {/* Tab bar */}
          <div className="flex items-center bg-secondary/30 border-b border-border/30 px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-[11px] mono border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary bg-background/40"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Terminal className="h-3 w-3" />
                {tab.name}
                {tabs.length > 1 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                    className="ml-1 hover:text-glow-danger transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            ))}
            <button onClick={addTab} className="p-2 text-muted-foreground/50 hover:text-foreground transition-colors">
              <Plus className="h-3 w-3" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="ml-auto p-2 text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Output */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-0.5" onClick={() => inputRef.current?.focus()}>
            {currentTab.history.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2"
              >
                <span className="text-[10px] mono text-muted-foreground/30 shrink-0 w-16 select-none">{line.timestamp}</span>
                {line.type === "input" ? (
                  <div className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-xs mono text-primary">{line.text}</span>
                  </div>
                ) : line.type === "error" ? (
                  <span className="text-xs mono text-glow-danger">{line.text}</span>
                ) : line.type === "system" ? (
                  <span className="text-xs mono text-muted-foreground/60 italic">{line.text}</span>
                ) : (
                  <span className="text-xs mono text-foreground/80 whitespace-pre">{line.text}</span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border/30 bg-secondary/10">
            <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter command..."
              autoFocus
              className="flex-1 text-xs mono bg-transparent text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
            />
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TerminalPage;
