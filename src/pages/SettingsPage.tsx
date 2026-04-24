import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Settings, Bell, Shield, Palette, Globe, Database, Save, RotateCw, ChevronRight, Check, Moon, Sun, Monitor } from "lucide-react";
import { useTheme, ACCENTS, type ThemeMode } from "@/components/theme/ThemeProvider";

interface SettingToggle {
  label: string;
  description: string;
  enabled: boolean;
  key: string;
}

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("general");
  const [saved, setSaved] = useState(false);
  const { mode, setMode, accent, setAccent, resolved } = useTheme();

  const [toggles, setToggles] = useState<SettingToggle[]>([
    { key: "auto_dispatch", label: "Auto-dispatch tasks", description: "Automatically assign incoming tasks to the best available agent", enabled: true },
    { key: "heartbeat", label: "Agent heartbeat monitoring", description: "Send periodic health checks to all agents", enabled: true },
    { key: "auto_restart", label: "Auto-restart failed services", description: "Automatically restart services that exit unexpectedly", enabled: false },
    { key: "email_notify", label: "Email notifications", description: "Send email alerts for critical events", enabled: true },
    { key: "slack_notify", label: "Slack notifications", description: "Post alerts to configured Slack channels", enabled: false },
    { key: "audit_log", label: "Audit logging", description: "Log all administrative actions for compliance", enabled: true },
  ]);

  const [configs, setConfigs] = useState({
    serverName: "OpenClaw Command Center",
    apiEndpoint: "http://192.168.0.118:3005",
    heartbeatInterval: "30",
    maxRetries: "3",
    logRetention: "30",
    timezone: "Asia/Riyadh",
  });

  const sections = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "integrations", label: "Integrations", icon: Globe },
    { id: "database", label: "Database", icon: Database },
  ];

  const handleToggle = (key: string) => {
    setToggles((prev) => prev.map((t) => (t.key === key ? { ...t, enabled: !t.enabled } : t)));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-foreground glow-text">Settings</h1>
        <p className="text-sm text-muted-foreground mono mt-1">System configuration</p>
      </motion.div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar nav */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-56 shrink-0"
        >
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-colors text-left",
                  activeSection === s.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                )}
              >
                <s.icon className="h-4 w-4 shrink-0" />
                {s.label}
                {activeSection === s.id && <ChevronRight className="h-3 w-3 ml-auto" />}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 space-y-6"
        >
          {activeSection === "general" && (
            <>
              <div className="glass-panel p-5 space-y-4">
                <h2 className="text-sm font-semibold text-foreground">Server Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "serverName", label: "Server Name", placeholder: "OpenClaw Command Center" },
                    { key: "apiEndpoint", label: "API Endpoint", placeholder: "http://..." },
                    { key: "heartbeatInterval", label: "Heartbeat Interval (s)", placeholder: "30" },
                    { key: "maxRetries", label: "Max Retries", placeholder: "3" },
                    { key: "logRetention", label: "Log Retention (days)", placeholder: "30" },
                    { key: "timezone", label: "Timezone", placeholder: "UTC" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-[10px] mono text-muted-foreground uppercase tracking-wider block mb-1.5">{field.label}</label>
                      <input
                        value={configs[field.key as keyof typeof configs]}
                        onChange={(e) => setConfigs((p) => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full text-xs bg-secondary/50 border border-border/50 rounded-md px-3 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-5 space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Automation</h2>
                {toggles.slice(0, 3).map((toggle) => (
                  <div key={toggle.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                    <div>
                      <p className="text-xs font-medium text-foreground">{toggle.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{toggle.description}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(toggle.key)}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-colors shrink-0",
                        toggle.enabled ? "bg-primary/30" : "bg-secondary"
                      )}
                    >
                      <motion.div
                        animate={{ x: toggle.enabled ? 20 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={cn(
                          "absolute top-0.5 h-4 w-4 rounded-full",
                          toggle.enabled ? "bg-primary" : "bg-muted-foreground"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === "notifications" && (
            <div className="glass-panel p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Notification Channels</h2>
              {toggles.filter((t) => t.key.includes("notify")).map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                  <div>
                    <p className="text-xs font-medium text-foreground">{toggle.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{toggle.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(toggle.key)}
                    className={cn(
                      "relative w-10 h-5 rounded-full transition-colors shrink-0",
                      toggle.enabled ? "bg-primary/30" : "bg-secondary"
                    )}
                  >
                    <motion.div
                      animate={{ x: toggle.enabled ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full",
                        toggle.enabled ? "bg-primary" : "bg-muted-foreground"
                      )}
                    />
                  </button>
                </div>
              ))}
              <div className="mt-4 p-4 rounded-lg bg-secondary/20 border border-border/30">
                <p className="text-[10px] mono text-muted-foreground uppercase tracking-wider mb-2">Alert Severity Filter</p>
                <div className="flex gap-2">
                  {["Critical", "Warning", "Info"].map((level) => (
                    <button key={level} className="px-3 py-1.5 text-[10px] mono rounded-md bg-secondary/50 border border-border/30 text-foreground hover:bg-secondary transition-colors">
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="glass-panel p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Security & Access</h2>
              {toggles.filter((t) => t.key === "audit_log").map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                  <div>
                    <p className="text-xs font-medium text-foreground">{toggle.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{toggle.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(toggle.key)}
                    className={cn(
                      "relative w-10 h-5 rounded-full transition-colors shrink-0",
                      toggle.enabled ? "bg-primary/30" : "bg-secondary"
                    )}
                  >
                    <motion.div
                      animate={{ x: toggle.enabled ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full",
                        toggle.enabled ? "bg-primary" : "bg-muted-foreground"
                      )}
                    />
                  </button>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { label: "API Keys", value: "3 active" },
                  { label: "Last Login", value: "Today 09:12" },
                  { label: "Failed Attempts", value: "0 (24h)" },
                  { label: "2FA", value: "Enabled" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-md bg-secondary/30 border border-border/30">
                    <p className="text-[10px] mono text-muted-foreground uppercase">{item.label}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="glass-panel p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Theme</h2>
              <div className="flex gap-3">
                {[
                  { label: "Dark", icon: Moon, active: true },
                  { label: "Light", icon: Sun, active: false },
                  { label: "System", icon: Monitor, active: false },
                ].map((theme) => (
                  <button
                    key={theme.label}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                      theme.active
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-secondary/20 border-border/30 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <theme.icon className="h-5 w-5" />
                    <span className="text-xs mono">{theme.label}</span>
                    {theme.active && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-[10px] mono text-muted-foreground uppercase tracking-wider mb-3">Accent Color</p>
                <div className="flex gap-2">
                  {[
                    { color: "bg-[hsl(185,80%,55%)]", active: true },
                    { color: "bg-[hsl(260,70%,60%)]", active: false },
                    { color: "bg-[hsl(155,75%,50%)]", active: false },
                    { color: "bg-[hsl(38,92%,55%)]", active: false },
                    { color: "bg-[hsl(340,75%,55%)]", active: false },
                  ].map((c, i) => (
                    <button
                      key={i}
                      className={cn(
                        "h-8 w-8 rounded-full transition-transform",
                        c.color,
                        c.active ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "integrations" && (
            <div className="glass-panel p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Connected Services</h2>
              {[
                { name: "Ollama", status: "Connected", endpoint: "localhost:11434" },
                { name: "n8n Workflows", status: "Connected", endpoint: "localhost:5678" },
                { name: "Obsidian", status: "Synced", endpoint: "Local vault" },
                { name: "Telegram Bot", status: "Active", endpoint: "@OpenClawBot" },
                { name: "Slack", status: "Disconnected", endpoint: "—" },
              ].map((svc) => (
                <div key={svc.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors">
                  <div>
                    <p className="text-xs font-medium text-foreground">{svc.name}</p>
                    <p className="text-[10px] mono text-muted-foreground mt-0.5">{svc.endpoint}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] mono font-semibold px-2 py-1 rounded",
                    svc.status === "Disconnected"
                      ? "bg-glow-danger/15 text-glow-danger"
                      : "bg-glow-success/15 text-glow-success"
                  )}>
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeSection === "database" && (
            <div className="glass-panel p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Database</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Engine", value: "PostgreSQL 16" },
                  { label: "Size", value: "2.4 GB" },
                  { label: "Tables", value: "24" },
                  { label: "Connections", value: "8 / 100" },
                  { label: "Cache Hit", value: "98.7%" },
                  { label: "Last Backup", value: "2 hrs ago" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-md bg-secondary/30 border border-border/30">
                    <p className="text-[10px] mono text-muted-foreground uppercase">{item.label}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/30 transition-colors">
                  <RotateCw className="h-3 w-3" /> Run Backup
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/30 transition-colors">
                  <Database className="h-3 w-3" /> Optimize
                </button>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-xs rounded-md transition-all border",
                saved
                  ? "bg-glow-success/15 border-glow-success/30 text-glow-success"
                  : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              )}
            >
              {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              {saved ? "Saved" : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
