import { pgTable, text, serial, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ═══════════════════════════════════════════════
// Database Tables
// ═══════════════════════════════════════════════

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  pattern: text("pattern").default("custom"),
  nodes: jsonb("nodes").notNull().default([]),
  edges: jsonb("edges").notNull().default([]),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({ id: true });
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

// ═══════════════════════════════════════════════
// Node Types
// ═══════════════════════════════════════════════

export const NodeTypeEnum = z.enum([
  "llm-agent",
  "tool",
  "router",
  "human-review",
  "input",
  "output",
  "transformer",
  "memory",
  "subagent-group",
  "code-executor",
  "validator",
  "blackboard",
  "aggregator",
  "loop",
]);

export type NodeTypeValue = z.infer<typeof NodeTypeEnum>;

export interface AgentNodeData {
  label: string;
  type: NodeTypeValue;
  description: string;
  config: Record<string, unknown>;
  status?: "idle" | "running" | "success" | "error";
  lastOutput?: string;
  executionTime?: number;
}

// ═══════════════════════════════════════════════
// Architecture Patterns
// ═══════════════════════════════════════════════

export type PatternType =
  | "custom"
  | "blackboard"
  | "pipeline"
  | "hierarchical"
  | "voting"
  | "react"
  | "map-reduce"
  | "supervisor";

export interface PatternTemplate {
  id: PatternType;
  name: string;
  description: string;
  icon: string;
  nodes: any[];
  edges: any[];
}

// ═══════════════════════════════════════════════
// Settings
// ═══════════════════════════════════════════════

export interface AppSettings {
  cloudruApiKey: string;
  cloudruKeyId: string;
  cloudruSecret: string;
  cloudruBaseUrl: string;
  cloudruModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  executionTimeout: number;
  sandboxEnabled: boolean;
}

// ═══════════════════════════════════════════════
// Execution Engine Types
// ═══════════════════════════════════════════════

export interface ExecutionContext {
  workflowId: number;
  variables: Record<string, unknown>;
  blackboard: Record<string, unknown>;
  history: ExecutionStep[];
  status: "running" | "completed" | "error" | "paused";
}

export interface ExecutionStep {
  nodeId: string;
  nodeType: NodeTypeValue;
  input: unknown;
  output: unknown;
  startTime: number;
  endTime: number;
  status: "success" | "error";
  error?: string;
}

// ═══════════════════════════════════════════════
// Structured Output Validation
// ═══════════════════════════════════════════════

export interface ValidationSchema {
  type: "json-schema" | "zod" | "regex";
  schema: string; // JSON string of the schema
  strict: boolean;
}

// ═══════════════════════════════════════════════
// API Types for Production
// ═══════════════════════════════════════════════

export interface WorkflowExecuteRequest {
  workflowId: number;
  input: Record<string, unknown>;
  settings?: Partial<AppSettings>;
}

export interface WorkflowExecuteResponse {
  executionId: string;
  status: string;
  output: unknown;
  steps: ExecutionStep[];
  totalTime: number;
}
