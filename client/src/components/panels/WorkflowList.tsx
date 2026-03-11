import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useFlowStore } from "@/lib/store";
import type { Workflow } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, FileJson, Trash2, FolderOpen, Boxes, GitFork, Layers, Vote, Brain, Workflow as WfIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PATTERN_ICONS: Record<string, typeof Boxes> = {
  custom: WfIcon,
  pipeline: GitFork,
  blackboard: Boxes,
  hierarchical: Layers,
  voting: Vote,
  react: Brain,
};

export function WorkflowList() {
  const { toast } = useToast();
  const { loadWorkflow, clearCanvas, nodes, edges, workflowId, workflowName, workflowDescription, workflowPattern } = useFlowStore();

  const { data: workflows = [], isLoading } = useQuery<Workflow[]>({ queryKey: ["/api/workflows"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/workflows", { name: "New Workflow", description: "", pattern: "custom", nodes: [], edges: [] });
      return res.json();
    },
    onSuccess: (wf: Workflow) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      loadWorkflow([], [], wf.id, wf.name, wf.description || "", (wf as any).pattern || "custom");
      toast({ title: "Workflow created" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = { name: workflowName, description: workflowDescription, pattern: workflowPattern, nodes, edges };
      if (!workflowId) {
        return (await apiRequest("POST", "/api/workflows", body)).json();
      }
      return (await apiRequest("PATCH", `/api/workflows/${workflowId}`, body)).json();
    },
    onSuccess: (wf: Workflow) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      useFlowStore.getState().setWorkflowId(wf.id);
      toast({ title: "Saved" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/workflows/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      clearCanvas();
      toast({ title: "Deleted" });
    },
  });

  const handleLoad = (wf: Workflow) => {
    loadWorkflow((wf.nodes as any[]) || [], (wf.edges as any[]) || [], wf.id, wf.name, wf.description || "", (wf as any).pattern || "custom");
    toast({ title: `Loaded: ${wf.name}` });
  };

  const handleExport = () => {
    const data = JSON.stringify({ name: workflowName, description: workflowDescription, pattern: workflowPattern, nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, "_").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        loadWorkflow(data.nodes || [], data.edges || [], 0, data.name || "Imported", data.description || "", data.pattern || "custom");
        toast({ title: "Imported" });
      } catch { toast({ title: "Invalid JSON", variant: "destructive" }); }
    };
    input.click();
  };

  return (
    <div className="space-y-3" data-testid="workflow-list">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">Workflows</span>
        <Button size="icon" variant="ghost" className="h-5 w-5 text-[#525252] hover:text-[#a1a1aa]"
          onClick={() => createMutation.mutate()} data-testid="button-new-workflow">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-[10px] text-[#3f3f46] py-2">Loading...</div>
      ) : (
        <div className="space-y-0.5">
          {workflows.map((wf) => {
            const PatIcon = PATTERN_ICONS[(wf as any).pattern || "custom"] || WfIcon;
            return (
              <div key={wf.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] cursor-pointer transition-colors ${
                  wf.id === workflowId ? "bg-[#1e1e1e] text-[#e4e4e7] border border-[#2a2a2a]" : "text-[#71717a] hover:bg-[#141414] border border-transparent"
                }`}
                onClick={() => handleLoad(wf)} data-testid={`workflow-item-${wf.id}`}>
                <PatIcon className="w-3.5 h-3.5 shrink-0 text-[#525252]" />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{wf.name}</div>
                  {(wf as any).pattern && (wf as any).pattern !== "custom" && (
                    <div className="text-[9px] text-[#3f3f46] capitalize">{(wf as any).pattern}</div>
                  )}
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(wf.id); }}
                  className="p-0.5 rounded hover:bg-red-950/30 text-[#3f3f46] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-[#1e1e1e] pt-2 space-y-1">
        <Button variant="outline" size="sm"
          className="w-full text-[10px] h-7 border-[#2a2a2a] bg-[#0f0f0f] text-[#a1a1aa] justify-start hover:bg-[#1e1e1e] gap-2"
          onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <FileJson className="w-3 h-3" /> {saveMutation.isPending ? "Saving..." : "Save Current"}
        </Button>
        <Button variant="outline" size="sm"
          className="w-full text-[10px] h-7 border-[#2a2a2a] bg-[#0f0f0f] text-[#a1a1aa] justify-start hover:bg-[#1e1e1e] gap-2"
          onClick={handleExport}>
          <FileJson className="w-3 h-3" /> Export JSON
        </Button>
        <Button variant="outline" size="sm"
          className="w-full text-[10px] h-7 border-[#2a2a2a] bg-[#0f0f0f] text-[#a1a1aa] justify-start hover:bg-[#1e1e1e] gap-2"
          onClick={handleImport}>
          <FolderOpen className="w-3 h-3" /> Import JSON
        </Button>
      </div>
    </div>
  );
}
