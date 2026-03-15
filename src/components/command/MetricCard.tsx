import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

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

export function MetricCard({ label, value, unit, icon: Icon, color = "primary", delay = 0 }: MetricCardProps) {
  const numValue = typeof value === "number" ? value : parseFloat(value);
  const showBar = !isNaN(numValue) && numValue <= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-panel-hover p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <Icon className={cn("h-4 w-4", colorMap[color])} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-2xl font-semibold font-display", colorMap[color])}>
          {value}
        </span>
        {unit && (
          <span className="text-xs text-muted-foreground mono">{unit}</span>
        )}
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
  );
}
