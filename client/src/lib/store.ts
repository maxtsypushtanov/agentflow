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

interface FlowState {
  nodes: Node<AgentNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  workflowId: number | null;
  workflowName: string;
  workflowDescription: string;
  isSimulating: boolean;
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  
  setNodes: (nodes: Node<AgentNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setWorkflowId: (id: number | null) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (desc: string) => void;
  
  addNode: (type: NodeTypeValue, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<AgentNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  
  loadWorkflow: (nodes: Node<AgentNodeData>[], edges: Edge[], id: number, name: string, description: string) => void;
  clearCanvas: () => void;
  
  startSimulation: () => void;
  stopSimulation: () => void;
}

const NODE_DEFAULTS: Record<NodeTypeValue, { label: string; description: string; config: Record<string, unknown> }> = {
  "llm-agent": { label: "LLM Agent", description: "AI language model agent", config: { model: "gpt-4o", temperature: 0.7, systemPrompt: "" } },
  "tool": { label: "Tool", description: "External tool or API call", config: { endpoint: "", method: "POST" } },
  "router": { label: "Router", description: "Route messages based on conditions", config: { routes: ["route-a", "route-b"] } },
  "human-review": { label: "Human Review", description: "Human-in-the-loop checkpoint", config: {} },
  "input": { label: "Input", description: "Workflow entry point", config: {} },
  "output": { label: "Output", description: "Workflow exit point", config: {} },
  "transformer": { label: "Transformer", description: "Transform data between steps", config: { template: "" } },
  "memory": { label: "Memory", description: "Shared memory / context store", config: { type: "short-term" } },
  "subagent-group": { label: "Sub-Agent Group", description: "Nested agent pipeline", config: {} },
};

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowId: null,
  workflowName: "Untitled Workflow",
  workflowDescription: "",
  isSimulating: false,

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

  addNode: (type, position) => {
    const defaults = NODE_DEFAULTS[type];
    const newNode: Node<AgentNodeData> = {
      id: uuidv4(),
      type,
      position,
      data: {
        label: defaults.label,
        type,
        description: defaults.description,
        config: { ...defaults.config },
        status: "idle",
      },
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
    const newNode: Node<AgentNodeData> = {
      ...node,
      id: uuidv4(),
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: { ...node.data, label: `${node.data.label} (copy)` },
      selected: false,
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  loadWorkflow: (nodes, edges, id, name, description) => {
    set({ nodes, edges, workflowId: id, workflowName: name, workflowDescription: description, selectedNodeId: null });
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], selectedNodeId: null, workflowId: null, workflowName: "Untitled Workflow", workflowDescription: "" });
  },

  startSimulation: () => {
    const { nodes } = get();
    // Reset all statuses
    set({
      isSimulating: true,
      nodes: nodes.map((n) => ({ ...n, data: { ...n.data, status: "idle" as const } })),
    });

    // Find input nodes to start
    const inputNodes = nodes.filter((n) => n.data.type === "input");
    const edges = get().edges;

    const simulateNode = (nodeId: string, delay: number) => {
      setTimeout(() => {
        if (!get().isSimulating) return;
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, status: "running" as const } } : n
          ),
        });

        setTimeout(() => {
          if (!get().isSimulating) return;
          const isError = Math.random() < 0.05;
          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, status: isError ? ("error" as const) : ("success" as const) } }
                : n
            ),
          });

          if (!isError) {
            const outgoing = edges.filter((e) => e.source === nodeId);
            outgoing.forEach((edge, i) => {
              simulateNode(edge.target, 400 + i * 200);
            });
          }
        }, 800 + Math.random() * 600);
      }, delay);
    };

    inputNodes.forEach((node, i) => simulateNode(node.id, i * 300));
  },

  stopSimulation: () => {
    const { nodes } = get();
    set({
      isSimulating: false,
      nodes: nodes.map((n) => ({ ...n, data: { ...n.data, status: "idle" as const } })),
    });
  },
}));
