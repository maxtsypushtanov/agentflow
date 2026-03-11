import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, TestTube, Cloud, Key, Settings2, Cpu, Shield } from "lucide-react";
import type { AppSettings } from "@shared/schema";

export default function SettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<AppSettings>>({});
  const [testResult, setTestResult] = useState<string | null>(null);

  const { data: settings } = useQuery<AppSettings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<AppSettings>) => {
      const res = await apiRequest("PATCH", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved" });
    },
  });

  const testConnection = async () => {
    setTestResult("Testing...");
    try {
      const res = await fetch("/api/cloudru/models");
      if (res.ok) {
        const data = await res.json();
        const count = data?.data?.length || 0;
        setTestResult(`Connected. ${count} model(s) available.`);
      } else {
        const err = await res.json();
        setTestResult(`Error: ${err.error}`);
      }
    } catch (err: any) {
      setTestResult(`Connection failed: ${err.message}`);
    }
  };

  const update = (key: keyof AppSettings, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full overflow-auto bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto py-8 px-6 space-y-8">
        <div>
          <h1 className="text-lg font-semibold text-[#e4e4e7] flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[#71717a]" />
            Settings
          </h1>
          <p className="text-[11px] text-[#525252] mt-1">Configure API keys, models, and execution parameters</p>
        </div>

        {/* Cloud.ru API Configuration */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1e1e1e]">
            <Cloud className="w-4 h-4 text-[#7c3aed]" />
            <h2 className="text-sm font-medium text-[#d4d4d8]">Cloud.ru Foundation Models</h2>
          </div>

          <div className="space-y-3 pl-6">
            <div className="space-y-1">
              <Label className="text-[10px] text-[#71717a]">API Key (Bearer Token)</Label>
              <Input
                type="password"
                value={form.cloudruApiKey || ""}
                onChange={(e) => update("cloudruApiKey", e.target.value)}
                className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7] font-mono"
                placeholder="Enter Cloud.ru API key..."
                data-testid="input-api-key"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-[#71717a]">Key ID (optional)</Label>
                <Input
                  value={form.cloudruKeyId || ""}
                  onChange={(e) => update("cloudruKeyId", e.target.value)}
                  className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7] font-mono"
                  placeholder="Key ID"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-[#71717a]">Secret (optional)</Label>
                <Input
                  type="password"
                  value={form.cloudruSecret || ""}
                  onChange={(e) => update("cloudruSecret", e.target.value)}
                  className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7] font-mono"
                  placeholder="Secret"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-[#71717a]">Base URL</Label>
              <Input
                value={form.cloudruBaseUrl || ""}
                onChange={(e) => update("cloudruBaseUrl", e.target.value)}
                className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7] font-mono"
                placeholder="https://api.cloud.ru/v1"
              />
              <p className="text-[9px] text-[#3f3f46]">OpenAI-compatible endpoint. Supports /v1/models and /v1/chat/completions</p>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-[#71717a]">Default Model</Label>
              <Input
                value={form.cloudruModel || ""}
                onChange={(e) => update("cloudruModel", e.target.value)}
                className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7] font-mono"
                placeholder="Model name from /v1/models"
              />
            </div>

            <Button
              variant="outline" size="sm"
              className="text-[10px] h-7 border-[#2a2a2a] bg-[#0f0f0f] text-[#a1a1aa] gap-1.5"
              onClick={testConnection}
              data-testid="button-test-connection"
            >
              <TestTube className="w-3 h-3" />
              Test Connection
            </Button>

            {testResult && (
              <div className={`text-[10px] px-3 py-2 rounded border font-mono ${
                testResult.startsWith("Connected")
                  ? "bg-emerald-950/30 border-emerald-800/30 text-emerald-400"
                  : testResult === "Testing..."
                    ? "bg-blue-950/30 border-blue-800/30 text-blue-400"
                    : "bg-red-950/30 border-red-800/30 text-red-400"
              }`}>
                {testResult}
              </div>
            )}
          </div>
        </section>

        {/* Model Defaults */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1e1e1e]">
            <Cpu className="w-4 h-4 text-[#0891b2]" />
            <h2 className="text-sm font-medium text-[#d4d4d8]">Model Defaults</h2>
          </div>

          <div className="space-y-3 pl-6">
            <div className="space-y-1">
              <Label className="text-[10px] text-[#71717a]">
                Default Temperature: {(form.defaultTemperature ?? 0.7).toFixed(1)}
              </Label>
              <Slider
                value={[form.defaultTemperature ?? 0.7]}
                onValueChange={([v]) => update("defaultTemperature", v)}
                min={0} max={2} step={0.1} className="py-1"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-[#71717a]">Default Max Tokens</Label>
              <Input
                type="number"
                value={form.defaultMaxTokens ?? 2048}
                onChange={(e) => update("defaultMaxTokens", parseInt(e.target.value))}
                className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7]"
              />
            </div>
          </div>
        </section>

        {/* Execution */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1e1e1e]">
            <Shield className="w-4 h-4 text-[#84cc16]" />
            <h2 className="text-sm font-medium text-[#d4d4d8]">Execution & Sandbox</h2>
          </div>

          <div className="space-y-3 pl-6">
            <div className="space-y-1">
              <Label className="text-[10px] text-[#71717a]">Execution Timeout (ms)</Label>
              <Input
                type="number"
                value={form.executionTimeout ?? 30000}
                onChange={(e) => update("executionTimeout", parseInt(e.target.value))}
                className="h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[11px] text-[#d4d4d8]">Code Sandbox</Label>
                <p className="text-[9px] text-[#525252]">Enable code execution in sandboxed environment</p>
              </div>
              <Switch
                checked={form.sandboxEnabled ?? true}
                onCheckedChange={(v) => update("sandboxEnabled", v)}
              />
            </div>
          </div>
        </section>

        {/* Production API Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1e1e1e]">
            <Key className="w-4 h-4 text-[#d97706]" />
            <h2 className="text-sm font-medium text-[#d4d4d8]">Production API</h2>
          </div>

          <div className="pl-6 space-y-2">
            <p className="text-[11px] text-[#71717a]">Use these endpoints to execute workflows programmatically:</p>
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 font-mono text-[10px] space-y-1.5">
              <div className="text-[#525252]"># Execute a workflow</div>
              <div><span className="text-[#84cc16]">POST</span> <span className="text-[#e4e4e7]">/api/execute/:workflowId</span></div>
              <div className="text-[#71717a]">Body: {"{"} "input": {"{"} "query": "..." {"}"} {"}"}</div>
              <div className="mt-3 text-[#525252]"># Check execution status</div>
              <div><span className="text-[#60a5fa]">GET</span> <span className="text-[#e4e4e7]">/api/execute/status/:executionId</span></div>
              <div className="mt-3 text-[#525252]"># Validate structured output</div>
              <div><span className="text-[#84cc16]">POST</span> <span className="text-[#e4e4e7]">/api/validate</span></div>
              <div className="text-[#71717a]">Body: {"{"} "data": ..., "schema": "...", "schemaType": "json-schema" {"}"}</div>
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="pt-4">
          <Button
            className="w-full h-9 text-[11px] bg-[#7c3aed] hover:bg-[#6d28d9] text-white gap-2"
            onClick={() => saveMutation.mutate(form)}
            disabled={saveMutation.isPending}
            data-testid="button-save-settings"
          >
            <Save className="w-3.5 h-3.5" />
            {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
