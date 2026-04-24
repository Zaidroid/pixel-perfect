import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { agents } from "@/lib/mock-data";
import type { Agent } from "@/lib/mock-data";
import { Activity, Radio, Zap, GitBranch, Filter } from "lucide-react";

type InteractionType = "task" | "data" | "query" | "response";

interface Interaction {
  id: string;
  from: string;
  to: string;
  type: InteractionType;
  label: string;
  timestamp: string;
  ageMs: number;
}

const seedInteractions: Omit<Interaction, "id" | "ageMs">[] = [
  { from: "fawwaz",  to: "tamador", type: "task",     label: "Dispatched build T-143",      timestamp: "now" },
  { from: "fawwaz",  to: "nour",    type: "task",     label: "Assigned analysis R-090",     timestamp: "12s" },
  { from: "tamador", to: "ihab",    type: "data",     label: "Deploy request v2.1.4",       timestamp: "45s" },
  { from: "nour",    to: "fawwaz",  type: "response", label: "Q1 metrics report ready",     timestamp: "1m" },
  { from: "ihab",    to: "tamador", type: "response", label: "Build #847 passed",           timestamp: "2m" },
  { from: "fawwaz",  to: "zaid",    type: "query",    label: "Research competitor APIs",    timestamp: "3m" },
  { from: "zaid",    to: "nour",    type: "data",     label: "Pricing dataset transfer",    timestamp: "5m" },
  { from: "tamador", to: "fawwaz",  type: "response", label: "PR #312 merged",              timestamp: "8m" },
  { from: "nour",    to: "ihab",    type: "query",    label: "Cluster capacity check",      timestamp: "11m" },
  { from: "ihab",    to: "zaid",    type: "task",     label: "Index rebuild scheduled",     timestamp: "14m" },
];

const typeConfig: Record<InteractionType, { color: string; label: string; icon: typeof Zap }> = {
  task:     { color: "var(--glow-primary)", label: "Task",     icon: Zap },
  data:     { color: "var(--glow-success)", label: "Data",     icon: GitBranch },
  query:    { color: "var(--glow-warning)", label: "Query",    icon: Radio },
  response: { color: "var(--glow-accent)",  label: "Response", icon: Activity },
};

const statusRing: Record<string, string> = {
  online:  "var(--glow-success)",
  idle:    "var(--glow-warning)",
  error:   "var(--glow-danger)",
  offline: "var(--muted-foreground)",
};

/* ──────────────────────────────────────────────────────────
   Constellation node (agent orb on the orbit)
   ────────────────────────────────────────────────────────── */
function AgentOrbit({
  agent, pos, isHovered, isDimmed, isFocused,
  pulseStrength, onHover, onLeave, onClick,
}: {
  agent: Agent;
  pos: { x: number; y: number };
  isHovered: boolean;
  isDimmed: boolean;
  isFocused: boolean;
  pulseStrength: number;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const r = isHovered || isFocused ? 24 : 19;
  const ring = statusRing[agent.status];
  const isAlive = agent.status === "online" || agent.status === "idle";

  return (
    <g
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ cursor: "pointer", opacity: isDimmed ? 0.18 : 1, transition: "opacity 0.3s" }}
    >
      {/* Outer ambient halo */}
      {isAlive && (
        <circle
          cx={pos.x} cy={pos.y} r={r + 14}
          fill="none"
          stroke={`hsl(${ring} / 0.15)`}
          strokeWidth="1"
        />
      )}
      {/* Reactive pulse — grows when agent is communicating */}
      {pulseStrength > 0 && (
        <circle
          cx={pos.x} cy={pos.y}
          r={r + 8 + pulseStrength * 12}
          fill="none"
          stroke={`hsl(var(--primary) / ${0.4 - pulseStrength * 0.3})`}
          strokeWidth="1.5"
          style={{ transition: "all 0.6s ease-out" }}
        />
      )}
      {/* Focus ring */}
      {(isHovered || isFocused) && (
        <circle
          cx={pos.x} cy={pos.y} r={r + 6}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.7"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${pos.x} ${pos.y}`}
            to={`360 ${pos.x} ${pos.y}`}
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      {/* Orb body — gradient sphere */}
      <defs>
        <radialGradient id={`orb-${agent.id}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor={`hsl(${ring} / 0.9)`} />
          <stop offset="60%" stopColor="hsl(var(--card))" />
          <stop offset="100%" stopColor="hsl(var(--background))" />
        </radialGradient>
      </defs>
      <circle
        cx={pos.x} cy={pos.y} r={r}
        fill={`url(#orb-${agent.id})`}
        stroke={`hsl(${ring} / ${isHovered || isFocused ? 0.9 : 0.45})`}
        strokeWidth={isHovered || isFocused ? 1.5 : 1}
        style={{ transition: "all 0.25s" }}
      />
      {/* Inner highlight */}
      <circle cx={pos.x - r * 0.3} cy={pos.y - r * 0.3} r={r * 0.25}
        fill="hsl(0 0% 100% / 0.2)" />
      {/* Initial */}
      <text
        x={pos.x} y={pos.y + 1}
        textAnchor="middle" dominantBaseline="central"
        fill="hsl(var(--foreground))"
        fontSize={isHovered || isFocused ? 13 : 11}
        fontWeight="700"
        fontFamily="'Space Grotesk', sans-serif"
        style={{ transition: "font-size 0.2s", pointerEvents: "none" }}
      >
        {agent.name[0]}
      </text>
      {/* Name */}
      <text
        x={pos.x} y={pos.y + r + 14}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fontSize="9"
        fontWeight="600"
        fontFamily="'JetBrains Mono', monospace"
        opacity={isHovered || isFocused ? 1 : 0.65}
        style={{ transition: "opacity 0.2s", pointerEvents: "none" }}
      >
        {agent.name}
      </text>
      {(isHovered || isFocused) && (
        <text
          x={pos.x} y={pos.y + r + 25}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize="7.5"
          fontFamily="'JetBrains Mono', monospace"
          style={{ pointerEvents: "none" }}
        >
          {agent.role}
        </text>
      )}
      {/* Status dot */}
      <circle
        cx={pos.x + r * 0.7} cy={pos.y - r * 0.7} r="3"
        fill={`hsl(${ring})`}
        stroke="hsl(var(--card))"
        strokeWidth="1"
      />
    </g>
  );
}

/* ──────────────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────────────── */
export function AgentNetworkGraph() {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [focusedAgent, setFocusedAgent] = useState<string | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<InteractionType>>(
    new Set(["task", "data", "query", "response"])
  );
  const [interactions, setInteractions] = useState<Interaction[]>(() =>
    seedInteractions.map((it, i) => ({ ...it, id: `seed-${i}`, ageMs: i * 3000 }))
  );
  const [livePulses, setLivePulses] = useState<Record<string, number>>({});
  const tickRef = useRef(0);

  // Simulate new interactions arriving in real-time
  useEffect(() => {
    const iv = setInterval(() => {
      tickRef.current += 1;
      const types: InteractionType[] = ["task", "data", "query", "response"];
      const a = agents[Math.floor(Math.random() * agents.length)];
      let b = agents[Math.floor(Math.random() * agents.length)];
      while (b.id === a.id) b = agents[Math.floor(Math.random() * agents.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const labels: Record<InteractionType, string[]> = {
        task: ["Dispatched op", "Queued job", "Assigned ticket", "Triggered run"],
        data: ["Streamed payload", "Synced index", "Pushed snapshot", "Logged metric"],
        query: ["Asked status", "Requested context", "Polled inventory", "Pinged health"],
        response: ["Delivered result", "Acknowledged", "Returned report", "Replied OK"],
      };
      const label = `${labels[type][Math.floor(Math.random() * 4)]} #${tickRef.current.toString().padStart(3, "0")}`;
      const newInter: Interaction = {
        id: `live-${tickRef.current}`,
        from: a.id, to: b.id, type, label,
        timestamp: "now", ageMs: 0,
      };
      setInteractions((prev) => [newInter, ...prev.map((p) => ({ ...p, ageMs: p.ageMs + 4000 }))].slice(0, 14));

      // Trigger pulse animation
      setLivePulses((p) => ({ ...p, [a.id]: 1, [b.id]: 1 }));
      setTimeout(() => {
        setLivePulses((p) => ({ ...p, [a.id]: 0, [b.id]: 0 }));
      }, 800);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  // Geometry
  const W = 720;
  const H = 380;
  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.min(W, H) * 0.32;

  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number; angle: number }> = {};
    agents.forEach((a, i) => {
      const angle = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
      pos[a.id] = {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        angle,
      };
    });
    return pos;
  }, [cx, cy, radius]);

  const visibleInteractions = useMemo(
    () => interactions.filter((i) => activeTypes.has(i.type)),
    [interactions, activeTypes]
  );

  const focusFilter = focusedAgent || hoveredAgent;
  const filteredEdges = useMemo(
    () => focusFilter
      ? visibleInteractions.filter((i) => i.from === focusFilter || i.to === focusFilter)
      : visibleInteractions,
    [visibleInteractions, focusFilter]
  );

  const toggleType = (t: InteractionType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      if (next.size === 0) return prev;
      return next;
    });
  };

  // Stats
  const stats = useMemo(() => {
    const counts: Record<InteractionType, number> = { task: 0, data: 0, query: 0, response: 0 };
    interactions.forEach((i) => { counts[i.type] += 1; });
    return counts;
  }, [interactions]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-glow-success glow-dot-online" />
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-glow-success animate-ping" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Live Constellation</h3>
            <span className="text-[9px] mono text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/40 border border-border/40">
              REAL-TIME
            </span>
          </div>
          <p className="text-[10px] mono text-muted-foreground">
            {interactions.length} signals tracked · {agents.filter(a => a.status === "online").length}/{agents.length} agents online
          </p>
        </div>

        {/* Type filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/30 border border-border/40">
          <Filter className="h-3 w-3 text-muted-foreground ml-1.5" />
          {(Object.entries(typeConfig) as [InteractionType, typeof typeConfig.task][]).map(([type, cfg]) => {
            const Icon = cfg.icon;
            const active = activeTypes.has(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] mono uppercase tracking-wider transition-all",
                  active
                    ? "bg-card text-foreground shadow-[0_0_0_1px_hsl(var(--border))]"
                    : "text-muted-foreground/60 hover:text-foreground"
                )}
                style={active ? { boxShadow: `0 0 0 1px hsl(${cfg.color} / 0.4), 0 4px 12px -4px hsl(${cfg.color} / 0.4)` } : undefined}
              >
                <Icon className="h-3 w-3" style={{ color: `hsl(${cfg.color})` }} />
                <span style={active ? { color: `hsl(${cfg.color})` } : undefined}>{cfg.label}</span>
                <span className="ml-0.5 text-foreground/50">{stats[type]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main grid: visualization + live stream */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
        {/* SVG constellation */}
        <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-gradient-to-br from-card/40 via-background/60 to-card/40">
          {/* Backdrop aurora */}
          <div className="absolute inset-0 opacity-50" style={{ background: "var(--gradient-aurora)" }} />
          {/* Grid backdrop */}
          <div className="absolute inset-0 grid-bg opacity-30" />

          <svg viewBox={`0 0 ${W} ${H}`} className="relative w-full" style={{ maxHeight: 420 }}>
            <defs>
              <filter id="edge-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="hub-grad" cx="50%" cy="50%">
                <stop offset="0%" stopColor="hsl(var(--primary) / 0.35)" />
                <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
              </radialGradient>
            </defs>

            {/* Orbital rings (concentric, decorative) */}
            {[0.6, 0.85, 1.0].map((scale, i) => (
              <circle
                key={i}
                cx={cx} cy={cy}
                r={radius * scale}
                fill="none"
                stroke="hsl(var(--border))"
                strokeOpacity={0.15 - i * 0.03}
                strokeWidth="0.5"
                strokeDasharray={i === 2 ? "none" : "2 6"}
              />
            ))}

            {/* Center hub */}
            <circle cx={cx} cy={cy} r="60" fill="url(#hub-grad)" />
            <circle cx={cx} cy={cy} r="14" fill="hsl(var(--card))" stroke="hsl(var(--primary) / 0.4)" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="3" fill="hsl(var(--primary))">
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </circle>
            <text
              x={cx} y={cy + 30}
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize="8"
              fontFamily="'JetBrains Mono', monospace"
              letterSpacing="2"
            >
              ORCHESTRATOR
            </text>

            {/* Arc edges between agents — curved through the hub area */}
            {filteredEdges.slice(0, 10).map((edge) => {
              const from = positions[edge.from];
              const to = positions[edge.to];
              if (!from || !to) return null;
              const cfg = typeConfig[edge.type];
              const ageOpacity = Math.max(0.2, 1 - edge.ageMs / 30000);
              const strokeWidth = edge.ageMs < 1000 ? 2 : 1;

              // Curve via hub
              const pathD = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
              const isFresh = edge.ageMs < 2000;

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={`hsl(${cfg.color})`}
                    strokeWidth={strokeWidth}
                    strokeOpacity={ageOpacity * 0.6}
                    filter={isFresh ? "url(#edge-glow)" : undefined}
                  />
                  {/* Particle traveling along the path for fresh edges */}
                  {isFresh && (
                    <>
                      <circle r="3" fill={`hsl(${cfg.color})`}>
                        <animateMotion dur="1.4s" repeatCount="1" fill="freeze" path={pathD} />
                        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="1.4s" fill="freeze" />
                      </circle>
                      <circle r="6" fill={`hsl(${cfg.color})`} opacity="0.3">
                        <animateMotion dur="1.4s" repeatCount="1" fill="freeze" path={pathD} />
                        <animate attributeName="opacity" values="0;0.4;0" keyTimes="0;0.1;1" dur="1.4s" fill="freeze" />
                      </circle>
                    </>
                  )}
                </g>
              );
            })}

            {/* Agent orbs */}
            {agents.map((a) => {
              const pos = positions[a.id];
              if (!pos) return null;
              const isH = hoveredAgent === a.id;
              const isF = focusedAgent === a.id;
              const isDimmed = !!focusFilter && focusFilter !== a.id &&
                !filteredEdges.some(e => (e.from === focusFilter && e.to === a.id) || (e.to === focusFilter && e.from === a.id));
              return (
                <AgentOrbit
                  key={a.id}
                  agent={a}
                  pos={pos}
                  isHovered={isH}
                  isFocused={isF}
                  isDimmed={isDimmed}
                  pulseStrength={livePulses[a.id] || 0}
                  onHover={() => setHoveredAgent(a.id)}
                  onLeave={() => setHoveredAgent(null)}
                  onClick={() => setFocusedAgent(focusedAgent === a.id ? null : a.id)}
                />
              );
            })}
          </svg>

          {/* Focus indicator */}
          {focusedAgent && (
            <button
              onClick={() => setFocusedAgent(null)}
              className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/15 border border-primary/30 text-[10px] mono text-primary hover:bg-primary/25 transition-colors"
            >
              Focus: {agents.find(a => a.id === focusedAgent)?.name}
              <span className="text-primary/60">×</span>
            </button>
          )}

          {/* Bottom legend hint */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[9px] mono text-muted-foreground/70">
            <span>click orb to focus · hover to highlight</span>
          </div>
        </div>

        {/* Live activity stream */}
        <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-secondary/20">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-[10px] mono text-foreground uppercase tracking-wider font-semibold">Live Stream</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-glow-success glow-dot-online" />
              <span className="text-[8px] mono text-glow-success">LIVE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] p-2 space-y-1.5">
            <AnimatePresence initial={false}>
              {filteredEdges.slice(0, 12).map((it) => {
                const cfg = typeConfig[it.type];
                const fromAgent = agents.find(a => a.id === it.from);
                const toAgent = agents.find(a => a.id === it.to);
                const Icon = cfg.icon;
                const isFresh = it.ageMs < 2000;
                return (
                  <motion.div
                    key={it.id}
                    layout
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    className={cn(
                      "group relative rounded-lg p-2 border transition-colors cursor-pointer",
                      isFresh
                        ? "bg-secondary/40 border-border/60"
                        : "bg-secondary/20 border-border/30 hover:bg-secondary/40"
                    )}
                    onMouseEnter={() => setHoveredAgent(it.from)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    {/* Left ribbon */}
                    <div
                      className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r"
                      style={{ background: `hsl(${cfg.color})`, boxShadow: `0 0 6px hsl(${cfg.color} / 0.6)` }}
                    />
                    <div className="flex items-start gap-2 pl-1.5">
                      <div
                        className="mt-0.5 p-1 rounded-md shrink-0"
                        style={{ background: `hsl(${cfg.color} / 0.15)`, color: `hsl(${cfg.color})` }}
                      >
                        <Icon className="h-2.5 w-2.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-foreground leading-tight truncate">
                          {it.label}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[8px] mono text-muted-foreground">
                          <span className="text-foreground/70">{fromAgent?.name}</span>
                          <span>→</span>
                          <span className="text-foreground/70">{toAgent?.name}</span>
                          <span className="ml-auto">{it.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    {isFresh && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.4 }}
                        className="absolute bottom-0 left-0 right-0 h-px origin-left"
                        style={{ background: `hsl(${cfg.color})` }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
