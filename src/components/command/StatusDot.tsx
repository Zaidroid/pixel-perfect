import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: "online" | "idle" | "offline" | "error" | "running" | "stopped" | "restarting";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const statusColors: Record<string, string> = {
  online: "bg-glow-success glow-dot-online",
  running: "bg-glow-success glow-dot-online",
  idle: "bg-glow-warning glow-dot-warning",
  restarting: "bg-glow-warning glow-dot-warning",
  offline: "bg-muted-foreground",
  stopped: "bg-muted-foreground",
  error: "bg-glow-danger glow-dot-danger",
};

const sizes = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-3 w-3",
};

export function StatusDot({ status, size = "md", pulse = true }: StatusDotProps) {
  return (
    <span className="relative flex items-center justify-center">
      <span className={cn("rounded-full", sizes[size], statusColors[status])} />
      {pulse && (status === "online" || status === "running") && (
        <span className={cn("absolute rounded-full animate-pulse-ring", sizes[size], "bg-glow-success/40")} />
      )}
    </span>
  );
}
