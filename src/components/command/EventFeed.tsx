import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { events } from "@/lib/mock-data";
import type { SystemEvent } from "@/lib/mock-data";
import { AlertCircle, CheckCircle, Info, AlertTriangle, ExternalLink, Clock, Hash } from "lucide-react";
import { ExpandableOverlay } from "./ExpandableOverlay";

const typeConfig = {
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", label: "Information" },
  success: { icon: CheckCircle, color: "text-glow-success", bg: "bg-glow-success/10", border: "border-glow-success/20", label: "Success" },
  warning: { icon: AlertTriangle, color: "text-glow-warning", bg: "bg-glow-warning/10", border: "border-glow-warning/20", label: "Warning" },
  error: { icon: AlertCircle, color: "text-glow-danger", bg: "bg-glow-danger/10", border: "border-glow-danger/20", label: "Error" },
};

export function EventFeed() {
  const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null);

  return (
    <>
      <div className="glass-panel p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            Live Events
          </h3>
          <span className="text-[10px] mono text-muted-foreground">{events.length} events</span>
        </div>

        <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
          {events.map((event, i) => {
            const config = typeConfig[event.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ x: 2 }}
                className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-secondary/30 transition-all duration-200 group cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className={cn("p-1 rounded-md shrink-0 mt-0.5", config.bg)}>
                  <Icon className={cn("h-3 w-3", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground/90 leading-relaxed line-clamp-2">{event.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] mono text-muted-foreground">{event.source}</span>
                    <span className="text-[9px] text-muted-foreground/30">·</span>
                    <span className="text-[9px] mono text-muted-foreground/50">{event.timestamp}</span>
                  </div>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/40 shrink-0 mt-1 transition-colors" />
              </motion.div>
            );
          })}
        </div>
      </div>

      <ExpandableOverlay
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        subtitle={selectedEvent ? `${typeConfig[selectedEvent.type].label} event` : ""}
        icon={selectedEvent ? (
          <div className={cn("p-2 rounded-lg", typeConfig[selectedEvent.type].bg)}>
            {(() => { const Icon = typeConfig[selectedEvent.type].icon; return <Icon className={cn("h-5 w-5", typeConfig[selectedEvent.type].color)} />; })()}
          </div>
        ) : undefined}
        statusBadge={selectedEvent ? (
          <span className={cn("text-[9px] mono font-bold px-2 py-1 rounded-md", typeConfig[selectedEvent.type].bg, typeConfig[selectedEvent.type].color, typeConfig[selectedEvent.type].border, "border")}>
            {typeConfig[selectedEvent.type].label.toUpperCase()}
          </span>
        ) : undefined}
      >
        {selectedEvent && (() => {
          const config = typeConfig[selectedEvent.type];
          return (
            <div className="space-y-5">
              <div className={cn("p-4 rounded-xl border", config.bg, config.border)}>
                <p className="text-sm text-foreground leading-relaxed">{selectedEvent.message}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Info, label: "Source", val: selectedEvent.source },
                  { icon: Clock, label: "Timestamp", val: selectedEvent.timestamp },
                  { icon: Hash, label: "Event ID", val: selectedEvent.id },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-secondary/20 border border-border/20">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <item.icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[9px] mono text-muted-foreground uppercase">{item.label}</span>
                    </div>
                    <p className="text-xs font-medium text-foreground mono">{item.val}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-secondary/10 border border-border/15">
                <span className="text-[9px] mono text-muted-foreground uppercase tracking-wider">Related Actions</span>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2 text-[11px] rounded-lg bg-secondary/30 hover:bg-secondary/50 text-foreground border border-border/20 transition-colors mono">View Source</button>
                  <button className="flex-1 py-2 text-[11px] rounded-lg bg-secondary/30 hover:bg-secondary/50 text-foreground border border-border/20 transition-colors mono">Acknowledge</button>
                  <button className="flex-1 py-2 text-[11px] rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors mono">Investigate</button>
                </div>
              </div>
            </div>
          );
        })()}
      </ExpandableOverlay>
    </>
  );
}
