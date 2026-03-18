import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Bot, Server, ListTodo, Activity,
  Settings, Terminal, Zap, User, Briefcase, Search,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Bot, label: "Agents", path: "/agents" },
  { icon: Server, label: "Services", path: "/services" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: Activity, label: "Monitoring", path: "/monitoring" },
  { icon: Terminal, label: "Terminal", path: "/terminal" },
  { icon: User, label: "Personal", path: "/personal" },
  { icon: Briefcase, label: "Work", path: "/work" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface BottomDockProps {
  onOpenPalette: () => void;
}

export function BottomDock({ onOpenPalette }: BottomDockProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", duration: 0.6, bounce: 0.2, delay: 0.3 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="flex items-center gap-1 px-2 py-2 rounded-2xl bg-card/80 backdrop-blur-2xl border border-border/50 shadow-[0_8px_40px_-12px_hsl(var(--glow-primary)/0.2),0_0_0_1px_hsl(var(--border)/0.3)]">
        {/* Logo mark */}
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/15 mr-1">
          <Zap className="h-4 w-4 text-primary" />
        </div>

        <div className="w-px h-6 bg-border/30 mx-1" />

        {navItems.map((item) => {
          const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="dock-active"
                      className="absolute inset-0 rounded-xl bg-primary/12 border border-primary/20"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                  <item.icon className="h-4 w-4 relative z-10" />
                  {isActive && (
                    <motion.div
                      layoutId="dock-dot"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px] mono">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        <div className="w-px h-6 bg-border/30 mx-1" />

        {/* Search / Command Palette trigger */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenPalette}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
            >
              <Search className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px] mono">
            Search <kbd className="ml-1 text-[9px] px-1 py-0.5 rounded bg-secondary border border-border">⌘K</kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
}
