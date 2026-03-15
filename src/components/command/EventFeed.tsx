import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { events } from "@/lib/mock-data";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

const typeConfig = {
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
  success: { icon: CheckCircle, color: "text-glow-success", bg: "bg-glow-success/10" },
  warning: { icon: AlertTriangle, color: "text-glow-warning", bg: "bg-glow-warning/10" },
  error: { icon: AlertCircle, color: "text-glow-danger", bg: "bg-glow-danger/10" },
};

export function EventFeed() {
  return (
    <div className="glass-panel p-4 scan-line">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Live Events
        </h3>
        <span className="text-[10px] mono text-muted-foreground">{events.length} events</span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {events.map((event, i) => {
          const config = typeConfig[event.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-start gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors group"
            >
              <div className={cn("p-1 rounded", config.bg, "shrink-0 mt-0.5")}>
                <Icon className={cn("h-3 w-3", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/90 leading-relaxed">{event.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] mono text-muted-foreground">{event.source}</span>
                  <span className="text-[10px] text-muted-foreground/50">·</span>
                  <span className="text-[10px] mono text-muted-foreground/60">{event.timestamp}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
