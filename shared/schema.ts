import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  nodes: jsonb("nodes").notNull().default([]),
  edges: jsonb("edges").notNull().default([]),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({ id: true });
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

// Frontend-only types for the canvas
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
]);

export type NodeTypeValue = z.infer<typeof NodeTypeEnum>;

export interface AgentNodeData {
  label: string;
  type: NodeTypeValue;
  description: string;
  config: Record<string, unknown>;
  status?: "idle" | "running" | "success" | "error";
}
