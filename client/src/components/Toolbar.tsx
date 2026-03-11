import { useFlowStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Square, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useReactFlow } from "@xyflow/react";

export function Toolbar() {
  const { workflowName, setWorkflowName, workflowPattern, isSimulating, startSimulation, stopSimulation, nodes } = useFlowStore();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1a1a1a] bg-[#0e0e0e]">
      <div className="flex items-center gap-3">
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="h-7 text-[11px] bg-transparent border-none font-medium text-[#e4e4e7] w-52 px-1 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-[#1e1e1e] rounded"
          data-testid="input-workflow-name"
        />
        {workflowPattern !== "custom" && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20 capitalize">
            {workflowPattern}
          </span>
        )}
        <span className="text-[10px] text-[#3f3f46]">
          {nodes.length} node{nodes.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" className="h-7 w-7 text-[#525252] hover:text-[#a1a1aa]" onClick={() => zoomOut()}>
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-[#525252] hover:text-[#a1a1aa]" onClick={() => zoomIn()}>
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-[#525252] hover:text-[#a1a1aa]"
          onClick={() => fitView({ padding: 0.2, duration: 300 })}>
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-5 bg-[#1e1e1e] mx-1" />

        {isSimulating ? (
          <Button size="sm" className="h-7 text-[10px] bg-red-600 hover:bg-red-700 text-white gap-1.5" onClick={stopSimulation}>
            <Square className="w-3 h-3" /> Stop
          </Button>
        ) : (
          <Button size="sm"
            className="h-7 text-[10px] bg-[#7c3aed] hover:bg-[#6d28d9] text-white gap-1.5"
            onClick={startSimulation} disabled={nodes.length === 0}>
            <Play className="w-3 h-3" /> Run
          </Button>
        )}
      </div>
    </div>
  );
}
