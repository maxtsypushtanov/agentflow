import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { AgentNodeData, NodeTypeValue } from "@shared/schema";
import { useFlowStore } from "@/lib/store";
import {
  Bot, Wrench, GitFork, UserCheck, ArrowRightToLine, ArrowLeftFromLine,
  Shuffle, Database, Layers, Loader2, CheckCircle2, XCircle, Copy, Trash2,
  Code2, ShieldCheck, LayoutDashboard, Combine, Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<NodeTypeValue, typeof Bot> = {
  "llm-agent": Bot,
  "tool": Wrench,
  "router": GitFork,
  "human-review": UserCheck,
  "input": ArrowLeftFromLine,
  "output": ArrowRightToLine,
  "transformer": Shuffle,
  "memory": Database,
  "subagent-group": Layers,
  "code-executor": Code2,
  "validator": ShieldCheck,
  "blackboard": LayoutDashboard,
  "aggregator": Combine,
  "loop": Repeat,
};

const COLOR_MAP: Record<NodeTypeValue, { bg: string; border: string; icon: string; accent: string }> = {
  "llm-agent":      { bg: "bg-[#1a1a2e]", border: "border-[#7c3aed]/40", icon: "text-[#a78bfa]", accent: "#7c3aed" },
  "tool":           { bg: "bg-[#1a1e1a]", border: "border-[#d97706]/40", icon: "text-[#fbbf24]", accent: "#d97706" },
  "router":         { bg: "bg-[#1a1e2e]", border: "border-[#0891b2]/40", icon: "text-[#22d3ee]", accent: "#0891b2" },
  "human-review":   { bg: "bg-[#1a2e1e]", border: "border-[#059669]/40", icon: "text-[#34d399]", accent: "#059669" },
  "input":          { bg: "bg-[#1a1e2e]", border: "border-[#2563eb]/40", icon: "text-[#60a5fa]", accent: "#2563eb" },
  "output":         { bg: "bg-[#2e1a1e]", border: "border-[#e11d48]/40", icon: "text-[#fb7185]", accent: "#e11d48" },
  "transformer":    { bg: "bg-[#2e1e1a]", border: "border-[#ea580c]/40", icon: "text-[#fb923c]", accent: "#ea580c" },
  "memory":         { bg: "bg-[#1a2e2e]", border: "border-[#0d9488]/40", icon: "text-[#2dd4bf]", accent: "#0d9488" },
  "subagent-group": { bg: "bg-[#1e1a2e]", border: "border-[#6366f1]/40", icon: "text-[#818cf8]", accent: "#6366f1" },
  "code-executor":  { bg: "bg-[#1e1e1a]", border: "border-[#84cc16]/40", icon: "text-[#a3e635]", accent: "#84cc16" },
  "validator":      { bg: "bg-[#2e1a2e]", border: "border-[#c026d3]/40", icon: "text-[#e879f9]", accent: "#c026d3" },
  "blackboard":     { bg: "bg-[#1e1e2e]", border: "border-[#8b5cf6]/40", icon: "text-[#c4b5fd]", accent: "#8b5cf6" },
  "aggregator":     { bg: "bg-[#1e2e1e]", border: "border-[#16a34a]/40", icon: "text-[#4ade80]", accent: "#16a34a" },
  "loop":           { bg: "bg-[#2e2e1a]", border: "border-[#ca8a04]/40", icon: "text-[#facc15]", accent: "#ca8a04" },
};

const STATUS_INDICATOR: Record<string, { icon: typeof Loader2; color: string }> = {
  idle: { icon: Loader2, color: "text-[#3f3f46]" },
  running: { icon: Loader2, color: "text-blue-400 animate-spin" },
  success: { icon: CheckCircle2, color: "text-emerald-400" },
  error: { icon: XCircle, color: "text-red-400" },
};

export function BaseNode({ data, id, selected }: NodeProps & { data: AgentNodeData }) {
  const { setSelectedNodeId, deleteNode, duplicateNode } = useFlowStore();
  const colors = COLOR_MAP[data.type] || COLOR_MAP["llm-agent"];
  const Icon = ICON_MAP[data.type] || Bot;
  const statusInfo = STATUS_INDICATOR[data.status || "idle"];
  const StatusIcon = statusInfo.icon;
  const isInput = data.type === "input";
  const isOutput = data.type === "output";

  return (
    <div
      className={cn(
        "relative group rounded-xl border backdrop-blur-md transition-all duration-200 min-w-[190px] max-w-[230px]",
        colors.bg,
        colors.border,
        selected && "ring-1 ring-white/20 shadow-lg",
        data.status === "running" && "ring-1 ring-blue-400/40",
        data.status === "success" && "ring-1 ring-emerald-400/20",
        data.status === "error" && "ring-1 ring-red-400/30",
      )}
      onClick={() => setSelectedNodeId(id)}
      data-testid={`node-${data.type}-${id}`}
    >
      {!isInput && (
        <Handle type="target" position={Position.Left}
          className="!w-2.5 !h-2.5 !bg-[#52525b] !border-2 !border-[#27272a] hover:!bg-white transition-colors !-left-1.5" />
      )}
      {!isOutput && (
        <Handle type="source" position={Position.Right}
          className="!w-2.5 !h-2.5 !bg-[#52525b] !border-2 !border-[#27272a] hover:!bg-white transition-colors !-right-1.5" />
      )}

      {/* Quick actions */}
      <div className="absolute -top-7 right-0 hidden group-hover:flex gap-1 z-10">
        <button onClick={(e) => { e.stopPropagation(); duplicateNode(id); }}
          className="p-1 rounded bg-[#1c1c1c] border border-[#333] hover:bg-[#2a2a2a] transition-colors">
          <Copy className="w-3 h-3 text-[#888]" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          className="p-1 rounded bg-[#1c1c1c] border border-[#333] hover:bg-red-950/50 transition-colors">
          <Trash2 className="w-3 h-3 text-[#888]" />
        </button>
      </div>

      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn("p-1.5 rounded-lg", colors.icon)} style={{ backgroundColor: `${colors.accent}15` }}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold text-[#e4e4e7] truncate flex-1">
            {data.label}
          </span>
          <StatusIcon className={cn("w-3 h-3 shrink-0", statusInfo.color)} />
        </div>
        <p className="text-[10px] text-[#71717a] leading-tight line-clamp-2 pl-0.5">
          {data.description}
        </p>
        {data.lastOutput && (
          <div className="mt-1.5 px-2 py-1 bg-black/30 rounded text-[9px] text-[#a1a1aa] font-mono line-clamp-2 border border-[#27272a]">
            {data.lastOutput}
          </div>
        )}
      </div>
    </div>
  );
}

// Export all node type components
export const LLMAgentNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const ToolNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const RouterNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const HumanReviewNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const InputNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const OutputNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const TransformerNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const MemoryNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const SubagentGroupNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const CodeExecutorNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const ValidatorNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const BlackboardNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const AggregatorNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const LoopNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
