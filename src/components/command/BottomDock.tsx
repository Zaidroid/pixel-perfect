import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Bot, Server, ListTodo,
  Settings, User, Briefcase, Search, Zap,
  MessageCircle, FolderOpen,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Bot, label: "Agents", path: "/agents" },
  { icon: Server, label: "Infrastructure", path: "/infrastructure" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: FolderOpen, label: "Projects", path: "/projects" },
  { icon: User, label: "Personal", path: "/personal" },
  { icon: Briefcase, label: "Work", path: "/work" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface BottomDockProps {
  onOpenPalette: () => void;
  onToggleChat: () => void;
  chatActive: boolean;
}

export function BottomDock({ onOpenPalette, onToggleChat, chatActive }: BottomDockProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", duration: 0.7, bounce: 0.2, delay: 0.3 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-2xl bg-card/70 backdrop-blur-2xl border border-border/40 shadow-[0_8px_50px_-12px_hsl(var(--glow-primary)/0.15),0_0_0_1px_hsl(var(--border)/0.2)]">
        {/* Logo */}
        <motion.div
          whileHover={{ rotate: 180, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/12 mr-0.5 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Zap className="h-3.5 w-3.5 text-primary" />
        </motion.div>

        <div className="w-px h-5 bg-border/20 mx-0.5" />

        {/* Nav items with macOS-dock-style magnification */}
        {navItems.map((item, idx) => {
          const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
          const dist = hoveredIdx !== null ? Math.abs(idx - hoveredIdx) : Infinity;
          const scale = dist === 0 ? 1.25 : dist === 1 ? 1.1 : 1;
          const translateY = dist === 0 ? -6 : dist === 1 ? -2 : 0;

          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => navigate(item.path)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  animate={{
                    scale,
                    y: translateY,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={cn(
                    "relative flex items-center justify-center w-8 h-8 rounded-xl transition-colors duration-150",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="dock-active"
                      className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                  <item.icon className="h-4 w-4 relative z-10" />
                  {isActive && (
                    <motion.div
                      layoutId="dock-dot"
                      className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px] mono px-2 py-1">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        <div className="w-px h-5 bg-border/20 mx-0.5" />

        {/* Search */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onOpenPalette}
              className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all">
              <Search className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[10px] mono px-2 py-1">
            Search <kbd className="ml-1 text-[8px] px-1 py-0.5 rounded bg-secondary border border-border">⌘K</kbd>
          </TooltipContent>
        </Tooltip>

        {/* Chat toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={onToggleChat}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-xl transition-all",
                chatActive
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
              )}
            >
              <MessageCircle className="h-4 w-4" />
              {chatActive && (
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[10px] mono px-2 py-1">
            Agent Chat
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
}
