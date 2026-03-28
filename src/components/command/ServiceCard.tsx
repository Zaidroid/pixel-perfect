import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ServiceInfo } from "@/lib/mock-data";
import { StatusDot } from "./StatusDot";
import { ExpandableOverlay } from "./ExpandableOverlay";
import { Container, Server, Play, Square, RotateCw, Terminal, Clock, Cpu, MemoryStick, Activity, Settings } from "lucide-react";

interface ServiceCardProps {
  service: ServiceInfo;
  index: number;
}

const fakeLogs = [
  "[2026-03-15 17:30:01] INFO  Service started successfully",
  "[2026-03-15 17:30:02] INFO  Listening on port 3005",
  "[2026-03-15 17:31:15] DEBUG Health check passed",
  "[2026-03-15 17:32:00] INFO  Processing 12 requests/sec",
  "[2026-03-15 17:33:45] WARN  Memory usage elevated",
  "[2026-03-15 17:34:00] INFO  GC completed, freed 45MB",
  "[2026-03-15 17:35:12] INFO  Checkpoint saved",
  "[2026-03-15 17:36:00] DEBUG Connection pool: 8/20 active",
];

export function ServiceCard({ service, index }: ServiceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const TypeIcon = service.type === "docker" ? Container : Server;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        whileHover={{ x: 2 }}
        className="glass-panel p-3 flex items-center gap-3 group cursor-pointer hover:border-border/50 transition-all duration-200"
        onClick={() => setExpanded(true)}
      >
        <div className={cn(
          "p-2 rounded-lg shrink-0 transition-colors",
          service.status === "running" ? "bg-primary/10" : service.status === "error" ? "bg-glow-danger/10" : "bg-secondary/40"
        )}>
          <TypeIcon className={cn(
            "h-4 w-4",
            service.status === "running" ? "text-primary" : service.status === "error" ? "text-glow-danger" : "text-muted-foreground"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <StatusDot status={service.status} size="sm" />
            <span className="text-sm font-medium text-foreground truncate">{service.name}</span>
            {service.port && <span className="text-[10px] mono text-muted-foreground/50">:{service.port}</span>}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] mono text-muted-foreground">{service.cpu}% cpu</span>
            <span className="text-[10px] mono text-muted-foreground">{service.memory}MB</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {service.status === "stopped" ? (
            <button className="p-1.5 rounded-lg hover:bg-glow-success/10 text-glow-success transition-colors"><Play className="h-3 w-3" /></button>
          ) : service.status === "running" ? (
            <>
              <button className="p-1.5 rounded-lg hover:bg-glow-warning/10 text-glow-warning transition-colors"><RotateCw className="h-3 w-3" /></button>
              <button className="p-1.5 rounded-lg hover:bg-glow-danger/10 text-glow-danger transition-colors"><Square className="h-3 w-3" /></button>
            </>
          ) : null}
        </div>
      </motion.div>

      <ExpandableOverlay
        isOpen={expanded}
        onClose={() => setExpanded(false)}
        title={service.name}
        subtitle={`${service.type === "docker" ? "Docker Container" : "System Service"}${service.port ? ` · Port ${service.port}` : ""}`}
        icon={<div className={cn("p-2.5 rounded-xl", service.status === "running" ? "bg-primary/10" : "bg-secondary/40")}><TypeIcon className={cn("h-5 w-5", service.status === "running" ? "text-primary" : "text-muted-foreground")} /></div>}
        statusBadge={<StatusDot status={service.status} size="md" />}
        tabs={[
          {
            id: "overview",
            label: "Overview",
            icon: <Activity className="h-3 w-3" />,
            content: (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Cpu, color: "text-primary", label: "CPU", val: `${service.cpu}%`, bar: service.cpu },
                    { icon: MemoryStick, color: "text-glow-warning", label: "Memory", val: `${service.memory}MB`, bar: Math.min(service.memory / 40.96, 100) },
                    { icon: Clock, color: "text-glow-success", label: "Uptime", val: service.uptime, bar: null },
                  ].map((m) => (
                    <div key={m.label} className="p-4 rounded-xl bg-secondary/20 border border-border/20">
                      <div className="flex items-center gap-1.5 mb-2">
                        <m.icon className={cn("h-3.5 w-3.5", m.color)} />
                        <span className="text-[10px] mono text-muted-foreground uppercase">{m.label}</span>
                      </div>
                      <p className="text-xl font-bold text-foreground mono tabular-nums">{m.val}</p>
                      {m.bar !== null && (
                        <div className="mt-2 h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(m.bar, 100)}%` }} transition={{ duration: 0.8 }} className={cn("h-full rounded-full", m.label === "CPU" ? "bg-primary" : "bg-glow-warning")} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {service.status === "running" && (
                    <>
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-lg bg-glow-warning/10 hover:bg-glow-warning/20 text-glow-warning border border-glow-warning/20 transition-colors"><RotateCw className="h-3.5 w-3.5" /> Restart</button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-lg bg-glow-danger/10 hover:bg-glow-danger/20 text-glow-danger border border-glow-danger/20 transition-colors"><Square className="h-3.5 w-3.5" /> Stop</button>
                    </>
                  )}
                  {service.status === "stopped" && (
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-lg bg-glow-success/10 hover:bg-glow-success/20 text-glow-success border border-glow-success/20 transition-colors"><Play className="h-3.5 w-3.5" /> Start</button>
                  )}
                </div>
              </div>
            ),
          },
          {
            id: "logs",
            label: "Logs",
            icon: <Terminal className="h-3 w-3" />,
            content: (
              <div className="bg-background/80 rounded-xl p-4 border border-border/20 max-h-64 overflow-y-auto font-mono">
                {fakeLogs.map((log, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      "text-[11px] leading-relaxed py-0.5",
                      log.includes("WARN") ? "text-glow-warning" : log.includes("ERROR") ? "text-glow-danger" : log.includes("DEBUG") ? "text-muted-foreground/60" : "text-muted-foreground"
                    )}
                  >
                    {log}
                  </motion.p>
                ))}
              </div>
            ),
          },
          {
            id: "config",
            label: "Config",
            icon: <Settings className="h-3 w-3" />,
            content: (
              <div className="space-y-3">
                {[
                  { key: "Container ID", val: `${service.id}-${Math.random().toString(36).slice(2, 10)}` },
                  { key: "Image", val: service.type === "docker" ? `${service.name.toLowerCase().replace(/\s/g, "-")}:latest` : "N/A" },
                  { key: "Network", val: "openclaw-bridge" },
                  { key: "Restart Policy", val: "unless-stopped" },
                  { key: "Port Mapping", val: service.port ? `${service.port}:${service.port}` : "none" },
                ].map((row) => (
                  <div key={row.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/15 border border-border/15">
                    <span className="text-[10px] mono text-muted-foreground uppercase">{row.key}</span>
                    <span className="text-xs mono text-foreground">{row.val}</span>
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
