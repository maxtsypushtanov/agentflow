import { create } from "zustand";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import type { AgentNodeData, NodeTypeValue } from "@shared/schema";

interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  timestamp: number;
}

interface FlowState {
  nodes: Node<AgentNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  workflowId: number | null;
  workflowName: string;
  workflowDescription: string;
  workflowPattern: string;
  isSimulating: boolean;

  chatMessages: ChatMessage[];
  isChatOpen: boolean;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  setNodes: (nodes: Node<AgentNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setWorkflowId: (id: number | null) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (desc: string) => void;
  setWorkflowPattern: (p: string) => void;

  addNode: (type: NodeTypeValue, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<AgentNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;

  loadWorkflow: (nodes: Node<AgentNodeData>[], edges: Edge[], id: number, name: string, description: string, pattern?: string) => void;
  clearCanvas: () => void;

  addChatMessage: (role: 'user' | 'agent', text: string) => void;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;

  startSimulation: () => void;
  stopSimulation: () => void;
}

const NODE_DEFAULTS: Record<NodeTypeValue, { label: string; description: string; config: Record<string, unknown> }> = {
  "llm-agent": { label: "LLM Agent", description: "AI agent powered by Cloud.ru models", config: { model: "cloud-ru-auto", temperature: 0.7, systemPrompt: "", maxTokens: 2048 } },
  "tool": { label: "Tool", description: "External API or function call", config: { endpoint: "", method: "POST", headers: "{}" } },
  "router": { label: "Router", description: "Route messages based on conditions", config: { routes: ["route-a", "route-b"], routingPrompt: "" } },
  "human-review": { label: "Human Review", description: "Human-in-the-loop checkpoint", config: { instructions: "" } },
  "input": { label: "Input", description: "Workflow entry point", config: {} },
  "output": { label: "Output", description: "Workflow exit point", config: {} },
  "transformer": { label: "Transformer", description: "Transform data between steps", config: { template: "", language: "jmespath" } },
  "memory": { label: "Memory", description: "Persistent context store", config: { type: "short-term", maxEntries: 100 } },
  "subagent-group": { label: "Sub-Agent Group", description: "Nested agent pipeline", config: { workflowId: null } },
  "code-executor": { label: "Code Executor", description: "Write and execute code in sandbox", config: { language: "python", code: "# Write your code here\nprint('Hello!')", timeout: 10000 } },
  "validator": { label: "Validator", description: "Validate structured output against schema", config: { schemaType: "json-schema", schema: '{"type":"object","properties":{}}', strict: true } },
  "blackboard": { label: "Blackboard", description: "Shared knowledge base for multi-agent collaboration", config: { fields: ["data"], persistent: true } },
  "aggregator": { label: "Aggregator", description: "Aggregate outputs from multiple agents", config: { strategy: "merge", votingThreshold: 0.5 } },
  "loop": { label: "Loop", description: "Iterate until condition is met", config: { maxIterations: 5, condition: "" } },
};

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowId: null,
  workflowName: "Untitled Workflow",
  workflowDescription: "",
  workflowPattern: "custom",
  isSimulating: false,
  chatMessages: [],
  isChatOpen: false,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<AgentNodeData>[] });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, animated: false }, get().edges) });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setWorkflowId: (id) => set({ workflowId: id }),
  setWorkflowName: (name) => set({ workflowName: name }),
  setWorkflowDescription: (desc) => set({ workflowDescription: desc }),
  setWorkflowPattern: (p) => set({ workflowPattern: p }),

  addNode: (type, position) => {
    const defaults = NODE_DEFAULTS[type];
    const newNode: Node<AgentNodeData> = {
      id: uuidv4(),
      type,
      position,
      data: { label: defaults.label, type, description: defaults.description, config: { ...defaults.config }, status: "idle" },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  duplicateNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;
    set({
      nodes: [
        ...get().nodes,
        { ...node, id: uuidv4(), position: { x: node.position.x + 40, y: node.position.y + 40 }, data: { ...node.data, label: `${node.data.label} (copy)` }, selected: false },
      ],
    });
  },

  loadWorkflow: (nodes, edges, id, name, description, pattern) => {
    set({ nodes, edges, workflowId: id, workflowName: name, workflowDescription: description, workflowPattern: pattern || "custom", selectedNodeId: null });
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], selectedNodeId: null, workflowId: null, workflowName: "Untitled Workflow", workflowDescription: "", workflowPattern: "custom" });
  },

  addChatMessage: (role, text) => {
    set({ chatMessages: [...get().chatMessages, { role, text, timestamp: Date.now() }] });
  },
  toggleChat: () => set({ isChatOpen: !get().isChatOpen }),
  setChatOpen: (open) => set({ isChatOpen: open }),

  startSimulation: () => {
    const { nodes } = get();
    set({
      isSimulating: true,
      nodes: nodes.map((n) => ({ ...n, data: { ...n.data, status: "idle" as const } })),
    });

    const inputNodes = nodes.filter((n) => n.data.type === "input");
    const edges = get().edges;

    const simulateNode = (nodeId: string, delay: number) => {
      setTimeout(() => {
        if (!get().isSimulating) return;
        set({ nodes: get().nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, status: "running" as const } } : n) });

        setTimeout(() => {
          if (!get().isSimulating) return;
          const isError = Math.random() < 0.04;
          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, status: isError ? ("error" as const) : ("success" as const) } } : n
            ),
          });
          if (!isError) {
            const outgoing = edges.filter((e) => e.source === nodeId);
            outgoing.forEach((edge, i) => simulateNode(edge.target, 400 + i * 200));
          }
        }, 800 + Math.random() * 600);
      }, delay);
    };

    inputNodes.forEach((node, i) => simulateNode(node.id, i * 300));
  },

  stopSimulation: () => {
    set({
      isSimulating: false,
      nodes: get().nodes.map((n) => ({ ...n, data: { ...n.data, status: "idle" as const } })),
    });
  },
}));
