import { motion } from "framer-motion";
import { Cpu, MemoryStick, HardDrive, Wifi, Gauge, ArrowUpRight, Activity, Sparkles } from "lucide-react";
import { MetricCard } from "@/components/command/MetricCard";
import { AgentOrb } from "@/components/command/AgentOrb";
import { EventFeed } from "@/components/command/EventFeed";
import { ServiceCard } from "@/components/command/ServiceCard";
import { TaskList } from "@/components/command/TaskList";
import { agents, services, systemMetrics } from "@/lib/mock-data";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 220, damping: 24 } },
};

const Dashboard = () => {
  const onlineCount = agents.filter((a) => a.status === "online").length;
  const runningCount = services.filter((s) => s.status === "running").length;
  const now = new Date();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1480px] mx-auto"
    >
      {/* Hero header */}
      <motion.div variants={item} className="relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-primary blur-xl opacity-50" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="gradient-text">Command</span>
                <span className="text-foreground"> Center</span>
              </h1>
              <p className="text-[11px] mono text-muted-foreground/70 mt-1 uppercase tracking-wider">
                {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                <span className="mx-2 text-border">/</span>
                {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatPill
              icon={<div className="h-1.5 w-1.5 rounded-full bg-glow-success glow-dot-online" />}
              label={`${onlineCount} agents online`}
              tone="success"
            />
            <StatPill
              icon={<Activity className="h-3 w-3" />}
              label={`${runningCount} services`}
              tone="primary"
            />
            <StatPill
              icon={<div className="h-1.5 w-1.5 rounded-full bg-glow-warning animate-pulse" />}
              label="2 alerts"
              tone="warning"
            />
          </div>
        </div>
      </motion.div>

      {/* Metrics row */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard label="CPU" value={systemMetrics.cpu} unit="%" icon={Cpu} color={systemMetrics.cpu > 80 ? "danger" : systemMetrics.cpu > 50 ? "warning" : "primary"} delay={0} />
        <MetricCard label="Memory" value={systemMetrics.memory} unit="%" icon={MemoryStick} color={systemMetrics.memory > 80 ? "danger" : systemMetrics.memory > 60 ? "warning" : "success"} delay={0.04} />
        <MetricCard label="Disk" value={systemMetrics.disk} unit="%" icon={HardDrive} color="primary" delay={0.08} />
        <MetricCard label="Network" value={systemMetrics.network.in} unit="MB/s" icon={Wifi} color="primary" delay={0.12} />
        <MetricCard label="Swap" value={systemMetrics.swap} unit="%" icon={Gauge} color="success" delay={0.16} />
      </motion.div>

      {/* Agent fleet */}
      <motion.div variants={item}>
        <SectionHeader
          title="Agent Fleet"
          meta={`${onlineCount}/${agents.length} online`}
          href="/agents"
          ctaLabel="View all"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {agents.map((agent, i) => (
            <AgentOrb key={agent.id} agent={agent} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Three column grid */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="flex flex-col">
          <SectionHeader
            title="Services"
            meta={`${runningCount}/${services.length}`}
            href="/infrastructure"
            ctaLabel="Manage"
          />
          <div className="space-y-1.5">
            {services.slice(0, 5).map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <EventFeed />
        </div>

        <div className="flex flex-col">
          <TaskList />
        </div>
      </motion.div>
    </motion.div>
  );
};

function StatPill({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: "success" | "primary" | "warning" }) {
  const toneClasses = {
    success: "bg-glow-success/10 border-glow-success/25 text-glow-success",
    primary: "bg-primary/10 border-primary/25 text-primary",
    warning: "bg-glow-warning/10 border-glow-warning/25 text-glow-warning",
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${toneClasses[tone]}`}>
      {icon}
      <span className="text-[10px] mono font-medium">{label}</span>
    </div>
  );
}

function SectionHeader({ title, meta, href, ctaLabel }: { title: string; meta: string; href: string; ctaLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <div className="h-3 w-0.5 rounded-full bg-gradient-to-b from-primary to-primary/30" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-[10px] mono text-muted-foreground/70">{meta}</span>
      </div>
      <a href={href} className="flex items-center gap-1 text-[10px] mono text-primary hover:text-primary-glow transition-colors group">
        {ctaLabel}
        <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    </div>
  );
}

export default Dashboard;
