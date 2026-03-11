import {
  Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
  SidebarGroup, SidebarGroupContent, SidebarSeparator,
} from "@/components/ui/sidebar";
import { NodePalette } from "@/components/panels/NodePalette";
import { PropertiesPanel } from "@/components/panels/PropertiesPanel";
import { WorkflowList } from "@/components/panels/WorkflowList";
import { useFlowStore } from "@/lib/store";
import type { NodeTypeValue } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Cpu } from "lucide-react";
import { Link, useLocation } from "wouter";

export function AppSidebar() {
  const { selectedNodeId } = useFlowStore();
  const [location] = useLocation();

  return (
    <Sidebar data-testid="app-sidebar" className="border-r border-[#1a1a1a] bg-[#0e0e0e]">
      <SidebarHeader className="px-4 py-3">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-label="AgentFlow logo">
              <rect width="32" height="32" rx="8" fill="#141414" stroke="#222" strokeWidth="1" />
              <circle cx="10" cy="12" r="2.5" fill="#7c3aed" />
              <circle cx="22" cy="12" r="2.5" fill="#0891b2" />
              <circle cx="16" cy="22" r="2.5" fill="#84cc16" />
              <line x1="12" y1="13" x2="20" y2="13" stroke="#333" strokeWidth="1.2" />
              <line x1="11" y1="14" x2="15" y2="20" stroke="#333" strokeWidth="1.2" />
              <line x1="21" y1="14" x2="17" y2="20" stroke="#333" strokeWidth="1.2" />
            </svg>
            <div>
              <h1 className="text-[13px] font-bold text-[#e4e4e7] tracking-tight">AgentFlow</h1>
              <p className="text-[9px] text-[#3f3f46]">Multi-Agent Builder</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-[#0e0e0e]">
        <ScrollArea className="h-full">
          {location === "/settings" ? (
            <SidebarGroup>
              <SidebarGroupContent className="px-3 py-2">
                <div className="flex items-center gap-2 text-[#71717a] text-[11px] mb-3">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </div>
                <Link href="/">
                  <div className="text-[10px] text-[#525252] hover:text-[#a1a1aa] cursor-pointer transition-colors">
                    Back to canvas
                  </div>
                </Link>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <>
              <SidebarGroup>
                <SidebarGroupContent className="px-3 py-2">
                  <NodePalette onDragStart={() => {}} />
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator className="bg-[#1a1a1a]" />

              <SidebarGroup>
                <SidebarGroupContent className="px-3 py-2">
                  {selectedNodeId ? <PropertiesPanel /> : <WorkflowList />}
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-3 pt-0 bg-[#0e0e0e]">
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <div className="flex items-center gap-1.5 text-[10px] text-[#3f3f46] hover:text-[#71717a] cursor-pointer transition-colors">
              <Settings className="w-3 h-3" />
              Settings
            </div>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-1 text-[9px] text-[#27272a]">
            <Cpu className="w-2.5 h-2.5" />
            Cloud.ru
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
