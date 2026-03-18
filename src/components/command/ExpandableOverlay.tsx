import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  tabs?: { id: string; label: string; content: ReactNode }[];
  size?: "default" | "lg" | "xl";
  actions?: ReactNode;
}

export function ExpandableOverlay({ isOpen, onClose, children, title, tabs, size = "default", actions }: ExpandableOverlayProps) {
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.id ?? "");
  const [isMaximized, setIsMaximized] = useState(false);

  const sizeClasses = {
    default: "max-w-2xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.12 }}
              className={cn(
                "pointer-events-auto overflow-hidden rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/40 shadow-[0_0_80px_-20px_hsl(var(--glow-primary)/0.15),0_25px_50px_-12px_rgba(0,0,0,0.5)]",
                isMaximized
                  ? "w-full h-full max-w-none max-h-none"
                  : cn("w-full max-h-[85vh]", sizeClasses[size])
              )}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-border/30 bg-card/90 backdrop-blur-xl">
                <div className="flex items-center gap-3 min-w-0">
                  {title && (
                    <motion.h2
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm font-semibold text-foreground truncate"
                    >
                      {title}
                    </motion.h2>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {actions}
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              {tabs && tabs.length > 0 && (
                <div className="flex items-center gap-1 px-5 py-2 border-b border-border/20 bg-secondary/10">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "px-3 py-1.5 text-[11px] mono rounded-lg transition-all duration-200",
                        activeTab === tab.id
                          ? "bg-primary/12 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Body */}
              <div className={cn("overflow-y-auto", isMaximized ? "h-[calc(100%-3.5rem)]" : "max-h-[calc(85vh-3.5rem)]")}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="p-5"
                >
                  {tabs && tabs.length > 0
                    ? tabs.find((t) => t.id === activeTab)?.content
                    : children
                  }
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
