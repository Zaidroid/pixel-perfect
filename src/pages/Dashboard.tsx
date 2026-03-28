import { motion } from "framer-motion";
import { Cpu, MemoryStick, HardDrive, Wifi, Gauge, ArrowUpRight, Activity } from "lucide-react";
import { MetricCard } from "@/components/command/MetricCard";
import { AgentOrb } from "@/components/command/AgentOrb";
import { EventFeed } from "@/components/command/EventFeed";
import { ServiceCard } from "@/components/command/ServiceCard";
import { TaskList } from "@/components/command/TaskList";
import { agents, services, systemMetrics } from "@/lib/mock-data";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
};

const Dashboard = () => {
  const onlineCount = agents.filter((a) => a.status === "online").length;
  const runningCount = services.filter((s) => s.status === "running").length;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1440px] mx-auto"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Command Center
          </h1>
          <p className="text-xs text-muted-foreground mono mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-glow-success/10 border border-glow-success/20">
            <div className="h-1.5 w-1.5 rounded-full bg-glow-success" />
            <span className="text-[10px] mono text-glow-success">{onlineCount} agents online</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Activity className="h-3 w-3 text-primary" />
            <span className="text-[10px] mono text-primary">{runningCount} services</span>
          </div>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard label="CPU" value={systemMetrics.cpu} unit="%" icon={Cpu} color={systemMetrics.cpu > 80 ? "danger" : systemMetrics.cpu > 50 ? "warning" : "primary"} delay={0} />
        <MetricCard label="Memory" value={systemMetrics.memory} unit="%" icon={MemoryStick} color={systemMetrics.memory > 80 ? "danger" : systemMetrics.memory > 60 ? "warning" : "success"} delay={0.04} />
        <MetricCard label="Disk" value={systemMetrics.disk} unit="%" icon={HardDrive} color="primary" delay={0.08} />
        <MetricCard label="Network" value={systemMetrics.network.in} unit="MB/s" icon={Wifi} color="primary" delay={0.12} />
        <MetricCard label="Swap" value={systemMetrics.swap} unit="%" icon={Gauge} color="success" delay={0.16} />
      </motion.div>

      {/* Agent Fleet */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Agent Fleet</h2>
            <span className="text-[10px] mono text-muted-foreground">{onlineCount}/{agents.length} online</span>
          </div>
          <a href="/agents" className="flex items-center gap-1 text-[10px] mono text-primary hover:text-primary/80 transition-colors">
            View all <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {agents.map((agent, i) => (
            <AgentOrb key={agent.id} agent={agent} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Three Column Grid */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Services */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Services</h2>
              <span className="text-[10px] mono text-muted-foreground">{runningCount}/{services.length}</span>
            </div>
            <a href="/services" className="flex items-center gap-1 text-[10px] mono text-primary hover:text-primary/80 transition-colors">
              Manage <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <div className="space-y-1.5 flex-1">
            {services.slice(0, 5).map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        </div>

        {/* Events */}
        <div className="flex flex-col min-h-0">
          <EventFeed />
        </div>

        {/* Tasks */}
        <div className="flex flex-col min-h-0">
          <TaskList />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
