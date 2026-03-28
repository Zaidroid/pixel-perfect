import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus, BarChart3, Activity, Clock, Zap } from "lucide-react";
import { ExpandableOverlay } from "./ExpandableOverlay";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  color?: "primary" | "success" | "warning" | "danger";
  delay?: number;
}

const colorMap = {
  primary: "text-primary",
  success: "text-glow-success",
  warning: "text-glow-warning",
  danger: "text-glow-danger",
};

const barColorMap = {
  primary: "bg-primary",
  success: "bg-glow-success",
  warning: "bg-glow-warning",
  danger: "bg-glow-danger",
};

const glowMap = {
  primary: "shadow-[0_0_20px_-5px_hsl(var(--glow-primary)/0.3)]",
  success: "shadow-[0_0_20px_-5px_hsl(var(--glow-success)/0.3)]",
  warning: "shadow-[0_0_20px_-5px_hsl(var(--glow-warning)/0.3)]",
  danger: "shadow-[0_0_20px_-5px_hsl(var(--glow-danger)/0.3)]",
};

function useHistory() {
  return useMemo(() => {
    const data = [];
    let val = 40 + Math.random() * 20;
    for (let i = 0; i < 24; i++) {
      val = Math.max(5, Math.min(95, val + (Math.random() - 0.5) * 15));
      data.push(Math.round(val * 10) / 10);
    }
    return data;
  }, []);
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 100;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color})`} className={colorMap[color as keyof typeof colorMap]} />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" className={colorMap[color as keyof typeof colorMap]} />
    </svg>
  );
}

export function MetricCard({ label, value, unit, icon: Icon, color = "primary", delay = 0 }: MetricCardProps) {
  const [expanded, setExpanded] = useState(false);
  const numValue = typeof value === "number" ? value : parseFloat(value);
  const showBar = !isNaN(numValue) && numValue <= 100;
  const history = useHistory();
  const maxH = Math.max(...history);
  const minH = Math.min(...history);
  const avg = (history.reduce((a, b) => a + b, 0) / history.length).toFixed(1);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn("glass-panel p-4 cursor-pointer relative overflow-hidden group transition-shadow duration-300 hover:" + glowMap[color])}
        onClick={() => setExpanded(true)}
      >
        {/* Subtle corner accent */}
        <div className={cn("absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500", barColorMap[color], "blur-2xl")} style={{ borderRadius: "0 0 0 100%" }} />

        <div className="flex items-center justify-between mb-2.5 relative z-10">
          <span className="text-[10px] mono uppercase tracking-widest text-muted-foreground">{label}</span>
          <div className={cn("p-1.5 rounded-md bg-secondary/40", "group-hover:bg-secondary/60 transition-colors")}>
            <Icon className={cn("h-3.5 w-3.5", colorMap[color])} />
          </div>
        </div>
        <div className="flex items-baseline gap-1 relative z-10">
          <span className={cn("text-2xl font-bold font-display tabular-nums", colorMap[color])}>{value}</span>
          {unit && <span className="text-[10px] text-muted-foreground mono">{unit}</span>}
        </div>

        {/* Mini sparkline */}
        <div className="mt-2.5 relative z-10 opacity-40 group-hover:opacity-70 transition-opacity">
          <MiniSparkline data={history.slice(-12)} color={color} />
        </div>

        {showBar && (
          <div className="mt-2 h-[2px] rounded-full bg-secondary/50 overflow-hidden relative z-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${numValue}%` }}
              transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
              className={cn("h-full rounded-full", barColorMap[color])}
            />
          </div>
        )}
      </motion.div>

      <ExpandableOverlay
        isOpen={expanded}
        onClose={() => setExpanded(false)}
        title={`${label} Metrics`}
        subtitle="Real-time system telemetry"
        icon={<div className={cn("p-2 rounded-lg bg-secondary/40")}><Icon className={cn("h-5 w-5", colorMap[color])} /></div>}
        tabs={[
          {
            id: "overview",
            label: "Overview",
            icon: <BarChart3 className="h-3 w-3" />,
            content: (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div>
                    <span className={cn("text-5xl font-bold font-display tabular-nums", colorMap[color])}>{value}</span>
                    {unit && <span className="text-xl text-muted-foreground mono ml-1">{unit}</span>}
                  </div>
                  {showBar && (
                    <div className="flex-1">
                      <div className="h-3 rounded-full bg-secondary/40 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${numValue}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={cn("h-full rounded-full", barColorMap[color])}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] mono text-muted-foreground">0{unit}</span>
                        <span className="text-[9px] mono text-muted-foreground">100{unit}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">24h Trend</span>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/20">
                    <div className="flex items-end gap-[3px] h-24">
                      {history.map((v, i) => {
                        const pct = ((v - minH) / (maxH - minH || 1)) * 100;
                        return (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${pct}%` }}
                            transition={{ duration: 0.4, delay: i * 0.02 }}
                            className={cn("flex-1 rounded-sm", barColorMap[color], "opacity-60 hover:opacity-100 transition-opacity cursor-crosshair")}
                            title={`${v}${unit ?? ""}`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[9px] mono text-muted-foreground">24h ago</span>
                      <span className="text-[9px] mono text-muted-foreground">now</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Average", val: `${avg}`, icon: Minus, desc: "Mean over 24h" },
                    { label: "Peak", val: `${maxH.toFixed(1)}`, icon: TrendingUp, desc: "Highest recorded" },
                    { label: "Low", val: `${minH.toFixed(1)}`, icon: TrendingDown, desc: "Lowest recorded" },
                  ].map((s) => (
                    <div key={s.label} className="p-3 rounded-xl bg-secondary/20 border border-border/20 text-center group/stat hover:bg-secondary/30 transition-colors">
                      <s.icon className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1.5" />
                      <p className="text-lg font-bold text-foreground mono tabular-nums">{s.val}<span className="text-xs text-muted-foreground ml-0.5">{unit}</span></p>
                      <p className="text-[9px] text-muted-foreground mono mt-0.5">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: "alerts",
            label: "Alerts",
            icon: <Zap className="h-3 w-3" />,
            content: (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Threshold alerts for {label}</p>
                {[
                  { threshold: "Warning > 70%", status: numValue > 70 ? "triggered" : "ok" },
                  { threshold: "Critical > 90%", status: numValue > 90 ? "triggered" : "ok" },
                  { threshold: "Anomaly detection", status: "ok" },
                ].map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/20">
                    <span className="text-xs text-foreground">{alert.threshold}</span>
                    <span className={cn(
                      "text-[10px] mono font-bold px-2 py-0.5 rounded",
                      alert.status === "triggered" ? "bg-glow-danger/20 text-glow-danger" : "bg-glow-success/20 text-glow-success"
                    )}>
                      {alert.status === "triggered" ? "TRIGGERED" : "OK"}
                    </span>
                  </div>
                ))}
              </div>
            ),
          },
          {
            id: "history",
            label: "History",
            icon: <Clock className="h-3 w-3" />,
            content: (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">Recent readings (hourly)</p>
                {history.slice(-8).reverse().map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/15 border border-border/15 hover:bg-secondary/25 transition-colors">
                    <span className="text-[10px] mono text-muted-foreground">{i === 0 ? "Now" : `${i}h ago`}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                        <div className={cn("h-full rounded-full", barColorMap[color])} style={{ width: `${Math.min(v, 100)}%` }} />
                      </div>
                      <span className="text-xs mono text-foreground tabular-nums w-12 text-right">{v.toFixed(1)}{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
