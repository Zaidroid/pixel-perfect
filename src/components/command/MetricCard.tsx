import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
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

// Fake sparkline data
function useFakeHistory() {
  return [42, 38, 45, 52, 48, 55, 60, 58, 63, 57, 50, 47, 53, 49, 44];
}

export function MetricCard({ label, value, unit, icon: Icon, color = "primary", delay = 0 }: MetricCardProps) {
  const [expanded, setExpanded] = useState(false);
  const numValue = typeof value === "number" ? value : parseFloat(value);
  const showBar = !isNaN(numValue) && numValue <= 100;
  const history = useFakeHistory();
  const maxH = Math.max(...history);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass-panel-hover p-4 cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] mono uppercase tracking-widest text-muted-foreground">{label}</span>
          <Icon className={cn("h-4 w-4", colorMap[color])} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn("text-2xl font-semibold font-display", colorMap[color])}>{value}</span>
          {unit && <span className="text-xs text-muted-foreground mono">{unit}</span>}
        </div>
        {showBar && (
          <div className="mt-3 h-1 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${numValue}%` }}
              transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
              className={cn("h-full rounded-full", barColorMap[color])}
            />
          </div>
        )}
      </motion.div>

      <ExpandableOverlay isOpen={expanded} onClose={() => setExpanded(false)} title={`${label} Details`}>
        <div className="space-y-6">
          {/* Big value */}
          <div className="flex items-center gap-4">
            <Icon className={cn("h-8 w-8", colorMap[color])} />
            <div>
              <span className={cn("text-4xl font-bold font-display", colorMap[color])}>{value}</span>
              {unit && <span className="text-lg text-muted-foreground mono ml-1">{unit}</span>}
            </div>
          </div>

          {/* Sparkline */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">Last 15 readings</span>
            </div>
            <div className="flex items-end gap-1 h-20 p-3 rounded-md bg-secondary/30 border border-border/30">
              {history.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / maxH) * 100}%` }}
                  transition={{ duration: 0.4, delay: i * 0.03 }}
                  className={cn("flex-1 rounded-sm", barColorMap[color], "opacity-70")}
                />
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Average", val: "47.2", icon: Minus },
              { label: "Peak", val: "63.0", icon: TrendingUp },
              { label: "Low", val: "38.0", icon: TrendingDown },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-md bg-secondary/30 border border-border/30 text-center">
                <s.icon className="h-3 w-3 text-muted-foreground mx-auto mb-1" />
                <p className="text-sm font-semibold text-foreground mono">{s.val}{unit}</p>
                <p className="text-[10px] text-muted-foreground mono">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </ExpandableOverlay>
    </>
  );
}
