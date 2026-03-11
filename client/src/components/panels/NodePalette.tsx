import type { NodeTypeValue } from "@shared/schema";
import {
  Bot, Wrench, GitFork, UserCheck, ArrowRightToLine, ArrowLeftFromLine,
  Shuffle, Database, Layers, Code2, ShieldCheck, LayoutDashboard, Combine, Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NODE_GROUPS: { group: string; items: { type: NodeTypeValue; label: string; icon: typeof Bot; accent: string; desc: string }[] }[] = [
  {
    group: "Flow",
    items: [
      { type: "input", label: "Input", icon: ArrowLeftFromLine, accent: "#2563eb", desc: "Entry point" },
      { type: "output", label: "Output", icon: ArrowRightToLine, accent: "#e11d48", desc: "Exit point" },
      { type: "router", label: "Router", icon: GitFork, accent: "#0891b2", desc: "Conditional routing" },
      { type: "loop", label: "Loop", icon: Repeat, accent: "#ca8a04", desc: "Iterate until done" },
    ],
  },
  {
    group: "Agents",
    items: [
      { type: "llm-agent", label: "LLM Agent", icon: Bot, accent: "#7c3aed", desc: "Cloud.ru AI model" },
      { type: "human-review", label: "Human Review", icon: UserCheck, accent: "#059669", desc: "Human checkpoint" },
      { type: "subagent-group", label: "Sub-Agents", icon: Layers, accent: "#6366f1", desc: "Nested pipeline" },
    ],
  },
  {
    group: "Tools",
    items: [
      { type: "tool", label: "API Tool", icon: Wrench, accent: "#d97706", desc: "External API call" },
      { type: "code-executor", label: "Code Executor", icon: Code2, accent: "#84cc16", desc: "Run code in sandbox" },
      { type: "transformer", label: "Transformer", icon: Shuffle, accent: "#ea580c", desc: "Data transform" },
    ],
  },
  {
    group: "Data",
    items: [
      { type: "blackboard", label: "Blackboard", icon: LayoutDashboard, accent: "#8b5cf6", desc: "Shared knowledge" },
      { type: "memory", label: "Memory", icon: Database, accent: "#0d9488", desc: "Context store" },
      { type: "validator", label: "Validator", icon: ShieldCheck, accent: "#c026d3", desc: "Schema validation" },
      { type: "aggregator", label: "Aggregator", icon: Combine, accent: "#16a34a", desc: "Merge outputs" },
    ],
  },
];

interface NodePaletteProps {
  onDragStart: (type: NodeTypeValue) => void;
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <div className="space-y-3">
      {NODE_GROUPS.map((group) => (
        <div key={group.group}>
          <h4 className="text-[10px] font-medium uppercase tracking-wider text-[#525252] px-1 mb-1.5">{group.group}</h4>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/agentflow-node", item.type);
                  e.dataTransfer.effectAllowed = "move";
                  onDragStart(item.type);
                }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:bg-[#1e1e1e] group/item border border-transparent hover:border-[#2a2a2a]"
                data-testid={`palette-node-${item.type}`}
              >
                <div className="p-1 rounded-md" style={{ backgroundColor: `${item.accent}18` }}>
                  <item.icon className="w-3.5 h-3.5" style={{ color: item.accent }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-[#d4d4d8]">{item.label}</div>
                </div>
                <span className="text-[9px] text-[#525252] group-hover/item:text-[#71717a] transition-colors">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
