import type { Workflow, InsertWorkflow } from "@shared/schema";

export interface IStorage {
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private workflows: Map<number, Workflow>;
  private currentId: number;

  constructor() {
    this.workflows = new Map();
    this.currentId = 1;
    
    // Seed with a demo workflow
    const demo: Workflow = {
      id: this.currentId++,
      name: "Customer Support Pipeline",
      description: "Multi-agent system for handling customer inquiries",
      nodes: JSON.parse(JSON.stringify([
        {
          id: "input-1",
          type: "input",
          position: { x: 80, y: 300 },
          data: { label: "User Query", type: "input", description: "Incoming customer message", config: {}, status: "idle" },
        },
        {
          id: "router-1",
          type: "router",
          position: { x: 380, y: 300 },
          data: { label: "Intent Router", type: "router", description: "Classify intent: billing, technical, general", config: { routes: ["billing", "technical", "general"] }, status: "idle" },
        },
        {
          id: "llm-1",
          type: "llm-agent",
          position: { x: 720, y: 120 },
          data: { label: "Billing Agent", type: "llm-agent", description: "Handles billing and payment issues", config: { model: "gpt-4o", temperature: 0.3, systemPrompt: "You are a billing specialist." }, status: "idle" },
        },
        {
          id: "llm-2",
          type: "llm-agent",
          position: { x: 720, y: 320 },
          data: { label: "Tech Support Agent", type: "llm-agent", description: "Resolves technical problems", config: { model: "gpt-4o", temperature: 0.2, systemPrompt: "You are a technical support engineer." }, status: "idle" },
        },
        {
          id: "llm-3",
          type: "llm-agent",
          position: { x: 720, y: 520 },
          data: { label: "General Agent", type: "llm-agent", description: "Handles general inquiries", config: { model: "gpt-4o-mini", temperature: 0.7, systemPrompt: "You are a friendly general assistant." }, status: "idle" },
        },
        {
          id: "tool-1",
          type: "tool",
          position: { x: 1060, y: 120 },
          data: { label: "Stripe API", type: "tool", description: "Look up billing records", config: { endpoint: "https://api.stripe.com" }, status: "idle" },
        },
        {
          id: "human-1",
          type: "human-review",
          position: { x: 1060, y: 320 },
          data: { label: "Escalation Review", type: "human-review", description: "Human reviews complex cases", config: {}, status: "idle" },
        },
        {
          id: "output-1",
          type: "output",
          position: { x: 1400, y: 300 },
          data: { label: "Response", type: "output", description: "Final response to customer", config: {}, status: "idle" },
        },
      ])),
      edges: JSON.parse(JSON.stringify([
        { id: "e-input-router", source: "input-1", target: "router-1", animated: true },
        { id: "e-router-billing", source: "router-1", target: "llm-1", label: "billing" },
        { id: "e-router-tech", source: "router-1", target: "llm-2", label: "technical" },
        { id: "e-router-general", source: "router-1", target: "llm-3", label: "general" },
        { id: "e-billing-stripe", source: "llm-1", target: "tool-1" },
        { id: "e-tech-human", source: "llm-2", target: "human-1" },
        { id: "e-stripe-output", source: "tool-1", target: "output-1" },
        { id: "e-human-output", source: "human-1", target: "output-1" },
        { id: "e-general-output", source: "llm-3", target: "output-1" },
      ])),
    };
    this.workflows.set(demo.id, demo);
  }

  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const id = this.currentId++;
    const newWorkflow: Workflow = { id, ...workflow };
    this.workflows.set(id, newWorkflow);
    return newWorkflow;
  }

  async updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const existing = this.workflows.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...workflow };
    this.workflows.set(id, updated);
    return updated;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }
}

export const storage = new MemStorage();
