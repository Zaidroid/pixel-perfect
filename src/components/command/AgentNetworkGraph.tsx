import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { agents } from "@/lib/mock-data";
import type { Agent } from "@/lib/mock-data";

interface Interaction {
  from: string;
  to: string;
  type: "task" | "data" | "query" | "response";
  label: string;
  timestamp: string;
}

const mockInteractions: Interaction[] = [
  { from: "fawwaz", to: "tamador", type: "task", label: "Dispatched T-143", timestamp: "12s ago" },
  { from: "fawwaz", to: "nour", type: "task", label: "Assigned analysis R-090", timestamp: "45s ago" },
  { from: "tamador", to: "ihab", type: "data", label: "Deploy request v2.1.4", timestamp: "1m ago" },
  { from: "nour", to: "fawwaz", type: "response", label: "Report ready: Q1 metrics", timestamp: "2m ago" },
  { from: "ihab", to: "tamador", type: "response", label: "Build #847 passed", timestamp: "3m ago" },
  { from: "fawwaz", to: "zaid", type: "query", label: "Research: competitor API", timestamp: "5m ago" },
  { from: "zaid", to: "nour", type: "data", label: "Raw data: pricing models", timestamp: "8m ago" },
  { from: "tamador", to: "fawwaz", type: "response", label: "PR #312 merged", timestamp: "10m ago" },
];

const typeColors = {
  task: { stroke: "hsl(185, 80%, 55%)", label: "text-primary", bg: "bg-primary/10 border-primary/20" },
  data: { stroke: "hsl(155, 75%, 50%)", label: "text-glow-success", bg: "bg-glow-success/10 border-glow-success/20" },
  query: { stroke: "hsl(38, 92%, 55%)", label: "text-glow-warning", bg: "bg-glow-warning/10 border-glow-warning/20" },
  response: { stroke: "hsl(280, 60%, 60%)", label: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
};

export function AgentNetworkGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [activeParticles, setActiveParticles] = useState<number[]>([]);
  const [dims, setDims] = useState({ w: 600, h: 350 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: Math.max(300, entry.contentRect.height) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Animate particles along edges
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveParticles((p) => {
        const next = [...p, Date.now()].slice(-6);
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const nodePositions = useMemo(() => {
    const cx = dims.w / 2;
    const cy = dims.h / 2;
    const radius = Math.min(cx, cy) * 0.65;
    const positions: Record<string, { x: number; y: number }> = {};
    agents.forEach((agent, i) => {
      const angle = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
      positions[agent.id] = {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });
    return positions;
  }, [dims]);

  const filteredInteractions = hoveredAgent
    ? mockInteractions.filter((i) => i.from === hoveredAgent || i.to === hoveredAgent)
    : mockInteractions;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(typeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] rounded" style={{ backgroundColor: colors.stroke }} />
            <span className="text-[9px] mono text-muted-foreground uppercase">{type}</span>
          </div>
        ))}
        <span className="text-[9px] mono text-muted-foreground/40 ml-auto">{mockInteractions.length} interactions</span>
      </div>

      {/* Graph */}
      <div ref={containerRef} className="relative rounded-xl bg-secondary/10 border border-border/20 overflow-hidden" style={{ height: 350 }}>
        <svg width={dims.w} height={dims.h} className="absolute inset-0">
          <defs>
            {Object.entries(typeColors).map(([type, colors]) => (
              <linearGradient key={type} id={`edge-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.6" />
                <stop offset="50%" stopColor={colors.stroke} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.6" />
              </linearGradient>
            ))}
          </defs>

          {/* Edges */}
          {filteredInteractions.map((interaction, idx) => {
            const from = nodePositions[interaction.from];
            const to = nodePositions[interaction.to];
            if (!from || !to) return null;
            const isHighlighted = !hoveredAgent || interaction.from === hoveredAgent || interaction.to === hoveredAgent;
            const colors = typeColors[interaction.type];

            // Curved path
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const offset = 20;
            const cx1 = mx - dy * offset / Math.sqrt(dx * dx + dy * dy || 1);
            const cy1 = my + dx * offset / Math.sqrt(dx * dx + dy * dy || 1);

            return (
              <g key={idx} opacity={isHighlighted ? 1 : 0.15} className="transition-opacity duration-300">
                <path
                  d={`M ${from.x} ${from.y} Q ${cx1} ${cy1} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth={selectedInteraction === interaction ? 2.5 : 1.5}
                  strokeOpacity={0.4}
                  className="cursor-pointer"
                  onClick={() => setSelectedInteraction(interaction)}
                />
                {/* Animated particle */}
                {activeParticles.map((p, pi) => {
                  if ((p + idx) % mockInteractions.length !== idx) return null;
                  return (
                    <circle key={`${p}-${pi}`} r="2.5" fill={colors.stroke} opacity="0.8">
                      <animateMotion
                        dur="2s"
                        repeatCount="1"
                        fill="freeze"
                        path={`M ${from.x} ${from.y} Q ${cx1} ${cy1} ${to.x} ${to.y}`}
                      />
                      <animate attributeName="opacity" from="0.9" to="0" dur="2s" fill="freeze" />
                    </circle>
                  );
                })}
              </g>
            );
          })}

          {/* Nodes */}
          {agents.map((agent) => {
            const pos = nodePositions[agent.id];
            if (!pos) return null;
            const isHovered = hoveredAgent === agent.id;
            const isConnected = !hoveredAgent || hoveredAgent === agent.id ||
              mockInteractions.some((i) => (i.from === hoveredAgent && i.to === agent.id) || (i.to === hoveredAgent && i.from === agent.id));

            return (
              <g
                key={agent.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
                opacity={isConnected ? 1 : 0.25}
              >
                {/* Outer glow */}
                {agent.status === "online" && (
                  <circle cx={pos.x} cy={pos.y} r={isHovered ? 28 : 22} fill="none" stroke="hsl(185, 80%, 55%)" strokeOpacity={isHovered ? 0.25 : 0.1} strokeWidth="1">
                    {isHovered && <animate attributeName="r" values="22;30;22" dur="2s" repeatCount="indefinite" />}
                  </circle>
                )}
                {/* Node bg */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 20 : 16}
                  fill={agent.status === "online" ? "hsl(220, 18%, 12%)" : "hsl(220, 15%, 10%)"}
                  stroke={agent.status === "online" ? "hsl(185, 80%, 55%)" : agent.status === "idle" ? "hsl(38, 92%, 55%)" : agent.status === "error" ? "hsl(0, 72%, 55%)" : "hsl(220, 15%, 22%)"}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeOpacity={isHovered ? 0.8 : 0.4}
                  className="transition-all duration-200"
                />
                {/* Initial */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={agent.status === "online" ? "hsl(185, 80%, 55%)" : "hsl(215, 15%, 50%)"}
                  fontSize={isHovered ? 11 : 9}
                  fontWeight="600"
                  fontFamily="'Space Grotesk', sans-serif"
                  className="select-none"
                >
                  {agent.name[0]}
                </text>
                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + (isHovered ? 32 : 26)}
                  textAnchor="middle"
                  fill="hsl(200, 20%, 90%)"
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  opacity={isHovered ? 1 : 0.6}
                >
                  {agent.name}
                </text>
                {/* Status dot */}
                <circle
                  cx={pos.x + 12}
                  cy={pos.y - 12}
                  r="3"
                  fill={agent.status === "online" ? "hsl(155, 75%, 50%)" : agent.status === "idle" ? "hsl(38, 92%, 55%)" : agent.status === "error" ? "hsl(0, 72%, 55%)" : "hsl(220, 15%, 30%)"}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interaction Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <AnimatePresence>
          {filteredInteractions.slice(0, 6).map((interaction, i) => {
            const colors = typeColors[interaction.type];
            const fromAgent = agents.find((a) => a.id === interaction.from);
            const toAgent = agents.find((a) => a.id === interaction.to);
            return (
              <motion.div
                key={`${interaction.from}-${interaction.to}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg bg-secondary/15 border border-border/15 hover:bg-secondary/25 transition-all cursor-pointer",
                  selectedInteraction === interaction && "border-primary/30 bg-primary/5"
                )}
                onClick={() => setSelectedInteraction(interaction === selectedInteraction ? null : interaction)}
              >
                <div className={cn("px-1.5 py-0.5 rounded text-[8px] mono font-bold uppercase border", colors.bg)}>
                  {interaction.type}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground truncate">{interaction.label}</p>
                  <p className="text-[9px] mono text-muted-foreground">
                    {fromAgent?.name} → {toAgent?.name} · {interaction.timestamp}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
