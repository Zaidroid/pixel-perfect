export interface Agent {
  id: string;
  name: string;
  role: string;
  status: "online" | "idle" | "offline" | "error";
  model: string;
  fallbackModel: string;
  modelType: "FREE" | "PAID";
  lastActivity: string;
  tasksCompleted: number;
  responseTime: number;
  errorRate: number;
  uptime: number;
  avatar: string;
}

export interface ServiceInfo {
  id: string;
  name: string;
  status: "running" | "stopped" | "error" | "restarting";
  type: "docker" | "system";
  cpu: number;
  memory: number;
  uptime: string;
  port?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority: "P0" | "P1" | "P2" | "P3";
  assignee: string;
  project: string;
  deadline: string;
  category: string;
}

export interface SystemEvent {
  id: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  source: string;
  timestamp: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: { in: number; out: number };
  swap: number;
}

export const agents: Agent[] = [
  { id: "fawwaz", name: "Fawwaz", role: "Dispatcher", status: "online", model: "GPT-4o", fallbackModel: "Claude 3.5", modelType: "PAID", lastActivity: "2 min ago", tasksCompleted: 142, responseTime: 1.2, errorRate: 0.3, uptime: 99.8, avatar: "🎯" },
  { id: "tamador", name: "Tamador", role: "Developer", status: "online", model: "Claude 3.5 Sonnet", fallbackModel: "GPT-4o-mini", modelType: "PAID", lastActivity: "30 sec ago", tasksCompleted: 89, responseTime: 2.1, errorRate: 0.8, uptime: 99.5, avatar: "⚡" },
  { id: "ihab", name: "Ihab", role: "Operations", status: "idle", model: "GPT-4o-mini", fallbackModel: "Llama 3.1", modelType: "FREE", lastActivity: "15 min ago", tasksCompleted: 67, responseTime: 0.8, errorRate: 0.1, uptime: 99.9, avatar: "🔧" },
  { id: "nour", name: "Nour", role: "Analyst", status: "online", model: "Claude 3.5 Haiku", fallbackModel: "Mistral Large", modelType: "PAID", lastActivity: "1 min ago", tasksCompleted: 54, responseTime: 1.5, errorRate: 0.5, uptime: 98.7, avatar: "📊" },
  { id: "zaid", name: "Zaid", role: "Researcher", status: "offline", model: "Llama 3.1 70B", fallbackModel: "GPT-4o-mini", modelType: "FREE", lastActivity: "2 hrs ago", tasksCompleted: 31, responseTime: 3.2, errorRate: 1.2, uptime: 95.3, avatar: "🔍" },
];

export const services: ServiceInfo[] = [
  { id: "cmd-center", name: "Command Center", status: "running", type: "docker", cpu: 4.2, memory: 312, uptime: "14d 6h", port: 3005 },
  { id: "ollama", name: "Ollama LLM", status: "running", type: "docker", cpu: 18.5, memory: 4096, uptime: "14d 6h", port: 11434 },
  { id: "n8n", name: "n8n Workflows", status: "running", type: "docker", cpu: 2.1, memory: 256, uptime: "7d 12h", port: 5678 },
  { id: "obsidian", name: "Obsidian Sync", status: "running", type: "system", cpu: 0.5, memory: 128, uptime: "14d 6h" },
  { id: "postgres", name: "PostgreSQL", status: "running", type: "docker", cpu: 1.8, memory: 512, uptime: "14d 6h", port: 5432 },
  { id: "redis", name: "Redis Cache", status: "running", type: "docker", cpu: 0.3, memory: 64, uptime: "14d 6h", port: 6379 },
  { id: "grafana", name: "Grafana", status: "stopped", type: "docker", cpu: 0, memory: 0, uptime: "—", port: 3000 },
  { id: "prometheus", name: "Prometheus", status: "error", type: "docker", cpu: 0, memory: 0, uptime: "—", port: 9090 },
];

export const tasks: TaskItem[] = [
  { id: "t1", title: "Fix agent heartbeat timeout", status: "in_progress", priority: "P0", assignee: "Tamador", project: "OpenClaw", deadline: "Today", category: "Bug" },
  { id: "t2", title: "Implement email approval workflow", status: "todo", priority: "P1", assignee: "Ihab", project: "OpenClaw", deadline: "Tomorrow", category: "Feature" },
  { id: "t3", title: "Research competitor pricing models", status: "in_progress", priority: "P2", assignee: "Nour", project: "Hope in Hand", deadline: "Mar 18", category: "Research" },
  { id: "t4", title: "Deploy dashboard v2 to production", status: "blocked", priority: "P0", assignee: "Tamador", project: "OpenClaw", deadline: "Today", category: "DevOps" },
  { id: "t5", title: "Write API documentation", status: "todo", priority: "P2", assignee: "Zaid", project: "OpenClaw", deadline: "Mar 20", category: "Docs" },
  { id: "t6", title: "Set up monitoring alerts", status: "done", priority: "P1", assignee: "Ihab", project: "OpenClaw", deadline: "Mar 14", category: "DevOps" },
];

export const events: SystemEvent[] = [
  { id: "e1", type: "success", message: "Agent Fawwaz dispatched task T-142 to Tamador", source: "Dispatcher", timestamp: "2 min ago" },
  { id: "e2", type: "info", message: "Ollama model swap: llama3.1 → mistral-large", source: "Model Manager", timestamp: "5 min ago" },
  { id: "e3", type: "warning", message: "Redis memory usage at 85% threshold", source: "Monitor", timestamp: "12 min ago" },
  { id: "e4", type: "error", message: "Prometheus container exited with code 137", source: "Docker", timestamp: "1 hr ago" },
  { id: "e5", type: "success", message: "Daily backup completed successfully", source: "Cron", timestamp: "2 hrs ago" },
  { id: "e6", type: "info", message: "Agent Nour started research task R-089", source: "Task Manager", timestamp: "3 hrs ago" },
  { id: "e7", type: "warning", message: "Agent Zaid response time exceeding 3s threshold", source: "Monitor", timestamp: "4 hrs ago" },
  { id: "e8", type: "success", message: "n8n workflow 'Email Triage' completed 23 items", source: "n8n", timestamp: "5 hrs ago" },
];

export const systemMetrics: SystemMetrics = {
  cpu: 24.5,
  memory: 67.3,
  disk: 42.8,
  network: { in: 12.4, out: 3.8 },
  swap: 15.2,
};
