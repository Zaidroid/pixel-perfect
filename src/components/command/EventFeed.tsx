import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { events } from "@/lib/mock-data";
import type { SystemEvent } from "@/lib/mock-data";
import { AlertCircle, CheckCircle, Info, AlertTriangle, ExternalLink } from "lucide-react";
import { ExpandableOverlay } from "./ExpandableOverlay";

const typeConfig = {
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10", label: "Information" },
  success: { icon: CheckCircle, color: "text-glow-success", bg: "bg-glow-success/10", label: "Success" },
  warning: { icon: AlertTriangle, color: "text-glow-warning", bg: "bg-glow-warning/10", label: "Warning" },
  error: { icon: AlertCircle, color: "text-glow-danger", bg: "bg-glow-danger/10", label: "Error" },
};

export function EventFeed() {
  const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null);

  return (
    <>
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
                className="flex items-start gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors group cursor-pointer"
                onClick={() => setSelectedEvent(event)}
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
                <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0 mt-1 transition-colors" />
              </motion.div>
            );
          })}
        </div>
      </div>

      <ExpandableOverlay isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Details">
        {selectedEvent && (() => {
          const config = typeConfig[selectedEvent.type];
          const Icon = config.icon;
          return (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-lg", config.bg)}>
                  <Icon className={cn("h-6 w-6", config.color)} />
                </div>
                <div>
                  <span className={cn("text-xs font-semibold uppercase mono tracking-wider", config.color)}>{config.label}</span>
                  <p className="text-foreground mt-1">{selectedEvent.message}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-secondary/30 border border-border/30">
                  <p className="text-[10px] mono text-muted-foreground uppercase mb-1">Source</p>
                  <p className="text-sm font-medium text-foreground">{selectedEvent.source}</p>
                </div>
                <div className="p-3 rounded-md bg-secondary/30 border border-border/30">
                  <p className="text-[10px] mono text-muted-foreground uppercase mb-1">Timestamp</p>
                  <p className="text-sm font-medium text-foreground">{selectedEvent.timestamp}</p>
                </div>
              </div>
              <div className="p-3 rounded-md bg-secondary/30 border border-border/30">
                <p className="text-[10px] mono text-muted-foreground uppercase mb-1">Event ID</p>
                <p className="text-sm mono text-foreground">{selectedEvent.id}</p>
              </div>
            </div>
          );
        })()}
      </ExpandableOverlay>
    </>
  );
}
