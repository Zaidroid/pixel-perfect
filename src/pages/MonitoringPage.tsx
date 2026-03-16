import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Activity, Cpu, MemoryStick, HardDrive, Wifi, Gauge, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { ExpandableOverlay } from "@/components/command/ExpandableOverlay";

// Generate fake time-series data
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

interface MetricSeries {
  label: string;
  icon: React.ElementType;
  unit: string;
  color: string;
  glowColor: string;
  current: number;
  data: number[];
  max: number;
}

function Sparkline({ data, max, color, height = 60 }: { data: number[]; max: number; color: string; height?: number }) {
  const width = 100;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className={color} stopOpacity="0.3" />
          <stop offset="100%" className={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="currentColor"
        className={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        points={points}
      />
      <polygon
        fill={`url(#grad-${color})`}
        points={`0,${height} ${points} ${width},${height}`}
        opacity="0.4"
      />
    </svg>
  );
}

function LiveDot() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-1.5 rounded-full bg-glow-success glow-dot-online animate-pulse" />
      <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">Live</span>
    </div>
  );
}

const MonitoringPage = () => {
  const [tick, setTick] = useState(0);
  const [expandedMetric, setExpandedMetric] = useState<MetricSeries | null>(null);

  const metrics: MetricSeries[] = [
    { label: "CPU Usage", icon: Cpu, unit: "%", color: "text-primary", glowColor: "glow-primary", current: 24.5 + Math.sin(tick * 0.3) * 5, data: generateSeries(60, 10, 60), max: 100 },
    { label: "Memory", icon: MemoryStick, unit: "%", color: "text-glow-warning", glowColor: "glow-warning", current: 67.3 + Math.cos(tick * 0.2) * 3, data: generateSeries(60, 50, 85), max: 100 },
    { label: "Disk I/O", icon: HardDrive, unit: "MB/s", color: "text-primary", glowColor: "glow-primary", current: 12.4 + Math.sin(tick * 0.5) * 4, data: generateSeries(60, 2, 30), max: 50 },
    { label: "Network In", icon: Wifi, unit: "MB/s", color: "text-glow-success", glowColor: "glow-success", current: 8.2 + Math.random() * 2, data: generateSeries(60, 2, 20), max: 30 },
    { label: "Network Out", icon: ArrowUp, unit: "MB/s", color: "text-glow-success", glowColor: "glow-success", current: 3.8 + Math.random() * 1, data: generateSeries(60, 1, 10), max: 15 },
    { label: "Swap", icon: Gauge, unit: "%", color: "text-muted-foreground", glowColor: "glow-primary", current: 15.2 + Math.sin(tick * 0.1) * 2, data: generateSeries(60, 5, 30), max: 100 },
  ];

  // Simulate live ticks
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  const processData = [
    { name: "ollama", cpu: 18.5, mem: "4.0 GB", pid: 1842 },
    { name: "node (n8n)", cpu: 2.1, mem: "256 MB", pid: 2103 },
    { name: "postgres", cpu: 1.8, mem: "512 MB", pid: 1456 },
    { name: "redis-server", cpu: 0.3, mem: "64 MB", pid: 1789 },
    { name: "cmd-center", cpu: 4.2, mem: "312 MB", pid: 2201 },
    { name: "nginx", cpu: 0.1, mem: "32 MB", pid: 998 },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground glow-text">Monitoring</h1>
          <p className="text-sm text-muted-foreground mono mt-1">Real-time system performance</p>
        </div>
        <LiveDot />
      </motion.div>

      {/* Metric Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-panel-hover p-4 cursor-pointer"
            onClick={() => setExpandedMetric(m)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <m.icon className={cn("h-4 w-4", m.color)} />
                <span className="text-sm font-semibold text-foreground">{m.label}</span>
              </div>
              <span className={cn("text-lg font-bold mono", m.color)}>
                {m.current.toFixed(1)}{m.unit}
              </span>
            </div>
            <Sparkline data={m.data} max={m.max} color={m.color} height={50} />
            <div className="flex items-center justify-between mt-2 text-[10px] mono text-muted-foreground/50">
              <span>60 min ago</span>
              <span>now</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Process Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Top Processes</h2>
        </div>
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-xs mono">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Process</th>
                <th className="text-right p-3 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">PID</th>
                <th className="text-right p-3 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">CPU</th>
                <th className="text-right p-3 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Memory</th>
              </tr>
            </thead>
            <tbody>
              {processData.sort((a, b) => b.cpu - a.cpu).map((p, i) => (
                <motion.tr
                  key={p.pid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  className="border-b border-border/10 hover:bg-secondary/20 transition-colors"
                >
                  <td className="p-3 text-foreground font-medium">{p.name}</td>
                  <td className="p-3 text-right text-muted-foreground">{p.pid}</td>
                  <td className="p-3 text-right">
                    <span className={cn(p.cpu > 10 ? "text-glow-warning" : p.cpu > 5 ? "text-primary" : "text-muted-foreground")}>
                      {p.cpu}%
                    </span>
                  </td>
                  <td className="p-3 text-right text-muted-foreground">{p.mem}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Alerts Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Active Alerts</h2>
        </div>
        <div className="space-y-2">
          {[
            { severity: "warning", msg: "Redis memory usage at 85% threshold", time: "12 min ago" },
            { severity: "error", msg: "Prometheus container exited (code 137)", time: "1 hr ago" },
            { severity: "info", msg: "Agent Zaid response time exceeding 3s", time: "4 hrs ago" },
          ].map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.05 }}
              className={cn(
                "glass-panel p-3 flex items-center gap-3 border-l-2",
                alert.severity === "error" ? "border-l-glow-danger" :
                alert.severity === "warning" ? "border-l-glow-warning" :
                "border-l-primary"
              )}
            >
              <div className={cn(
                "h-2 w-2 rounded-full shrink-0",
                alert.severity === "error" ? "bg-glow-danger glow-dot-danger" :
                alert.severity === "warning" ? "bg-glow-warning glow-dot-warning" :
                "bg-primary"
              )} />
              <span className="text-xs text-foreground flex-1">{alert.msg}</span>
              <span className="text-[10px] mono text-muted-foreground/50 shrink-0">{alert.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Expanded metric detail */}
      <ExpandableOverlay isOpen={!!expandedMetric} onClose={() => setExpandedMetric(null)} title={expandedMetric?.label ?? ""}>
        {expandedMetric && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <expandedMetric.icon className={cn("h-6 w-6", expandedMetric.color)} />
              <div>
                <span className={cn("text-3xl font-bold mono", expandedMetric.color)}>
                  {expandedMetric.current.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground ml-1">{expandedMetric.unit}</span>
              </div>
            </div>
            <Sparkline data={expandedMetric.data} max={expandedMetric.max} color={expandedMetric.color} height={120} />
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Average", value: (expandedMetric.data.reduce((a, b) => a + b, 0) / expandedMetric.data.length).toFixed(1) },
                { label: "Peak", value: Math.max(...expandedMetric.data).toFixed(1) },
                { label: "Low", value: Math.min(...expandedMetric.data).toFixed(1) },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-md bg-secondary/30 border border-border/30 text-center">
                  <p className="text-[10px] mono text-muted-foreground uppercase">{s.label}</p>
                  <p className="text-lg font-semibold text-foreground mono">{s.value}{expandedMetric.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </ExpandableOverlay>
    </div>
  );
};

export default MonitoringPage;
