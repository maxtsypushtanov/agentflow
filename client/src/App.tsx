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
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Canvas} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16.5rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router hook={useHashLocation}>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full bg-[#0a0a0a] text-[#e4e4e7]">
              <AppSidebar />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2 px-2 py-1 border-b border-[#1a1a1a] bg-[#0e0e0e]">
                  <SidebarTrigger data-testid="button-sidebar-toggle" className="text-[#3f3f46] hover:text-[#71717a]" />
                </div>
                <main className="flex-1 min-h-0 overflow-hidden">
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
