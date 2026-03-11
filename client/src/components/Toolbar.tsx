import { useFlowStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Square, Undo2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useReactFlow } from "@xyflow/react";

export function Toolbar() {
  const { workflowName, setWorkflowName, isSimulating, startSimulation, stopSimulation, nodes } = useFlowStore();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="h-7 text-xs bg-transparent border-none font-medium text-zinc-200 w-48 px-1 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-zinc-900 rounded"
          data-testid="input-workflow-name"
        />
        <span className="text-[10px] text-zinc-600">
          {nodes.length} node{nodes.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => zoomOut()}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => zoomIn()}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          data-testid="button-fit-view"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-5 bg-zinc-800 mx-1" />

        {isSimulating ? (
          <Button
            size="sm"
            className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white gap-1.5"
            onClick={stopSimulation}
            data-testid="button-stop-sim"
          >
            <Square className="w-3 h-3" />
            Stop
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            onClick={startSimulation}
            disabled={nodes.length === 0}
            data-testid="button-run-sim"
          >
            <Play className="w-3 h-3" />
            Simulate
          </Button>
        )}
      </div>
    </div>
  );
}
