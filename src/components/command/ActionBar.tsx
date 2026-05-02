import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Bot, Server, ListTodo,
  Settings, User, Briefcase, Search, Sparkles,
  MessageCircle, FolderOpen, Bell, Send, ChevronDown, X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { agents } from "@/lib/mock-data";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Bot, label: "Agents", path: "/agents" },
  { icon: Server, label: "Infrastructure", path: "/infrastructure" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: FolderOpen, label: "Projects", path: "/projects" },
  { icon: User, label: "Personal", path: "/personal" },
  { icon: Briefcase, label: "Work", path: "/work" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const mockNotifications = [
  { id: "n1", icon: Bot, title: "Tamador completed task T-142", time: "2m", color: "text-glow-success" },
  { id: "n2", icon: Bell, title: "Project approval requested", time: "8m", color: "text-glow-warning" },
  { id: "n3", icon: Server, title: "Prometheus needs attention", time: "1h", color: "text-glow-danger" },
];

interface ActionBarProps {
  onOpenPalette: () => void;
}

type Mode = "idle" | "chat" | "notifications";

export function ActionBar({ onOpenPalette }: ActionBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [chatAgent, setChatAgent] = useState(agents[0]);
  const [chatInput, setChatInput] = useState("");
  const [chatMsgs, setChatMsgs] = useState<{ from: "me" | "agent"; text: string }[]>([
    { from: "agent", text: "Hi, what can I help you with?" },
  ]);
  const [agentPicker, setAgentPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ESC closes expanded modes
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("idle");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (mode === "chat") setTimeout(() => inputRef.current?.focus(), 200);
  }, [mode]);

  const sendMsg = () => {
    if (!chatInput.trim()) return;
    setChatMsgs((m) => [...m, { from: "me", text: chatInput }]);
    const t = chatInput;
    setChatInput("");
    setTimeout(() => {
      setChatMsgs((m) => [...m, { from: "agent", text: `Roger that — working on "${t.slice(0, 40)}".` }]);
    }, 700);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.2 }}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
    >
      <LayoutGroup>
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className={cn(
            "pointer-events-auto relative",
            "rounded-[28px] overflow-hidden",
            "bg-card/70 backdrop-blur-2xl",
            "border border-border/50",
            "shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.25),0_0_0_1px_hsl(var(--border)/0.3),inset_0_1px_0_0_hsl(0_0%_100%/0.06)]"
          )}
        >
          {/* Animated gradient outline */}
          <div
            className="absolute inset-0 rounded-[28px] pointer-events-none opacity-60"
            style={{
              background:
                "linear-gradient(120deg, transparent 30%, hsl(var(--primary) / 0.15) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 6s linear infinite",
            }}
          />

          {/* ===== EXPANDED PANELS ===== */}
          <AnimatePresence mode="wait">
            {mode === "chat" && (
              <motion.div
                key="chat"
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="w-[420px] max-w-[92vw] p-3">
                  {/* Agent header */}
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <button
                      onClick={() => setAgentPicker((p) => !p)}
                      className="flex items-center gap-2 group"
                    >
                      <div className="relative">
                        <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                          {chatAgent.name[0]}
                        </div>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-card",
                          chatAgent.status === "online" ? "bg-glow-success glow-dot-online" : "bg-muted-foreground"
                        )} />
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                          {chatAgent.name}
                          <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", agentPicker && "rotate-180")} />
                        </div>
                        <div className="text-[9px] mono text-muted-foreground">{chatAgent.role}</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setMode("idle")}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Agent picker */}
                  <AnimatePresence>
                    {agentPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -6, height: 0 }}
                        className="overflow-hidden mb-2"
                      >
                        <div className="grid grid-cols-5 gap-1 p-2 rounded-lg bg-secondary/30 border border-border/30">
                          {agents.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => { setChatAgent(a); setAgentPicker(false); }}
                              className={cn(
                                "flex flex-col items-center gap-1 p-1.5 rounded-md transition-all",
                                chatAgent.id === a.id ? "bg-primary/15 ring-1 ring-primary/40" : "hover:bg-secondary/50"
                              )}
                            >
                              <div className="h-6 w-6 rounded-full bg-gradient-primary flex items-center justify-center text-[9px] font-bold text-primary-foreground">
                                {a.name[0]}
                              </div>
                              <span className="text-[8px] mono text-muted-foreground">{a.name}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Messages */}
                  <div className="h-[200px] overflow-y-auto rounded-lg bg-secondary/20 border border-border/30 p-2.5 space-y-2 mb-2">
                    {chatMsgs.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}
                      >
                        <div className={cn(
                          "max-w-[80%] px-2.5 py-1.5 rounded-xl text-[11px] leading-snug",
                          m.from === "me"
                            ? "bg-primary/20 text-foreground border border-primary/30"
                            : "bg-card border border-border/40 text-foreground"
                        )}>
                          {m.text}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex items-center gap-1.5 rounded-lg bg-secondary/40 border border-border/40 px-2.5 py-1.5 focus-within:border-primary/50 transition-colors">
                    <Sparkles className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <input
                      ref={inputRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") sendMsg(); }}
                      placeholder={`Message ${chatAgent.name}...`}
                      className="flex-1 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/60 outline-none mono"
                    />
                    <button
                      onClick={sendMsg}
                      disabled={!chatInput.trim()}
                      className="p-1 rounded-md bg-primary/20 text-primary disabled:opacity-30 hover:bg-primary/30 transition-colors"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {mode === "notifications" && (
              <motion.div
                key="notif"
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="w-[340px] max-w-[92vw] p-3">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[11px] font-semibold text-foreground">Notifications</span>
                    <button onClick={() => setMode("idle")} className="p-1 rounded-md text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {mockNotifications.map((n, i) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2.5 p-2 rounded-lg bg-secondary/30 border border-border/30 hover:border-border/60 hover:bg-secondary/50 cursor-pointer transition-all"
                      >
                        <div className={cn("p-1.5 rounded-md bg-card/60", n.color)}>
                          <n.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-foreground truncate">{n.title}</div>
                          <div className="text-[9px] mono text-muted-foreground mt-0.5">{n.time} ago</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider when expanded */}
          {mode !== "idle" && <div className="h-px bg-border/30 mx-3" />}

          {/* ===== MAIN BAR ===== */}
          <div className="flex items-center gap-0.5 px-2 py-2 relative">
            {/* Logo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.08, rotate: 12 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  onClick={() => navigate("/")}
                  className="flex items-center justify-center w-9 h-9 rounded-2xl mr-1 relative group"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-90" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-primary blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                  <Sparkles className="h-4 w-4 text-primary-foreground relative z-10" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px] mono">OpenClaw</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-border/40 mx-1" />

            {/* Nav with magnification */}
            <div onMouseLeave={() => setHoveredIdx(null)} className="flex items-center gap-0.5">
              {navItems.map((item, idx) => {
                const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
                const dist = hoveredIdx !== null ? Math.abs(idx - hoveredIdx) : Infinity;
                const isHovered = dist === 0;
                const scale = dist === 0 ? 1.35 : dist === 1 ? 1.14 : dist === 2 ? 1.04 : 1;
                const yOff = dist === 0 ? -10 : dist === 1 ? -4 : dist === 2 ? -1 : 0;

                return (
                  <Tooltip key={item.path} delayDuration={150}>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => navigate(item.path)}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        whileTap={{ scale: 0.85, y: 2 }}
                        animate={{ scale, y: yOff }}
                        transition={{ type: "spring", stiffness: 500, damping: 14, mass: 0.6 }}
                        className={cn(
                          "relative flex items-center justify-center w-9 h-9 rounded-2xl transition-colors will-change-transform",
                          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {/* Hover glow background that follows the magnified item */}
                        <AnimatePresence>
                          {isHovered && !isActive && (
                            <motion.div
                              key="hover-bg"
                              initial={{ opacity: 0, scale: 0.6 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.6 }}
                              transition={{ type: "spring", stiffness: 500, damping: 28 }}
                              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/15 border border-primary/30 shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.4),inset_0_1px_0_0_hsl(0_0%_100%/0.1)]"
                            />
                          )}
                        </AnimatePresence>
                        {/* Reflective sheen on hover */}
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-x-1 top-0.5 h-1/2 rounded-t-2xl bg-gradient-to-b from-foreground/15 to-transparent pointer-events-none"
                          />
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="bar-active"
                            className="absolute inset-0 rounded-2xl bg-primary/15 border border-primary/30 shadow-[inset_0_0_12px_-2px_hsl(var(--primary)/0.4)]"
                            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                          />
                        )}
                        <item.icon className="h-4 w-4 relative z-10" />
                        {isActive && (
                          <motion.div
                            layoutId="bar-dot"
                            className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]"
                            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                          />
                        )}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px] mono">{item.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            <div className="w-px h-6 bg-border/40 mx-1.5" />

            {/* Utility cluster — recessed inset panel */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-background/70 border border-border/60 shadow-[inset_0_1px_3px_0_hsl(0_0%_0%/0.25)]">
              {/* Search */}
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.18, y: -3 }}
                    whileTap={{ scale: 0.85, y: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 14, mass: 0.6 }}
                    onClick={onOpenPalette}
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors will-change-transform"
                  >
                    <Search className="h-4 w-4" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] mono">
                  Search <kbd className="ml-1 text-[8px] px-1 py-0.5 rounded bg-secondary border border-border">⌘K</kbd>
                </TooltipContent>
              </Tooltip>

              {/* Notifications */}
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.18, y: -3 }}
                    whileTap={{ scale: 0.85, y: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 14, mass: 0.6 }}
                    onClick={() => setMode((m) => (m === "notifications" ? "idle" : "notifications"))}
                    className={cn(
                      "relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors will-change-transform",
                      mode === "notifications"
                        ? "text-primary bg-primary/15 ring-1 ring-primary/40"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )}
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-glow-warning glow-dot-warning" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] mono">Notifications</TooltipContent>
              </Tooltip>

              {/* Chat — primary CTA */}
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.92, y: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 14, mass: 0.6 }}
                    onClick={() => setMode((m) => (m === "chat" ? "idle" : "chat"))}
                    className={cn(
                      "relative flex items-center justify-center h-9 px-3 rounded-xl gap-1.5 overflow-hidden group will-change-transform",
                      mode === "chat" ? "text-primary-foreground" : "text-foreground hover:text-primary-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 transition-opacity duration-200",
                        mode === "chat" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}
                      style={{ background: "var(--gradient-primary)" }}
                    />
                    <div
                      className={cn(
                        "absolute inset-0 transition-opacity duration-200 bg-secondary/40",
                        mode === "chat" ? "opacity-0" : "opacity-100 group-hover:opacity-0"
                      )}
                    />
                    <MessageCircle className="h-4 w-4 relative z-10" />
                    <span className="text-[11px] mono font-medium relative z-10">Chat</span>
                    {mode !== "chat" && (
                      <motion.span
                        className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary z-10"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] mono">Talk to your agents</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </motion.div>
      </LayoutGroup>
    </motion.div>
  );
}
