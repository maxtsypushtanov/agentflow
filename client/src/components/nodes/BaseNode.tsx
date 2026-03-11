import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { AgentNodeData, NodeTypeValue } from "@shared/schema";
import { useFlowStore } from "@/lib/store";
import {
  Bot,
  Wrench,
  GitFork,
  UserCheck,
  ArrowRightToLine,
  ArrowLeftFromLine,
  Shuffle,
  Database,
  Layers,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Trash2,
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
};

const COLOR_MAP: Record<NodeTypeValue, { bg: string; border: string; icon: string; glow: string }> = {
  "llm-agent": { bg: "bg-violet-950/80", border: "border-violet-500/50", icon: "text-violet-400", glow: "shadow-violet-500/20" },
  "tool": { bg: "bg-amber-950/80", border: "border-amber-500/50", icon: "text-amber-400", glow: "shadow-amber-500/20" },
  "router": { bg: "bg-cyan-950/80", border: "border-cyan-500/50", icon: "text-cyan-400", glow: "shadow-cyan-500/20" },
  "human-review": { bg: "bg-emerald-950/80", border: "border-emerald-500/50", icon: "text-emerald-400", glow: "shadow-emerald-500/20" },
  "input": { bg: "bg-blue-950/80", border: "border-blue-500/50", icon: "text-blue-400", glow: "shadow-blue-500/20" },
  "output": { bg: "bg-rose-950/80", border: "border-rose-500/50", icon: "text-rose-400", glow: "shadow-rose-500/20" },
  "transformer": { bg: "bg-orange-950/80", border: "border-orange-500/50", icon: "text-orange-400", glow: "shadow-orange-500/20" },
  "memory": { bg: "bg-teal-950/80", border: "border-teal-500/50", icon: "text-teal-400", glow: "shadow-teal-500/20" },
  "subagent-group": { bg: "bg-indigo-950/80", border: "border-indigo-500/50", icon: "text-indigo-400", glow: "shadow-indigo-500/20" },
};

const STATUS_INDICATOR: Record<string, { icon: typeof Loader2; color: string }> = {
  idle: { icon: Loader2, color: "text-zinc-600" },
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
        "relative group rounded-xl border backdrop-blur-sm transition-all duration-200 min-w-[180px] max-w-[220px]",
        colors.bg,
        colors.border,
        selected ? `ring-2 ring-white/30 shadow-lg ${colors.glow}` : "shadow-md",
        data.status === "running" && "ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/20",
        data.status === "success" && "ring-2 ring-emerald-400/30",
        data.status === "error" && "ring-2 ring-red-400/40 shadow-lg shadow-red-500/20",
      )}
      onClick={() => setSelectedNodeId(id)}
      data-testid={`node-${data.type}-${id}`}
    >
      {/* Handles */}
      {!isInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-zinc-400 !border-2 !border-zinc-700 hover:!bg-white transition-colors !-left-1.5"
        />
      )}
      {!isOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-zinc-400 !border-2 !border-zinc-700 hover:!bg-white transition-colors !-right-1.5"
        />
      )}

      {/* Quick actions on hover */}
      <div className="absolute -top-8 right-0 hidden group-hover:flex gap-1 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); duplicateNode(id); }}
          className="p-1 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
          data-testid={`button-duplicate-${id}`}
        >
          <Copy className="w-3 h-3 text-zinc-400" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          className="p-1 rounded bg-zinc-800 border border-zinc-700 hover:bg-red-900/50 transition-colors"
          data-testid={`button-delete-${id}`}
        >
          <Trash2 className="w-3 h-3 text-zinc-400" />
        </button>
      </div>

      {/* Content */}
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn("p-1 rounded-md bg-black/30", colors.icon)}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-zinc-100 truncate flex-1">
            {data.label}
          </span>
          <StatusIcon className={cn("w-3 h-3 shrink-0", statusInfo.color)} />
        </div>
        <p className="text-[10px] text-zinc-500 leading-tight line-clamp-2">
          {data.description}
        </p>
      </div>
    </div>
  );
}

// Export typed node components for React Flow
export const LLMAgentNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const ToolNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const RouterNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const HumanReviewNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const InputNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const OutputNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const TransformerNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const MemoryNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
export const SubagentGroupNode = (props: NodeProps) => <BaseNode {...props} data={props.data as AgentNodeData} />;
