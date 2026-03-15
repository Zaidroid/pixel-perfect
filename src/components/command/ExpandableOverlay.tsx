import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ExpandableOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function ExpandableOverlay({ isOpen, onClose, children, title }: ExpandableOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
              className="glass-panel w-full max-w-2xl max-h-[85vh] overflow-y-auto pointer-events-auto border-primary/20 shadow-[0_0_60px_-15px_hsl(var(--glow-primary)/0.15)]"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border/30 bg-card/90 backdrop-blur-sm rounded-t-lg">
                {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
                <button
                  onClick={onClose}
                  className="ml-auto p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
