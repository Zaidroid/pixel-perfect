import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ServiceInfo } from "@/lib/mock-data";
import { StatusDot } from "./StatusDot";
import { Container, Server, Play, Square, RotateCw } from "lucide-react";

interface ServiceCardProps {
  service: ServiceInfo;
  index: number;
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="glass-panel-hover p-3 flex items-center gap-3 group"
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
          {service.port && (
            <span className="text-[10px] mono text-muted-foreground/60">:{service.port}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] mono text-muted-foreground">
            CPU {service.cpu}%
          </span>
          <span className="text-[10px] mono text-muted-foreground">
            MEM {service.memory}MB
          </span>
          <span className="text-[10px] mono text-muted-foreground/60">
            {service.uptime}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {service.status === "stopped" ? (
          <button className="p-1.5 rounded hover:bg-glow-success/10 text-glow-success transition-colors">
            <Play className="h-3 w-3" />
          </button>
        ) : service.status === "running" ? (
          <>
            <button className="p-1.5 rounded hover:bg-glow-warning/10 text-glow-warning transition-colors">
              <RotateCw className="h-3 w-3" />
            </button>
            <button className="p-1.5 rounded hover:bg-glow-danger/10 text-glow-danger transition-colors">
              <Square className="h-3 w-3" />
            </button>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}
