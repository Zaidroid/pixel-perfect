import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { agents } from "@/lib/mock-data";
import type { Agent } from "@/lib/mock-data";
import { MessageCircle, X, Send, ChevronDown, Bot, Zap, Wrench, LineChart, Search } from "lucide-react";
import { StatusDot } from "./StatusDot";

const roleIcons: Record<string, React.ElementType> = {
  Dispatcher: Zap, Developer: Bot, Operations: Wrench, Analyst: LineChart, Researcher: Search,
};

interface ChatMessage {
  from: "user" | "agent" | "system";
  text: string;
  timestamp: string;
}

function getTs() {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
}

interface GlobalChatProps {
  activeAgentId: string | null;
  onClose: () => void;
}

export function GlobalChat({ activeAgentId, onClose }: GlobalChatProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // When activeAgentId changes externally, select that agent
  useEffect(() => {
    if (activeAgentId) {
      const agent = agents.find((a) => a.id === activeAgentId);
      if (agent) {
        setSelectedAgent(agent);
        setMessages([
          { from: "system", text: `Connected to ${agent.name} (${agent.model})`, timestamp: getTs() },
          { from: "agent", text: `Hello! I'm ${agent.name}, your ${agent.role.toLowerCase()}. How can I assist you?`, timestamp: getTs() },
        ]);
        setShowPicker(false);
      }
    }
  }, [activeAgentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !selectedAgent) return;
    const userMsg = input;
    setMessages((p) => [...p, { from: "user", text: userMsg, timestamp: getTs() }]);
    setInput("");
    setTimeout(() => {
      setMessages((p) => [...p, { from: "agent", text: `Processing: "${userMsg}" — Mock response from ${selectedAgent.name}.`, timestamp: getTs() }]);
    }, 600);
  };

  const selectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([
      { from: "system", text: `Connected to ${agent.name} (${agent.model})`, timestamp: getTs() },
      { from: "agent", text: `Hello! I'm ${agent.name}, your ${agent.role.toLowerCase()}. How can I assist you?`, timestamp: getTs() },
    ]);
    setShowPicker(false);
  };

  const isOpen = !!activeAgentId;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          className="fixed bottom-20 right-4 z-50 w-[380px] h-[520px] flex flex-col rounded-2xl overflow-hidden glass-panel shadow-[0_8px_60px_-12px_hsl(var(--glow-primary)/0.25)] border-primary/15"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-card/80 backdrop-blur-sm">
            {selectedAgent ? (
              <>
                <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                  {(() => { const RI = roleIcons[selectedAgent.role] || Bot; return <RI className="h-4 w-4 text-primary shrink-0" />; })()}
                  <span className="text-sm font-semibold text-foreground truncate">{selectedAgent.name}</span>
                  <StatusDot status={selectedAgent.status} size="sm" />
                  <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                </button>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Select an agent...</span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Agent picker dropdown */}
          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-border/30"
              >
                <div className="p-2 space-y-0.5">
                  {agents.map((a) => {
                    const RI = roleIcons[a.role] || Bot;
                    return (
                      <button
                        key={a.id}
                        onClick={() => selectAgent(a)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors",
                          selectedAgent?.id === a.id
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                        )}
                      >
                        <RI className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-medium">{a.name}</span>
                        <span className="mono text-[10px] text-muted-foreground/50">{a.role}</span>
                        <StatusDot status={a.status} size="sm" />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn("flex", msg.from === "system" && "justify-center")}
              >
                {msg.from === "system" ? (
                  <span className="text-[10px] mono text-muted-foreground/40 bg-secondary/20 px-2 py-1 rounded">{msg.text}</span>
                ) : msg.from === "agent" ? (
                  <div className="max-w-[85%] p-3 rounded-xl rounded-tl-sm bg-secondary/50 text-xs text-foreground/90 leading-relaxed">
                    {msg.text}
                    <div className="text-[9px] mono text-muted-foreground/30 mt-1">{msg.timestamp}</div>
                  </div>
                ) : (
                  <div className="max-w-[85%] ml-auto p-3 rounded-xl rounded-tr-sm bg-primary/15 text-xs text-primary leading-relaxed border border-primary/10">
                    {msg.text}
                    <div className="text-[9px] mono text-muted-foreground/30 mt-1 text-right">{msg.timestamp}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/30 bg-card/50">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={selectedAgent ? `Message ${selectedAgent.name}...` : "Select an agent first"}
                disabled={!selectedAgent}
                className="flex-1 text-xs bg-secondary/40 border border-border/40 rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 mono disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!selectedAgent || !input.trim()}
                className="p-2.5 rounded-xl bg-primary/15 text-primary hover:bg-primary/25 transition-colors disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating chat trigger button
export function ChatTrigger({ onClick, hasActive }: { onClick: () => void; hasActive: boolean }) {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", delay: 0.5, bounce: 0.3 }}
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-40 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
        hasActive
          ? "bg-primary/20 border border-primary/30 text-primary shadow-[0_0_30px_-5px_hsl(var(--glow-primary)/0.3)]"
          : "bg-card/80 backdrop-blur-xl border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
      )}
    >
      <MessageCircle className="h-5 w-5" />
      {hasActive && (
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary glow-dot-online" />
      )}
    </motion.button>
  );
}
