import { useState, useMemo, useEffect } from "react";
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

const typeStyles: Record<string, { color: string; glow: string; label: string }> = {
  task: { color: "hsl(185, 80%, 55%)", glow: "hsl(185, 80%, 55%)", label: "Task" },
  data: { color: "hsl(155, 75%, 50%)", glow: "hsl(155, 75%, 50%)", label: "Data" },
  query: { color: "hsl(38, 92%, 55%)", glow: "hsl(38, 92%, 55%)", label: "Query" },
  response: { color: "hsl(280, 60%, 60%)", glow: "hsl(280, 60%, 60%)", label: "Response" },
};

const statusColors: Record<string, string> = {
  online: "hsl(155, 75%, 50%)",
  idle: "hsl(38, 92%, 55%)",
  error: "hsl(0, 72%, 55%)",
  offline: "hsl(220, 15%, 30%)",
};

function AgentNode({ agent, pos, isHovered, isConnected, onHover, onLeave }: {
  agent: Agent; pos: { x: number; y: number }; isHovered: boolean; isConnected: boolean;
  onHover: () => void; onLeave: () => void;
}) {
  const r = isHovered ? 26 : 20;
  const statusColor = statusColors[agent.status];
  const isOnline = agent.status === "online";

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ opacity: isConnected ? 1 : 0.2, transition: "opacity 0.3s" }}
    >
      {/* Ambient ring */}
      {isOnline && (
        <>
          <circle cx={pos.x} cy={pos.y} r={r + 10} fill="none" stroke={statusColor} strokeOpacity={0.06} strokeWidth="1" />
          {isHovered && (
            <circle cx={pos.x} cy={pos.y} r={r + 16} fill="none" stroke="hsl(185, 80%, 55%)" strokeOpacity={0.12} strokeWidth="0.5">
              <animate attributeName="r" values={`${r + 10};${r + 20};${r + 10}`} dur="3s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.12;0.04;0.12" dur="3s" repeatCount="indefinite" />
            </circle>
          )}
        </>
      )}
      {/* BG circle */}
      <circle
        cx={pos.x} cy={pos.y} r={r}
        fill="hsl(220, 18%, 10%)"
        stroke={isHovered ? "hsl(185, 80%, 55%)" : statusColor}
        strokeWidth={isHovered ? 2 : 1}
        strokeOpacity={isHovered ? 0.8 : 0.35}
        style={{ transition: "all 0.25s" }}
      />
      {/* Initial */}
      <text
        x={pos.x} y={pos.y + 1}
        textAnchor="middle" dominantBaseline="central"
        fill={isOnline ? "hsl(185, 80%, 55%)" : "hsl(215, 15%, 50%)"}
        fontSize={isHovered ? 13 : 10}
        fontWeight="700"
        fontFamily="'Space Grotesk', sans-serif"
        className="select-none"
        style={{ transition: "font-size 0.2s" }}
      >
        {agent.name[0]}
      </text>
      {/* Name label */}
      <text
        x={pos.x} y={pos.y + r + 14}
        textAnchor="middle"
        fill="hsl(200, 20%, 90%)"
        fontSize="9" fontWeight="500"
        fontFamily="'JetBrains Mono', monospace"
        opacity={isHovered ? 1 : 0.5}
        style={{ transition: "opacity 0.2s" }}
      >
        {agent.name}
      </text>
      {/* Role sublabel */}
      {isHovered && (
        <text
          x={pos.x} y={pos.y + r + 25}
          textAnchor="middle"
          fill="hsl(215, 15%, 50%)"
          fontSize="7"
          fontFamily="'JetBrains Mono', monospace"
        >
          {agent.role}
        </text>
      )}
      {/* Status dot */}
      <circle cx={pos.x + r * 0.65} cy={pos.y - r * 0.65} r="3.5" fill={statusColor} />
    </g>
  );
}

export function AgentNetworkGraph() {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setPulse(p => p + 1), 2000);
    return () => clearInterval(iv);
  }, []);

  const w = 700;
  const h = 320;
  const cx = w / 2;
  const cy = h / 2;

  const nodePositions = useMemo(() => {
    const radius = Math.min(cx, cy) * 0.6;
    const positions: Record<string, { x: number; y: number }> = {};
    agents.forEach((agent, i) => {
      const angle = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
      positions[agent.id] = {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });
    return positions;
  }, [cx, cy]);

  const filteredInteractions = hoveredAgent
    ? mockInteractions.filter(i => i.from === hoveredAgent || i.to === hoveredAgent)
    : mockInteractions;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-5 flex-wrap">
        {Object.entries(typeStyles).map(([type, style]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-5 h-[2px] rounded-full" style={{ backgroundColor: style.color, boxShadow: `0 0 6px ${style.glow}` }} />
            <span className="text-[9px] mono text-muted-foreground uppercase tracking-wider">{style.label}</span>
          </div>
        ))}
        <span className="text-[9px] mono text-muted-foreground/30 ml-auto">{mockInteractions.length} interactions tracked</span>
      </div>

      {/* SVG Graph */}
      <div className="relative rounded-2xl bg-secondary/5 border border-border/10 overflow-hidden">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 350 }}>
          <defs>
            <filter id="glow-edge" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {Object.entries(typeStyles).map(([type, style]) => (
              <linearGradient key={type} id={`edge-grad-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={style.color} stopOpacity="0.15" />
                <stop offset="50%" stopColor={style.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={style.color} stopOpacity="0.15" />
              </linearGradient>
            ))}
          </defs>

          {/* Center crosshair */}
          <circle cx={cx} cy={cy} r="3" fill="none" stroke="hsl(185, 80%, 55%)" strokeOpacity="0.08" strokeWidth="0.5" />
          <circle cx={cx} cy={cy} r="60" fill="none" stroke="hsl(185, 80%, 55%)" strokeOpacity="0.04" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx={cx} cy={cy} r="120" fill="none" stroke="hsl(185, 80%, 55%)" strokeOpacity="0.03" strokeWidth="0.5" strokeDasharray="2 6" />

          {/* Edges */}
          {filteredInteractions.map((interaction, idx) => {
            const from = nodePositions[interaction.from];
            const to = nodePositions[interaction.to];
            if (!from || !to) return null;
            const style = typeStyles[interaction.type];
            const isHighlighted = !hoveredAgent || interaction.from === hoveredAgent || interaction.to === hoveredAgent;
            const isSelected = selectedInteraction === interaction;

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const curveAmt = 25;
            const mx = (from.x + to.x) / 2 - (dy / dist) * curveAmt;
            const my = (from.y + to.y) / 2 + (dx / dist) * curveAmt;
            const pathD = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;

            return (
              <g key={idx} opacity={isHighlighted ? 1 : 0.08} style={{ transition: "opacity 0.3s" }}>
                {/* Shadow edge */}
                <path d={pathD} fill="none" stroke={style.color} strokeWidth={isSelected ? 3 : 1.5} strokeOpacity={isSelected ? 0.6 : 0.25}
                  filter={isSelected ? "url(#glow-edge)" : undefined}
                  className="cursor-pointer" onClick={() => setSelectedInteraction(interaction === selectedInteraction ? null : interaction)}
                />
                {/* Animated particle */}
                {(pulse + idx) % 3 === 0 && (
                  <circle r="3" fill={style.color} opacity="0">
                    <animateMotion dur="1.8s" repeatCount="1" fill="freeze" path={pathD} />
                    <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.1;0.7;1" dur="1.8s" fill="freeze" />
                    <animate attributeName="r" values="2;3.5;2" dur="1.8s" fill="freeze" />
                  </circle>
                )}
                {/* Direction arrow at midpoint */}
                <circle cx={mx} cy={my} r="2" fill={style.color} opacity={isHighlighted ? 0.5 : 0.1} />
              </g>
            );
          })}

          {/* Nodes */}
          {agents.map(agent => {
            const pos = nodePositions[agent.id];
            if (!pos) return null;
            const isHovered = hoveredAgent === agent.id;
            const isConnected = !hoveredAgent || hoveredAgent === agent.id ||
              mockInteractions.some(i => (i.from === hoveredAgent && i.to === agent.id) || (i.to === hoveredAgent && i.from === agent.id));

            return (
              <AgentNode key={agent.id} agent={agent} pos={pos}
                isHovered={isHovered} isConnected={isConnected}
                onHover={() => setHoveredAgent(agent.id)}
                onLeave={() => setHoveredAgent(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Interaction Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        <AnimatePresence>
          {filteredInteractions.slice(0, 6).map((interaction, i) => {
            const style = typeStyles[interaction.type];
            const fromAgent = agents.find(a => a.id === interaction.from);
            const toAgent = agents.find(a => a.id === interaction.to);
            const isSelected = selectedInteraction === interaction;
            return (
              <motion.div
                key={`${interaction.from}-${interaction.to}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.02 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer",
                  "bg-secondary/8 border border-border/10 hover:bg-secondary/15 hover:border-border/20",
                  isSelected && "border-primary/25 bg-primary/5"
                )}
                onClick={() => setSelectedInteraction(interaction === selectedInteraction ? null : interaction)}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: style.color, boxShadow: `0 0 6px ${style.glow}` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground/90 truncate">{interaction.label}</p>
                  <p className="text-[9px] mono text-muted-foreground/40">
                    {fromAgent?.name} → {toAgent?.name} · {interaction.timestamp}
                  </p>
                </div>
                <span className="text-[7px] mono text-muted-foreground/30 uppercase shrink-0">{interaction.type}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
