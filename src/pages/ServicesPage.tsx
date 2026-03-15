import { motion } from "framer-motion";
import { services } from "@/lib/mock-data";
import { ServiceCard } from "@/components/command/ServiceCard";

const ServicesPage = () => {
  const running = services.filter((s) => s.status === "running").length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-foreground glow-text">Services</h1>
        <p className="text-sm text-muted-foreground mono mt-1">
          {running}/{services.length} running
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {services.map((service, i) => (
          <ServiceCard key={service.id} service={service} index={i} />
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
