import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandLayout } from "@/components/command/CommandLayout";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Dashboard from "./pages/Dashboard";
import AgentsPage from "./pages/AgentsPage";
import InfrastructurePage from "./pages/InfrastructurePage";
import TasksPage from "./pages/TasksPage";
import ProjectsPage from "./pages/ProjectsPage";
import SettingsPage from "./pages/SettingsPage";
import PersonalPage from "./pages/PersonalPage";
import WorkPage from "./pages/WorkPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<CommandLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/infrastructure" element={<InfrastructurePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/work" element={<WorkPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
