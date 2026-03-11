import { useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFlowStore } from "@/lib/store";
import type { NodeTypeValue } from "@shared/schema";
import {
  LLMAgentNode,
  ToolNode,
  RouterNode,
  HumanReviewNode,
  InputNode,
  OutputNode,
  TransformerNode,
  MemoryNode,
  SubagentGroupNode,
} from "@/components/nodes/BaseNode";
import { Toolbar } from "@/components/Toolbar";

const nodeTypes = {
  "llm-agent": LLMAgentNode,
  "tool": ToolNode,
  "router": RouterNode,
  "human-review": HumanReviewNode,
  "input": InputNode,
  "output": OutputNode,
  "transformer": TransformerNode,
  "memory": MemoryNode,
  "subagent-group": SubagentGroupNode,
};

const defaultEdgeOptions = {
  style: { stroke: "#52525b", strokeWidth: 2 },
  type: "smoothstep",
};

function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
  } = useFlowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/agentflow-node") as NodeTypeValue;
      if (!type || !reactFlowInstance.current || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      addNode(type, position);
    },
    [addNode]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    setTimeout(() => instance.fitView({ padding: 0.2, duration: 300 }), 100);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className="flex flex-col h-full" data-testid="canvas-container">
      <Toolbar />
      <div ref={reactFlowWrapper} className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onInit={onInit}
          onPaneClick={onPaneClick}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          proOptions={proOptions}
          minZoom={0.1}
          maxZoom={3}
          deleteKeyCode={["Backspace", "Delete"]}
          className="bg-zinc-950"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#27272a"
          />
          <Controls
            className="!bg-zinc-900 !border-zinc-800 !rounded-lg !shadow-lg [&>button]:!bg-zinc-900 [&>button]:!border-zinc-800 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-800"
            showInteractive={false}
          />
          <MiniMap
            className="!bg-zinc-900 !border-zinc-800 !rounded-lg"
            nodeColor="#3f3f46"
            maskColor="rgba(0,0,0,0.7)"
            pannable
            zoomable
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
