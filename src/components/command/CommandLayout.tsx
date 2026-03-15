import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CommandSidebar } from "./CommandSidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

export function CommandLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background grid-bg">
        <CommandSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border/30 px-4 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] mono text-muted-foreground uppercase tracking-wider">
                <div className="h-1.5 w-1.5 rounded-full bg-glow-success glow-dot-online animate-pulse" />
                Live
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
