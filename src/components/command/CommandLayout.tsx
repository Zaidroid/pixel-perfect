import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ActionBar } from "./ActionBar";
import { CommandPalette } from "./CommandPalette";
import { AnimatedBackground } from "./AnimatedBackground";

export function CommandLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full bg-background relative noise-overlay">
      <AnimatedBackground />

      {/* Top bar */}
      <header className="h-12 flex items-center justify-between px-6 backdrop-blur-xl bg-background/40 border-b border-border/20 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="relative h-2 w-2">
            <div className="absolute inset-0 rounded-full bg-primary animate-pulse-glow" />
            <div className="absolute inset-0 rounded-full bg-primary" />
          </div>
          <span className="text-[10px] mono text-muted-foreground/70 uppercase tracking-[0.25em] font-semibold">OpenClaw</span>
          <div className="hidden md:flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-md bg-secondary/30 border border-border/30">
            <div className="h-1 w-1 rounded-full bg-glow-success animate-pulse" />
            <span className="text-[9px] mono text-muted-foreground">all systems nominal</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/30 text-[11px] mono text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200"
          >
            Search anything…
            <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/60 border border-border/40 text-muted-foreground/70">⌘K</kbd>
          </button>
          <div className="flex items-center gap-2 text-[10px] mono text-muted-foreground/70">
            <div className="h-1.5 w-1.5 rounded-full bg-glow-success glow-dot-online" />
            Live
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 pb-32 relative z-10">
        <Outlet />
      </main>

      <ActionBar onOpenPalette={() => setPaletteOpen(true)} />

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenChat={() => setPaletteOpen(false)}
      />
    </div>
  );
}
