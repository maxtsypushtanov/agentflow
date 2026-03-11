import type { NodeTypeValue } from "@shared/schema";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NODE_TYPES: { type: NodeTypeValue; label: string; icon: typeof Bot; iconColor: string; bgColor: string; desc: string }[] = [
  { type: "input", label: "Input", icon: ArrowLeftFromLine, iconColor: "text-blue-400", bgColor: "bg-blue-950/60 border-blue-800/40", desc: "Entry point" },
  { type: "llm-agent", label: "LLM Agent", icon: Bot, iconColor: "text-violet-400", bgColor: "bg-violet-950/60 border-violet-800/40", desc: "AI model agent" },
  { type: "tool", label: "Tool", icon: Wrench, iconColor: "text-amber-400", bgColor: "bg-amber-950/60 border-amber-800/40", desc: "API / function" },
  { type: "router", label: "Router", icon: GitFork, iconColor: "text-cyan-400", bgColor: "bg-cyan-950/60 border-cyan-800/40", desc: "Conditional routing" },
  { type: "human-review", label: "Human Review", icon: UserCheck, iconColor: "text-emerald-400", bgColor: "bg-emerald-950/60 border-emerald-800/40", desc: "Human checkpoint" },
  { type: "transformer", label: "Transformer", icon: Shuffle, iconColor: "text-orange-400", bgColor: "bg-orange-950/60 border-orange-800/40", desc: "Data transform" },
  { type: "memory", label: "Memory", icon: Database, iconColor: "text-teal-400", bgColor: "bg-teal-950/60 border-teal-800/40", desc: "Context store" },
  { type: "subagent-group", label: "Sub-Agents", icon: Layers, iconColor: "text-indigo-400", bgColor: "bg-indigo-950/60 border-indigo-800/40", desc: "Nested pipeline" },
  { type: "output", label: "Output", icon: ArrowRightToLine, iconColor: "text-rose-400", bgColor: "bg-rose-950/60 border-rose-800/40", desc: "Exit point" },
];

interface NodePaletteProps {
  onDragStart: (type: NodeTypeValue) => void;
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-1 mb-2">
        Nodes
      </h3>
      {NODE_TYPES.map((nodeType) => (
        <div
          key={nodeType.type}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/agentflow-node", nodeType.type);
            e.dataTransfer.effectAllowed = "move";
            onDragStart(nodeType.type);
          }}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all",
            nodeType.bgColor,
            "hover:brightness-125 hover:scale-[1.02]"
          )}
          data-testid={`palette-node-${nodeType.type}`}
        >
          <nodeType.icon className={cn("w-4 h-4 shrink-0", nodeType.iconColor)} />
          <div className="min-w-0">
            <div className="text-xs font-medium text-zinc-200 truncate">{nodeType.label}</div>
            <div className="text-[10px] text-zinc-500 truncate">{nodeType.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
