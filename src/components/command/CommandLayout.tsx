import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { BottomDock } from "./BottomDock";
import { CommandPalette } from "./CommandPalette";
import { GlobalChat, ChatTrigger } from "./GlobalChat";
import { AnimatedBackground } from "./AnimatedBackground";

export function CommandLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [chatAgentId, setChatAgentId] = useState<string | null>(null);
  const [chatVisible, setChatVisible] = useState(false);

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
      setChatAgentId("fawwaz");
      setChatVisible(true);
    }
  }, [chatVisible, closeChat]);

  return (
    <div className="min-h-screen flex flex-col w-full bg-background relative">
      <AnimatedBackground />

      {/* Top bar */}
      <header className="h-11 flex items-center justify-between px-5 backdrop-blur-md bg-background/50 border-b border-border/15 sticky top-0 z-30 relative">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-[10px] mono text-muted-foreground/60 uppercase tracking-[0.2em] font-medium">OpenClaw</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-secondary/20 border border-border/20 text-[11px] mono text-muted-foreground hover:text-foreground hover:border-border/40 transition-all duration-200"
          >
            Search...
            <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/40 border border-border/20 text-muted-foreground/60">⌘K</kbd>
          </button>
          <div className="flex items-center gap-2 text-[10px] mono text-muted-foreground/60">
            <div className="h-1.5 w-1.5 rounded-full bg-glow-success" />
            Live
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 relative z-10">
        <Outlet />
      </main>

      <BottomDock onOpenPalette={() => setPaletteOpen(true)} />

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenChat={openChat}
      />

      {!chatVisible && <ChatTrigger onClick={toggleChat} hasActive={false} />}
      <GlobalChat
        activeAgentId={chatVisible ? chatAgentId : null}
        onClose={closeChat}
      />
    </div>
  );
}
