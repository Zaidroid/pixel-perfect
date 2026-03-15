import { motion } from "framer-motion";
import { Cpu, MemoryStick, HardDrive, Wifi, Gauge } from "lucide-react";
import { MetricCard } from "@/components/command/MetricCard";
import { AgentOrb } from "@/components/command/AgentOrb";
import { EventFeed } from "@/components/command/EventFeed";
import { ServiceCard } from "@/components/command/ServiceCard";
import { TaskList } from "@/components/command/TaskList";
import { agents, services, systemMetrics } from "@/lib/mock-data";

const Dashboard = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold font-display text-foreground glow-text">
          Command Center
        </h1>
        <p className="text-sm text-muted-foreground mono mt-1">
          System overview · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </p>
      </motion.div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard label="CPU" value={systemMetrics.cpu} unit="%" icon={Cpu} color={systemMetrics.cpu > 80 ? "danger" : systemMetrics.cpu > 50 ? "warning" : "primary"} delay={0} />
        <MetricCard label="Memory" value={systemMetrics.memory} unit="%" icon={MemoryStick} color={systemMetrics.memory > 80 ? "danger" : systemMetrics.memory > 60 ? "warning" : "success"} delay={0.05} />
        <MetricCard label="Disk" value={systemMetrics.disk} unit="%" icon={HardDrive} color="primary" delay={0.1} />
        <MetricCard label="Network In" value={systemMetrics.network.in} unit="MB/s" icon={Wifi} color="primary" delay={0.15} />
        <MetricCard label="Swap" value={systemMetrics.swap} unit="%" icon={Gauge} color="success" delay={0.2} />
      </div>

      {/* Agents Constellation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-foreground">Agent Fleet</h2>
          <span className="text-[10px] mono text-glow-success">
            {agents.filter((a) => a.status === "online").length}/{agents.length} online
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {agents.map((agent, i) => (
            <AgentOrb key={agent.id} agent={agent} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Services */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-foreground">Services</h2>
            <span className="text-[10px] mono text-glow-success">
              {services.filter((s) => s.status === "running").length}/{services.length} running
            </span>
          </div>
          <div className="space-y-2">
            {services.slice(0, 6).map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        </div>

        {/* Events */}
        <div className="lg:col-span-1">
          <EventFeed />
        </div>

        {/* Tasks */}
        <div className="lg:col-span-1">
          <TaskList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
