import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useFlowStore } from "@/lib/store";
import type { Workflow } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, FileJson, Trash2, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WorkflowList() {
  const { toast } = useToast();
  const { loadWorkflow, clearCanvas, nodes, edges, workflowId, workflowName, workflowDescription } = useFlowStore();

  const { data: workflows = [], isLoading } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/workflows", {
        name: "New Workflow",
        description: "",
        nodes: [],
        edges: [],
      });
      return res.json();
    },
    onSuccess: (wf: Workflow) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      loadWorkflow([], [], wf.id, wf.name, wf.description || "");
      toast({ title: "Workflow created" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!workflowId) {
        const res = await apiRequest("POST", "/api/workflows", {
          name: workflowName,
          description: workflowDescription,
          nodes,
          edges,
        });
        return res.json();
      }
      const res = await apiRequest("PATCH", `/api/workflows/${workflowId}`, {
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
      });
      return res.json();
    },
    onSuccess: (wf: Workflow) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      useFlowStore.getState().setWorkflowId(wf.id);
      toast({ title: "Saved" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/workflows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      clearCanvas();
      toast({ title: "Workflow deleted" });
    },
  });

  const handleLoad = (wf: Workflow) => {
    const wfNodes = (wf.nodes as any[]) || [];
    const wfEdges = (wf.edges as any[]) || [];
    loadWorkflow(wfNodes, wfEdges, wf.id, wf.name, wf.description || "");
    toast({ title: `Loaded: ${wf.name}` });
  };

  const handleExport = () => {
    const data = JSON.stringify({ name: workflowName, description: workflowDescription, nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, "_").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as JSON" });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        loadWorkflow(data.nodes || [], data.edges || [], 0, data.name || "Imported", data.description || "");
        toast({ title: "Imported workflow" });
      } catch {
        toast({ title: "Invalid JSON file", variant: "destructive" });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-3" data-testid="workflow-list">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Workflows
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => createMutation.mutate()}
          data-testid="button-new-workflow"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-xs text-zinc-600 py-2">Loading...</div>
      ) : (
        <div className="space-y-1">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                wf.id === workflowId
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
              onClick={() => handleLoad(wf)}
              data-testid={`workflow-item-${wf.id}`}
            >
              <FolderOpen className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
              <span className="truncate flex-1">{wf.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(wf.id);
                }}
                className="p-0.5 rounded hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors"
                data-testid={`button-delete-workflow-${wf.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-zinc-800 pt-3 space-y-1.5">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-7 border-zinc-700 bg-zinc-800/80 text-zinc-300 justify-start hover:bg-zinc-700"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          data-testid="button-save-workflow"
        >
          <FileJson className="w-3 h-3 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Current"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-7 border-zinc-700 bg-zinc-800/80 text-zinc-300 justify-start hover:bg-zinc-700"
          onClick={handleExport}
          data-testid="button-export"
        >
          <FileJson className="w-3 h-3 mr-2" />
          Export JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-7 border-zinc-700 bg-zinc-800/80 text-zinc-300 justify-start hover:bg-zinc-700"
          onClick={handleImport}
          data-testid="button-import"
        >
          <FolderOpen className="w-3 h-3 mr-2" />
          Import JSON
        </Button>
      </div>
    </div>
  );
}
