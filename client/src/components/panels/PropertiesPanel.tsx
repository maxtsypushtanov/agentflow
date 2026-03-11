import { useFlowStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Trash2, Copy, X } from "lucide-react";

export function PropertiesPanel() {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData, deleteNode, duplicateNode } = useFlowStore();
  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-600 text-xs px-4 text-center">
        Select a node on the canvas to edit its properties
      </div>
    );
  }

  const { data } = node;

  return (
    <div className="space-y-4" data-testid="properties-panel">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Properties
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => setSelectedNodeId(null)}
          data-testid="button-close-properties"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <Label className="text-xs text-zinc-400">Name</Label>
        <Input
          value={data.label}
          onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
          className="h-8 text-xs bg-zinc-900 border-zinc-800"
          data-testid="input-node-label"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs text-zinc-400">Description</Label>
        <Textarea
          value={data.description}
          onChange={(e) => updateNodeData(node.id, { description: e.target.value })}
          className="text-xs bg-zinc-900 border-zinc-800 min-h-[60px]"
          data-testid="input-node-description"
        />
      </div>

      {/* Type-specific config */}
      {data.type === "llm-agent" && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Model</Label>
            <Select
              value={(data.config.model as string) || "gpt-4o"}
              onValueChange={(v) => updateNodeData(node.id, { config: { ...data.config, model: v } })}
            >
              <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-800" data-testid="select-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                <SelectItem value="llama-3.1-70b">Llama 3.1 70B</SelectItem>
                <SelectItem value="mistral-large">Mistral Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">
              Temperature: {((data.config.temperature as number) ?? 0.7).toFixed(1)}
            </Label>
            <Slider
              value={[((data.config.temperature as number) ?? 0.7)]}
              onValueChange={([v]) => updateNodeData(node.id, { config: { ...data.config, temperature: v } })}
              min={0}
              max={2}
              step={0.1}
              className="py-2"
              data-testid="slider-temperature"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">System Prompt</Label>
            <Textarea
              value={(data.config.systemPrompt as string) || ""}
              onChange={(e) => updateNodeData(node.id, { config: { ...data.config, systemPrompt: e.target.value } })}
              className="text-xs bg-zinc-900 border-zinc-800 min-h-[80px]"
              placeholder="You are a helpful assistant..."
              data-testid="input-system-prompt"
            />
          </div>
        </>
      )}

      {data.type === "tool" && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Endpoint URL</Label>
            <Input
              value={(data.config.endpoint as string) || ""}
              onChange={(e) => updateNodeData(node.id, { config: { ...data.config, endpoint: e.target.value } })}
              className="h-8 text-xs bg-zinc-900 border-zinc-800"
              placeholder="https://api.example.com/v1"
              data-testid="input-endpoint"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Method</Label>
            <Select
              value={(data.config.method as string) || "POST"}
              onValueChange={(v) => updateNodeData(node.id, { config: { ...data.config, method: v } })}
            >
              <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-800" data-testid="select-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {data.type === "router" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-400">Routes (comma separated)</Label>
          <Input
            value={((data.config.routes as string[]) || []).join(", ")}
            onChange={(e) =>
              updateNodeData(node.id, {
                config: { ...data.config, routes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) },
              })
            }
            className="h-8 text-xs bg-zinc-900 border-zinc-800"
            placeholder="billing, technical, general"
            data-testid="input-routes"
          />
        </div>
      )}

      {data.type === "transformer" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-400">Transform Template</Label>
          <Textarea
            value={(data.config.template as string) || ""}
            onChange={(e) => updateNodeData(node.id, { config: { ...data.config, template: e.target.value } })}
            className="text-xs bg-zinc-900 border-zinc-800 min-h-[80px] font-mono"
            placeholder="{ result: $.input.data }"
            data-testid="input-template"
          />
        </div>
      )}

      {data.type === "memory" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-400">Memory Type</Label>
          <Select
            value={(data.config.type as string) || "short-term"}
            onValueChange={(v) => updateNodeData(node.id, { config: { ...data.config, type: v } })}
          >
            <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-800" data-testid="select-memory-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short-term">Short-term</SelectItem>
              <SelectItem value="long-term">Long-term</SelectItem>
              <SelectItem value="vector-store">Vector Store</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Node ID */}
      <div className="pt-2 border-t border-zinc-800">
        <p className="text-[10px] text-zinc-600 font-mono truncate">ID: {node.id}</p>
        <p className="text-[10px] text-zinc-600 mt-0.5">
          Type: <span className="text-zinc-400">{data.type}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8 border-zinc-800 bg-zinc-900"
          onClick={() => duplicateNode(node.id)}
          data-testid="button-duplicate-node"
        >
          <Copy className="w-3 h-3 mr-1.5" />
          Duplicate
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8 border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-900/30"
          onClick={() => deleteNode(node.id)}
          data-testid="button-delete-node"
        >
          <Trash2 className="w-3 h-3 mr-1.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
