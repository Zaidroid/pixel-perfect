import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Bot, Server, ListTodo,
  Settings, User, Briefcase, Search, Sparkles,
  MessageCircle, FolderOpen, Bell, Send, ChevronDown, X,
} from "lucide-react";
import { agents } from "@/lib/mock-data";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", hint: "Overview" },
  { icon: Bot, label: "Agents", path: "/agents", hint: "Fleet" },
  { icon: Server, label: "Infrastructure", path: "/infrastructure", hint: "Systems" },
  { icon: ListTodo, label: "Tasks", path: "/tasks", hint: "Queue" },
  { icon: FolderOpen, label: "Projects", path: "/projects", hint: "Workspaces" },
  { icon: User, label: "Personal", path: "/personal", hint: "You" },
  { icon: Briefcase, label: "Work", path: "/work", hint: "Org" },
  { icon: Settings, label: "Settings", path: "/settings", hint: "Config" },
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

/* ──────────────────────────────────────────────────────────
   Liquid nav item — morphs to reveal label on hover
   ────────────────────────────────────────────────────────── */
function NavItem({
  item,
  isActive,
  isHovered,
  onHover,
  onClick,
}: {
  item: typeof navItems[number];
  isActive: boolean;
  isHovered: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  const Icon = item.icon;
  const expanded = isHovered || isActive;

  return (
    <motion.button
      layout
      onMouseEnter={onHover}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ layout: { type: "spring", stiffness: 500, damping: 32 } }}
      className={cn(
        "relative flex items-center h-10 rounded-full overflow-hidden",
        "transition-colors will-change-transform",
        expanded ? "px-3 gap-2" : "px-0 w-10 justify-center",
        isActive
          ? "text-primary-foreground"
          : isHovered
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {/* Active pill — gradient */}
      {isActive && (
        <motion.div
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-full"
          style={{ background: "var(--gradient-primary)" }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      {/* Hover pill — neutral wash, shows on the actual hovered item */}
      {!isActive && isHovered && (
        <motion.div
          layoutId="nav-hover-pill"
          className="absolute inset-0 rounded-full bg-secondary/70 ring-1 ring-border/60 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.08)]"
          transition={{ type: "spring", stiffness: 500, damping: 36 }}
        />
      )}
      {isActive && (
        <div className="absolute inset-0 rounded-full opacity-60 blur-md -z-10" style={{ background: "var(--gradient-primary)" }} />
      )}

      <Icon className={cn("relative z-10 shrink-0 transition-all", expanded ? "h-4 w-4" : "h-[18px] w-[18px]")} />

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.span
            key="label"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
            className="relative z-10 overflow-hidden whitespace-nowrap text-[11px] font-medium mono tracking-tight"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ──────────────────────────────────────────────────────────
   Main bar
   ────────────────────────────────────────────────────────── */
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
  const [barHovered, setBarHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Spotlight follows mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 200, damping: 30 });
  const smy = useSpring(my, { stiffness: 200, damping: 30 });
  const spotlight = useTransform(
    [smx, smy],
    ([x, y]) =>
      `radial-gradient(180px circle at ${x}px ${y}px, hsl(var(--primary) / 0.18), transparent 65%)`
  );

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setMode("idle"); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (mode === "chat") setTimeout(() => inputRef.current?.focus(), 250);
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

  const activeIdx = navItems.findIndex((n) =>
    n.path === "/" ? location.pathname === "/" : location.pathname.startsWith(n.path)
  );
  const currentLabel =
    hoveredIdx !== null ? navItems[hoveredIdx].hint
    : activeIdx >= 0 ? navItems[activeIdx].hint
    : "Mission Control";

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.2 }}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
    >
      {/* Floating context label above bar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLabel}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="text-center mb-2 pointer-events-none"
        >
          <span className="text-[9px] mono uppercase tracking-[0.25em] text-muted-foreground/60">
            {currentLabel}
          </span>
        </motion.div>
      </AnimatePresence>

      <LayoutGroup id="actionbar">
        <motion.div
          layout
          ref={barRef}
          onMouseEnter={() => setBarHovered(true)}
          onMouseLeave={() => { setBarHovered(false); setHoveredIdx(null); }}
          onMouseMove={(e) => {
            const r = barRef.current?.getBoundingClientRect();
            if (!r) return;
            mx.set(e.clientX - r.left);
            my.set(e.clientY - r.top);
          }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className={cn(
            "pointer-events-auto relative",
            "rounded-[26px]",
            "bg-card/75 backdrop-blur-2xl",
            "border border-border/50",
            "shadow-[0_24px_70px_-20px_hsl(var(--primary)/0.35),0_0_0_1px_hsl(var(--border)/0.4),inset_0_1px_0_0_hsl(0_0%_100%/0.07)]"
          )}
          style={{
            // Bar physically grows when hovered to feel reactive
            transform: barHovered ? "translateY(-2px)" : "translateY(0)",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Spotlight that follows cursor */}
          <motion.div
            className="absolute inset-0 rounded-[26px] pointer-events-none opacity-0 transition-opacity duration-300"
            style={{ background: spotlight, opacity: barHovered ? 1 : 0 }}
          />
          {/* Shimmer outline */}
          <div
            className="absolute inset-0 rounded-[26px] pointer-events-none opacity-50"
            style={{
              background:
                "linear-gradient(120deg, transparent 30%, hsl(var(--primary) / 0.18) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 7s linear infinite",
              maskImage: "linear-gradient(black, black)",
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
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
                className="overflow-hidden"
              >
                <div className="w-[420px] max-w-[92vw] p-3">
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <button onClick={() => setAgentPicker((p) => !p)} className="flex items-center gap-2 group">
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
                    <button onClick={() => setMode("idle")} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

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

                  <div className="h-[200px] overflow-y-auto rounded-lg bg-secondary/20 border border-border/30 p-2.5 space-y-2 mb-2">
                    {chatMsgs.map((m, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
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
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
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

          {mode !== "idle" && <div className="h-px bg-border/30 mx-3" />}

          {/* ===== MAIN BAR ===== */}
          <motion.div layout className="flex items-center gap-1 px-2 py-1.5 relative">
            {/* Logo */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 12 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
              onClick={() => navigate("/")}
              className="flex items-center justify-center w-10 h-10 rounded-2xl mr-0.5 relative group shrink-0"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-90" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-primary blur-md opacity-60 group-hover:opacity-90 transition-opacity" />
              <Sparkles className="h-4 w-4 text-primary-foreground relative z-10" />
            </motion.button>

            <div className="w-px h-6 bg-border/40 mx-0.5" />

            {/* Liquid nav — items expand inline on hover */}
            <div onMouseLeave={() => setHoveredIdx(null)} className="flex items-center gap-0.5">
              {navItems.map((item, idx) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={idx === activeIdx}
                  isHovered={hoveredIdx === idx}
                  onHover={() => setHoveredIdx(idx)}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </div>

            <div className="w-px h-6 bg-border/40 mx-1" />

            {/* Utility cluster — recessed */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-background/70 border border-border/60 shadow-[inset_0_1px_3px_0_hsl(0_0%_0%/0.25)]">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 14 }}
                onClick={onOpenPalette}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                title="Search (⌘K)"
              >
                <Search className="h-4 w-4" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 14 }}
                onClick={() => setMode((m) => (m === "notifications" ? "idle" : "notifications"))}
                className={cn(
                  "relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors",
                  mode === "notifications"
                    ? "text-primary bg-primary/15 ring-1 ring-primary/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-glow-warning glow-dot-warning" />
              </motion.button>

              {/* Chat — primary CTA */}
              <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 500, damping: 14 }}
                onClick={() => setMode((m) => (m === "chat" ? "idle" : "chat"))}
                className={cn(
                  "relative flex items-center justify-center h-9 px-3 rounded-xl gap-1.5 overflow-hidden group",
                  mode === "chat" ? "text-primary-foreground" : "text-foreground hover:text-primary-foreground"
                )}
                title="Talk to your agents"
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
            </div>
          </motion.div>
        </motion.div>
      </LayoutGroup>
    </motion.div>
  );
}
