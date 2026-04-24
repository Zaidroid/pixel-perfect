import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  tabs?: { id: string; label: string; icon?: ReactNode; content: ReactNode }[];
  size?: "default" | "lg" | "xl" | "full";
  actions?: ReactNode;
  statusBadge?: ReactNode;
}

const backdropVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(20px)" },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 24, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 320, damping: 30, mass: 0.7 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 12,
    filter: "blur(6px)",
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ExpandableOverlay({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  icon,
  tabs,
  size = "default",
  actions,
  statusBadge,
}: ExpandableOverlayProps) {
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.id ?? "");
  const [isMaximized, setIsMaximized] = useState(false);

  // Reset tab when opening with new tabs
  useEffect(() => {
    if (isOpen && tabs && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
    if (!isOpen) setIsMaximized(false);
  }, [isOpen, tabs]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const sizeClasses = {
    default: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background/70"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 pointer-events-none">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "pointer-events-auto overflow-hidden rounded-2xl border border-border/40 relative",
                "bg-gradient-to-b from-card/95 via-card/90 to-card/95 backdrop-blur-2xl",
                "shadow-[0_30px_100px_-20px_hsl(var(--primary)/0.25),0_0_0_1px_hsl(var(--border)/0.5),0_30px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_0_0_hsl(0_0%_100%/0.06)]",
                isMaximized
                  ? "w-full h-full max-w-none max-h-none rounded-none"
                  : cn("w-full max-h-[88vh]", sizeClasses[size])
              )}
            >
              {/* Aurora glow inside modal */}
              <div
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                  background:
                    "radial-gradient(ellipse at top, hsl(var(--primary) / 0.12), transparent 50%), radial-gradient(ellipse at bottom right, hsl(var(--accent) / 0.08), transparent 50%)",
                }}
              />

              {/* Glow bar at top */}
              <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent relative z-10" />


              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-border/20 bg-card/80 backdrop-blur-xl">
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                    >
                      {icon}
                    </motion.div>
                  )}
                  <div className="min-w-0">
                    {title && (
                      <motion.h2
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12, duration: 0.3 }}
                        className="text-sm font-semibold text-foreground truncate"
                      >
                        {title}
                      </motion.h2>
                    )}
                    {subtitle && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[10px] mono text-muted-foreground truncate"
                      >
                        {subtitle}
                      </motion.p>
                    )}
                  </div>
                  {statusBadge && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring" }}>
                      {statusBadge}
                    </motion.div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {actions}
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all duration-200"
                  >
                    {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              {tabs && tabs.length > 0 && (
                <div className="flex items-center gap-0.5 px-5 py-2 border-b border-border/15 bg-secondary/5">
                  {tabs.map((tab, i) => (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i + 0.15 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "px-3 py-1.5 text-[11px] mono rounded-lg transition-all duration-200 flex items-center gap-1.5",
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_-3px_hsl(var(--glow-primary)/0.2)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                      )}
                    >
                      {tab.icon}
                      {tab.label}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Body */}
              <div className={cn("overflow-y-auto", isMaximized ? "h-[calc(100%-4rem)]" : "max-h-[calc(88vh-4rem)]")}>
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-5"
                >
                  <AnimatePresence mode="wait">
                    {tabs && tabs.length > 0 ? (
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {tabs.find((t) => t.id === activeTab)?.content}
                      </motion.div>
                    ) : (
                      children
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
