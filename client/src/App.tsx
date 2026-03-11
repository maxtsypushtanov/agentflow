import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import Canvas from "@/pages/canvas";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Canvas} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router hook={useHashLocation}>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full bg-zinc-950 text-zinc-100">
              <AppSidebar />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2 px-2 py-1 border-b border-zinc-800 bg-zinc-950">
                  <SidebarTrigger data-testid="button-sidebar-toggle" className="text-zinc-500 hover:text-zinc-300" />
                  <span className="text-[10px] text-zinc-700">AgentFlow</span>
                </div>
                <main className="flex-1 overflow-hidden">
                  <AppRouter />
                </main>
                <PerplexityAttribution />
              </div>
            </div>
          </SidebarProvider>
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
