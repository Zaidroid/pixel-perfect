import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { agents, services, tasks } from "@/lib/mock-data";
import {
  Search, LayoutDashboard, Bot, Server, ListTodo, Activity,
  Terminal, Settings, User, Briefcase, ArrowRight, Zap, Wrench,
  LineChart, MessageCircle,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (agentId: string) => void;
}

interface PaletteItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
}

const roleIcons: Record<string, React.ElementType> = {
  Dispatcher: Zap, Developer: Bot, Operations: Wrench, Analyst: LineChart, Researcher: Search,
};

export function CommandPalette({ isOpen, onClose, onOpenChat }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const go = useCallback((path: string) => { navigate(path); onClose(); }, [navigate, onClose]);

  const items: PaletteItem[] = [
    // Pages
    { id: "nav-dash", label: "Dashboard", description: "System overview", icon: LayoutDashboard, action: () => go("/"), category: "Navigate" },
    { id: "nav-agents", label: "Agents", description: "Agent fleet management", icon: Bot, action: () => go("/agents"), category: "Navigate" },
    { id: "nav-services", label: "Services", description: "Running services", icon: Server, action: () => go("/services"), category: "Navigate" },
    { id: "nav-tasks", label: "Tasks", description: "Kanban board", icon: ListTodo, action: () => go("/tasks"), category: "Navigate" },
    { id: "nav-monitoring", label: "Monitoring", description: "System metrics", icon: Activity, action: () => go("/monitoring"), category: "Navigate" },
    { id: "nav-terminal", label: "Terminal", description: "Command interface", icon: Terminal, action: () => go("/terminal"), category: "Navigate" },
    { id: "nav-personal", label: "Personal", description: "Personal workspace", icon: User, action: () => go("/personal"), category: "Navigate" },
    { id: "nav-work", label: "Work", description: "Work projects", icon: Briefcase, action: () => go("/work"), category: "Navigate" },
    { id: "nav-settings", label: "Settings", description: "Configuration", icon: Settings, action: () => go("/settings"), category: "Navigate" },
    // Agents
    ...agents.map((a) => ({
      id: `agent-${a.id}`,
      label: a.name,
      description: `${a.role} · ${a.model} · ${a.status}`,
      icon: roleIcons[a.role] || Bot,
      action: () => { onOpenChat(a.id); onClose(); },
      category: "Chat with Agent",
    })),
    // Tasks
    ...tasks.slice(0, 6).map((t) => ({
      id: `task-${t.id}`,
      label: t.title,
      description: `${t.priority} · ${t.assignee} · ${t.status.replace("_", " ")}`,
      icon: ListTodo,
      action: () => go("/tasks"),
      category: "Tasks",
    })),
  ];

  const filtered = query.trim()
    ? items.filter((i) => `${i.label} ${i.description} ${i.category}`.toLowerCase().includes(query.toLowerCase()))
    : items;

  const grouped = filtered.reduce<Record<string, PaletteItem[]>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  useEffect(() => { setSelectedIndex(0); }, [query]);
  useEffect(() => { if (isOpen) setQuery(""); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
      else if (e.key === "Enter" && filtered[selectedIndex]) { filtered[selectedIndex].action(); }
      else if (e.key === "Escape") { onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, filtered, selectedIndex, onClose]);

  let flatIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-md"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
              className="w-full max-w-lg pointer-events-auto glass-panel overflow-hidden shadow-[0_0_80px_-20px_hsl(var(--glow-primary)/0.2)]"
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands, agents, tasks..."
                  className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
                <kbd className="text-[9px] mono text-muted-foreground/50 px-1.5 py-0.5 rounded bg-secondary/50 border border-border/30">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[360px] overflow-y-auto py-2">
                {Object.keys(grouped).length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">No results found</div>
                )}
                {Object.entries(grouped).map(([category, categoryItems]) => (
                  <div key={category}>
                    <div className="px-4 py-1.5 text-[10px] mono text-muted-foreground/50 uppercase tracking-widest">{category}</div>
                    {categoryItems.map((item) => {
                      const thisIndex = flatIndex++;
                      const isSelected = thisIndex === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(thisIndex)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isSelected ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <item.icon className={cn("h-4 w-4 shrink-0", isSelected && "text-primary")} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.label}</p>
                            <p className="text-[10px] mono text-muted-foreground/60 truncate">{item.description}</p>
                          </div>
                          {isSelected && <ArrowRight className="h-3 w-3 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-border/30 text-[10px] mono text-muted-foreground/40">
                <span><kbd className="px-1 py-0.5 rounded bg-secondary/50 border border-border/30 mr-1">↑↓</kbd> navigate</span>
                <span><kbd className="px-1 py-0.5 rounded bg-secondary/50 border border-border/30 mr-1">↵</kbd> select</span>
                <span><kbd className="px-1 py-0.5 rounded bg-secondary/50 border border-border/30 mr-1">esc</kbd> close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
