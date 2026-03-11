import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { NodePalette } from "@/components/panels/NodePalette";
import { PropertiesPanel } from "@/components/panels/PropertiesPanel";
import { WorkflowList } from "@/components/panels/WorkflowList";
import { useFlowStore } from "@/lib/store";
import type { NodeTypeValue } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar() {
  const { selectedNodeId } = useFlowStore();

  const handleDragStart = (_type: NodeTypeValue) => {
    // Could add visual feedback here
  };

  return (
    <Sidebar data-testid="app-sidebar" className="border-r border-zinc-800">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-2.5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            aria-label="AgentFlow logo"
          >
            <rect width="32" height="32" rx="8" fill="#18181b" />
            <circle cx="10" cy="12" r="3" fill="#8b5cf6" />
            <circle cx="22" cy="12" r="3" fill="#06b6d4" />
            <circle cx="16" cy="22" r="3" fill="#10b981" />
            <line x1="12.5" y1="13" x2="19.5" y2="13" stroke="#52525b" strokeWidth="1.5" />
            <line x1="11" y1="14.5" x2="15" y2="20" stroke="#52525b" strokeWidth="1.5" />
            <line x1="21" y1="14.5" x2="17" y2="20" stroke="#52525b" strokeWidth="1.5" />
          </svg>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 tracking-tight">AgentFlow</h1>
            <p className="text-[10px] text-zinc-600">Multi-Agent Builder</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupContent className="px-3 py-2">
              <NodePalette onDragStart={handleDragStart} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="bg-zinc-800" />

          <SidebarGroup>
            <SidebarGroupContent className="px-3 py-2">
              {selectedNodeId ? <PropertiesPanel /> : <WorkflowList />}
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-3 pt-0">
        <div className="text-[10px] text-zinc-700 text-center">
          Drag nodes onto the canvas to build agent pipelines
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
