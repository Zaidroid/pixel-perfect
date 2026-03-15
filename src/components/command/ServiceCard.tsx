import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ServiceInfo } from "@/lib/mock-data";
import { StatusDot } from "./StatusDot";
import { ExpandableOverlay } from "./ExpandableOverlay";
import { Container, Server, Play, Square, RotateCw, Terminal, Clock, Cpu, MemoryStick } from "lucide-react";

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
];

export function ServiceCard({ service, index }: ServiceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="glass-panel-hover p-3 flex items-center gap-3 group cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        <div className="p-2 rounded-md bg-secondary/50 shrink-0">
          {service.type === "docker" ? (
            <Container className="h-4 w-4 text-primary" />
          ) : (
            <Server className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <StatusDot status={service.status} size="sm" />
            <span className="text-sm font-medium text-foreground truncate">{service.name}</span>
            {service.port && <span className="text-[10px] mono text-muted-foreground/60">:{service.port}</span>}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] mono text-muted-foreground">CPU {service.cpu}%</span>
            <span className="text-[10px] mono text-muted-foreground">MEM {service.memory}MB</span>
            <span className="text-[10px] mono text-muted-foreground/60">{service.uptime}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {service.status === "stopped" ? (
            <button className="p-1.5 rounded hover:bg-glow-success/10 text-glow-success transition-colors"><Play className="h-3 w-3" /></button>
          ) : service.status === "running" ? (
            <>
              <button className="p-1.5 rounded hover:bg-glow-warning/10 text-glow-warning transition-colors"><RotateCw className="h-3 w-3" /></button>
              <button className="p-1.5 rounded hover:bg-glow-danger/10 text-glow-danger transition-colors"><Square className="h-3 w-3" /></button>
            </>
          ) : null}
        </div>
      </motion.div>

      <ExpandableOverlay isOpen={expanded} onClose={() => setExpanded(false)} title={service.name}>
        <div className="space-y-5">
          {/* Status header */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              {service.type === "docker" ? <Container className="h-6 w-6 text-primary" /> : <Server className="h-6 w-6 text-muted-foreground" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <StatusDot status={service.status} size="md" />
                <span className="text-lg font-semibold text-foreground">{service.name}</span>
              </div>
              <p className="text-xs mono text-muted-foreground mt-0.5">
                {service.type === "docker" ? "Docker Container" : "System Service"} {service.port ? `· Port ${service.port}` : ""}
              </p>
            </div>
          </div>

          {/* Resource meters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-md bg-secondary/30 border border-border/30">
              <div className="flex items-center gap-1.5 mb-2">
                <Cpu className="h-3 w-3 text-primary" />
                <span className="text-[10px] mono text-muted-foreground uppercase">CPU</span>
              </div>
              <p className="text-xl font-semibold text-foreground mono">{service.cpu}%</p>
              <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(service.cpu, 100)}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-primary" />
              </div>
            </div>
            <div className="p-3 rounded-md bg-secondary/30 border border-border/30">
              <div className="flex items-center gap-1.5 mb-2">
                <MemoryStick className="h-3 w-3 text-glow-warning" />
                <span className="text-[10px] mono text-muted-foreground uppercase">Memory</span>
              </div>
              <p className="text-xl font-semibold text-foreground mono">{service.memory}<span className="text-xs text-muted-foreground">MB</span></p>
            </div>
            <div className="p-3 rounded-md bg-secondary/30 border border-border/30">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="h-3 w-3 text-glow-success" />
                <span className="text-[10px] mono text-muted-foreground uppercase">Uptime</span>
              </div>
              <p className="text-xl font-semibold text-foreground mono">{service.uptime}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {service.status === "running" && (
              <>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-md bg-glow-warning/10 hover:bg-glow-warning/20 text-glow-warning border border-glow-warning/20 transition-colors">
                  <RotateCw className="h-3.5 w-3.5" /> Restart
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-md bg-glow-danger/10 hover:bg-glow-danger/20 text-glow-danger border border-glow-danger/20 transition-colors">
                  <Square className="h-3.5 w-3.5" /> Stop
                </button>
              </>
            )}
            {service.status === "stopped" && (
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-md bg-glow-success/10 hover:bg-glow-success/20 text-glow-success border border-glow-success/20 transition-colors">
                <Play className="h-3.5 w-3.5" /> Start
              </button>
            )}
          </div>

          {/* Logs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] mono text-muted-foreground uppercase tracking-wider">Recent Logs</span>
            </div>
            <div className="bg-background/80 rounded-md p-3 border border-border/30 max-h-40 overflow-y-auto">
              {fakeLogs.map((log, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "text-[11px] mono leading-relaxed",
                    log.includes("WARN") ? "text-glow-warning" : log.includes("ERROR") ? "text-glow-danger" : "text-muted-foreground"
                  )}
                >
                  {log}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </ExpandableOverlay>
    </>
  );
}
