import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { BottomDock } from "./BottomDock";
import { CommandPalette } from "./CommandPalette";
import { GlobalChat, ChatTrigger } from "./GlobalChat";

export function CommandLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [chatAgentId, setChatAgentId] = useState<string | null>(null);
  const [chatVisible, setChatVisible] = useState(false);

  // Global Cmd+K shortcut
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

  const openChat = useCallback((agentId: string) => {
    setChatAgentId(agentId);
    setChatVisible(true);
  }, []);

  const closeChat = useCallback(() => {
    setChatVisible(false);
    setChatAgentId(null);
  }, []);

  const toggleChat = useCallback(() => {
    if (chatVisible) {
      closeChat();
    } else {
      // Open with no specific agent — user picks from dropdown
      setChatAgentId("fawwaz"); // default to first agent
      setChatVisible(true);
    }
  }, [chatVisible, closeChat]);

  return (
    <div className="min-h-screen flex flex-col w-full bg-background grid-bg">
      {/* Top bar — minimal */}
      <header className="h-10 flex items-center justify-between px-5 backdrop-blur-sm bg-background/60 border-b border-border/20 sticky top-0 z-30">
        <div className="flex items-center gap-2 text-[10px] mono text-muted-foreground/50 uppercase tracking-widest">
          OpenClaw
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-secondary/30 border border-border/30 text-[11px] mono text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors"
          >
            Search...
            <kbd className="text-[9px] px-1 py-0.5 rounded bg-secondary/50 border border-border/30">⌘K</kbd>
          </button>
          <div className="flex items-center gap-2 text-[10px] mono text-muted-foreground uppercase tracking-wider">
            <div className="h-1.5 w-1.5 rounded-full bg-glow-success glow-dot-online animate-pulse" />
            Live
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom dock navigation */}
      <BottomDock onOpenPalette={() => setPaletteOpen(true)} />

      {/* Command palette */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenChat={openChat}
      />

      {/* Global chat */}
      {!chatVisible && <ChatTrigger onClick={toggleChat} hasActive={false} />}
      <GlobalChat
        activeAgentId={chatVisible ? chatAgentId : null}
        onClose={closeChat}
      />
    </div>
  );
}
