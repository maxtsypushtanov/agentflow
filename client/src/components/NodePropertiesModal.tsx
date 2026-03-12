import { useFlowStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Copy, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export function NodePropertiesModal() {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData, deleteNode, duplicateNode } = useFlowStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  const [codeOutput, setCodeOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCodeOutput("");
    setIsRunning(false);
  }, [selectedNodeId]);

  if (!node) return null;

  const { data } = node;

  const runCode = async () => {
    setIsRunning(true);
    try {
      const res = await apiRequest("POST", "/api/sandbox/execute", {
        code: data.config.code,
        language: data.config.language,
        timeout: data.config.timeout || 10000,
      });
      const result = await res.json();
      setCodeOutput(result.output || "No output");
      updateNodeData(node.id, { lastOutput: result.output?.substring(0, 200) });
    } catch (err: any) {
      setCodeOutput(`Error: ${err.message}`);
    }
    setIsRunning(false);
  };

  const handleClose = () => setSelectedNodeId(null);

  return (
    <Dialog open={!!selectedNodeId} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        className="max-w-lg bg-[#141414] border border-[#2a2a2a] text-[#e4e4e7] p-0 gap-0"
        data-testid="node-properties-modal"
      >
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-[13px] font-semibold text-[#e4e4e7]">Node Properties</DialogTitle>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e1e1e] text-[#71717a] border border-[#2a2a2a]">{data.type}</span>
          </div>
          <DialogDescription className="sr-only">Edit properties for the selected node</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-5 py-4">
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-[#71717a]">Name</Label>
              <Input value={data.label} onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
                className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7] focus:border-[#3f3f46]"
                data-testid="input-node-label" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-[#71717a]">Description</Label>
              <Textarea value={data.description} onChange={(e) => updateNodeData(node.id, { description: e.target.value })}
                className="text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7] min-h-[48px] focus:border-[#3f3f46]"
                data-testid="input-node-description" />
            </div>

            {/* LLM Agent Config */}
            {data.type === "llm-agent" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Model</Label>
                  <Select value={(data.config.model as string) || "cloud-ru-auto"}
                    onValueChange={(v) => updateNodeData(node.id, { config: { ...data.config, model: v } })}>
                    <SelectTrigger className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a]" data-testid="select-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                      <SelectItem value="cloud-ru-auto">Cloud.ru (Auto)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      <SelectItem value="llama-3.1-70b">Llama 3.1 70B</SelectItem>
                      <SelectItem value="mistral-large">Mistral Large</SelectItem>
                      <SelectItem value="qwen-72b">Qwen 72B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">
                    Temperature: {((data.config.temperature as number) ?? 0.7).toFixed(1)}
                  </Label>
                  <Slider value={[((data.config.temperature as number) ?? 0.7)]}
                    onValueChange={([v]) => updateNodeData(node.id, { config: { ...data.config, temperature: v } })}
                    min={0} max={2} step={0.1} className="py-1" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Max Tokens</Label>
                  <Input type="number" value={(data.config.maxTokens as number) ?? 2048}
                    onChange={(e) => updateNodeData(node.id, { config: { ...data.config, maxTokens: parseInt(e.target.value) } })}
                    className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">System Prompt</Label>
                  <Textarea value={(data.config.systemPrompt as string) || ""}
                    onChange={(e) => updateNodeData(node.id, { config: { ...data.config, systemPrompt: e.target.value } })}
                    className="text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7] min-h-[72px] font-mono"
                    placeholder="You are a helpful assistant..." />
                </div>
              </>
            )}

            {/* Code Executor Config */}
            {data.type === "code-executor" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Language</Label>
                  <Select value={(data.config.language as string) || "python"}
                    onValueChange={(v) => updateNodeData(node.id, { config: { ...data.config, language: v } })}>
                    <SelectTrigger className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-[#71717a]">Code</Label>
                    <Button size="sm" variant="ghost"
                      className="h-6 text-[9px] text-[#84cc16] hover:text-[#a3e635] gap-1 px-2"
                      onClick={runCode} disabled={isRunning}>
                      <Play className="w-2.5 h-2.5" />
                      {isRunning ? "Running..." : "Run"}
                    </Button>
                  </div>
                  <Textarea value={(data.config.code as string) || ""}
                    onChange={(e) => updateNodeData(node.id, { config: { ...data.config, code: e.target.value } })}
                    className="text-[10px] bg-[#0a0a0a] border-[#2a2a2a] text-[#a3e635] min-h-[120px] font-mono leading-relaxed"
                    placeholder="# Write your code here" spellCheck={false} />
                </div>
                {codeOutput && (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-[#71717a]">Output</Label>
                    <div className="text-[10px] bg-[#0a0a0a] border border-[#2a2a2a] rounded-md p-2 font-mono text-[#e4e4e7] max-h-[100px] overflow-auto whitespace-pre-wrap">
                      {codeOutput}
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Timeout (ms)</Label>
                  <Input type="number" value={(data.config.timeout as number) ?? 10000}
                    onChange={(e) => updateNodeData(node.id, { config: { ...data.config, timeout: parseInt(e.target.value) } })}
                    className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7]" />
                </div>
              </>
            )}

            {/* Validator Config */}
            {data.type === "validator" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Schema Type</Label>
                  <Select value={(data.config.schemaType as string) || "json-schema"}
                    onValueChange={(v) => updateNodeData(node.id, { config: { ...data.config, schemaType: v } })}>
                    <SelectTrigger className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                      <SelectItem value="json-schema">JSON Schema</SelectItem>
                      <SelectItem value="regex">Regex Pattern</SelectItem>
                      <SelectItem value="zod">Zod Schema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Schema Definition</Label>
                  <Textarea value={(data.config.schema as string) || ""}
                    onChange={(e) => updateNodeData(node.id, { config: { ...data.config, schema: e.target.value } })}
                    className="text-[10px] bg-[#0a0a0a] border-[#2a2a2a] text-[#e879f9] min-h-[120px] font-mono leading-relaxed"
                    placeholder='{"type":"object","required":["field"],"properties":{...}}' spellCheck={false} />
                </div>
              </>
            )}

            {/* Blackboard Config */}
            {data.type === "blackboard" && (
              <div className="space-y-1.5">
                <Label className="text-[10px] text-[#71717a]">Fields (comma separated)</Label>
                <Input value={((data.config.fields as string[]) || []).join(", ")}
                  onChange={(e) => updateNodeData(node.id, { config: { ...data.config, fields: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })}
                  className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7]"
                  placeholder="facts, hypotheses, evidence, conclusion" />
              </div>
            )}

            {/* Router Config */}
            {data.type === "router" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Routes (comma separated)</Label>
                  <Input value={((data.config.routes as string[]) || []).join(", ")}
                    onChange={(e) => updateNodeData(node.id, { config: { ...data.config, routes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })}
                    className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7]"
                    placeholder="billing, technical, general" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Routing Prompt</Label>
                  <Textarea value={(data.config.routingPrompt as string) || ""}
                    onChange={(e) => updateNodeData(node.id, { config: { ...data.config, routingPrompt: e.target.value } })}
                    className="text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7] min-h-[60px]"
                    placeholder="Classify the input into one of the routes..." />
                </div>
              </>
            )}

            {/* Tool Config */}
            {data.type === "tool" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Endpoint URL</Label>
                  <Input value={(data.config.endpoint as string) || ""}
                    onChange={(e) => updateNodeData(node.id, { config: { ...data.config, endpoint: e.target.value } })}
                    className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7]"
                    placeholder="https://api.example.com/v1" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Method</Label>
                  <Select value={(data.config.method as string) || "POST"}
                    onValueChange={(v) => updateNodeData(node.id, { config: { ...data.config, method: v } })}>
                    <SelectTrigger className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Headers (JSON)</Label>
                  <Textarea value={(data.config.headers as string) || "{}"}
                    onChange={(e) => updateNodeData(node.id, { config: { ...data.config, headers: e.target.value } })}
                    className="text-[10px] bg-[#0a0a0a] border-[#2a2a2a] text-[#fbbf24] min-h-[60px] font-mono"
                    spellCheck={false} />
                </div>
              </>
            )}

            {/* Aggregator Config */}
            {data.type === "aggregator" && (
              <div className="space-y-1.5">
                <Label className="text-[10px] text-[#71717a]">Strategy</Label>
                <Select value={(data.config.strategy as string) || "merge"}
                  onValueChange={(v) => updateNodeData(node.id, { config: { ...data.config, strategy: v } })}>
                  <SelectTrigger className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="merge">Merge All</SelectItem>
                    <SelectItem value="vote">Majority Vote</SelectItem>
                    <SelectItem value="best">Best Score</SelectItem>
                    <SelectItem value="concat">Concatenate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Loop Config */}
            {data.type === "loop" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Max Iterations</Label>
                  <Input type="number" value={(data.config.maxIterations as number) ?? 5}
                    onChange={(e) => updateNodeData(node.id, { config: { ...data.config, maxIterations: parseInt(e.target.value) } })}
                    className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#71717a]">Stop Condition</Label>
                  <Input value={(data.config.condition as string) || ""}
                    onChange={(e) => updateNodeData(node.id, { config: { ...data.config, condition: e.target.value } })}
                    className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7]"
                    placeholder="output.status === 'complete'" />
                </div>
              </>
            )}

            {/* Memory Config */}
            {data.type === "memory" && (
              <div className="space-y-1.5">
                <Label className="text-[10px] text-[#71717a]">Memory Type</Label>
                <Select value={(data.config.type as string) || "short-term"}
                  onValueChange={(v) => updateNodeData(node.id, { config: { ...data.config, type: v } })}>
                  <SelectTrigger className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="short-term">Short-term</SelectItem>
                    <SelectItem value="long-term">Long-term</SelectItem>
                    <SelectItem value="vector-store">Vector Store</SelectItem>
                    <SelectItem value="redis">Redis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Transformer */}
            {data.type === "transformer" && (
              <div className="space-y-1.5">
                <Label className="text-[10px] text-[#71717a]">Transform Template</Label>
                <Textarea value={(data.config.template as string) || ""}
                  onChange={(e) => updateNodeData(node.id, { config: { ...data.config, template: e.target.value } })}
                  className="text-[10px] bg-[#0a0a0a] border-[#2a2a2a] text-[#fb923c] min-h-[80px] font-mono"
                  placeholder='{ "result": $.input.data }' spellCheck={false} />
              </div>
            )}

            {/* Human Review */}
            {data.type === "human-review" && (
              <div className="space-y-1.5">
                <Label className="text-[10px] text-[#71717a]">Instructions</Label>
                <Textarea value={(data.config.instructions as string) || ""}
                  onChange={(e) => updateNodeData(node.id, { config: { ...data.config, instructions: e.target.value } })}
                  className="text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7] min-h-[60px]"
                  placeholder="Review the output and approve or reject..." />
              </div>
            )}

            {/* Node ID */}
            <div className="pt-3 border-t border-[#1e1e1e]">
              <p className="text-[9px] text-[#3f3f46] font-mono truncate">ID: {node.id}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm"
                className="flex-1 text-[10px] h-8 border-[#2a2a2a] bg-[#0f0f0f] text-[#a1a1aa] hover:bg-[#1e1e1e]"
                onClick={() => { duplicateNode(node.id); handleClose(); }}
                data-testid="button-duplicate-node">
                <Copy className="w-3 h-3 mr-1.5" /> Duplicate
              </Button>
              <Button variant="outline" size="sm"
                className="flex-1 text-[10px] h-8 border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-950/40"
                onClick={() => { deleteNode(node.id); }}
                data-testid="button-delete-node">
                <Trash2 className="w-3 h-3 mr-1.5" /> Delete
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
