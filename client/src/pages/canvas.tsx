import { useCallback, useRef, useMemo } from "react";
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  BackgroundVariant, type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFlowStore } from "@/lib/store";
import type { NodeTypeValue } from "@shared/schema";
import {
  LLMAgentNode, ToolNode, RouterNode, HumanReviewNode, InputNode, OutputNode,
  TransformerNode, MemoryNode, SubagentGroupNode, CodeExecutorNode, ValidatorNode,
  BlackboardNode, AggregatorNode, LoopNode,
} from "@/components/nodes/BaseNode";
import { Toolbar } from "@/components/Toolbar";

const nodeTypes = {
  "llm-agent": LLMAgentNode, "tool": ToolNode, "router": RouterNode,
  "human-review": HumanReviewNode, "input": InputNode, "output": OutputNode,
  "transformer": TransformerNode, "memory": MemoryNode, "subagent-group": SubagentGroupNode,
  "code-executor": CodeExecutorNode, "validator": ValidatorNode, "blackboard": BlackboardNode,
  "aggregator": AggregatorNode, "loop": LoopNode,
};

const defaultEdgeOptions = {
  style: { stroke: "#333", strokeWidth: 1.5 },
  type: "smoothstep",
};

function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId } = useFlowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/agentflow-node") as NodeTypeValue;
    if (!type || !reactFlowInstance.current || !reactFlowWrapper.current) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.current.screenToFlowPosition({
      x: event.clientX - bounds.left, y: event.clientY - bounds.top,
    });
    addNode(type, position);
  }, [addNode]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    setTimeout(() => instance.fitView({ padding: 0.2, duration: 300 }), 100);
  }, []);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className="flex flex-col h-full" data-testid="canvas-container">
      <Toolbar />
      <div ref={reactFlowWrapper} className="flex-1">
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
          nodeTypes={nodeTypes} defaultEdgeOptions={defaultEdgeOptions}
          onDragOver={onDragOver} onDrop={onDrop} onInit={onInit}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView snapToGrid snapGrid={[20, 20]}
          proOptions={proOptions} minZoom={0.1} maxZoom={3}
          deleteKeyCode={["Backspace", "Delete"]}
          className="bg-[#0a0a0a]"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={0.8} color="#1a1a1a" />
          <Controls
            className="!bg-[#141414] !border-[#222] !rounded-lg !shadow-lg [&>button]:!bg-[#141414] [&>button]:!border-[#222] [&>button]:!text-[#525252] [&>button:hover]:!bg-[#1e1e1e] [&>button:hover]:!text-[#a1a1aa]"
            showInteractive={false}
          />
          <MiniMap
            className="!bg-[#141414] !border-[#222] !rounded-lg"
            nodeColor="#2a2a2a"
            maskColor="rgba(0,0,0,0.8)"
            pannable zoomable
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
