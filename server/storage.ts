import type { Workflow, InsertWorkflow, AppSettings, ExecutionContext } from "@shared/schema";

export interface IStorage {
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  getExecution(id: string): Promise<ExecutionContext | undefined>;
  saveExecution(id: string, ctx: ExecutionContext): Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  cloudruApiKey: "",
  cloudruKeyId: "",
  cloudruSecret: "",
  cloudruBaseUrl: "https://api.cloud.ru/v1",
  cloudruModel: "",
  defaultTemperature: 0.7,
  defaultMaxTokens: 2048,
  executionTimeout: 30000,
  sandboxEnabled: true,
};

export class MemStorage implements IStorage {
  private workflows: Map<number, Workflow>;
  private settings: AppSettings;
  private executions: Map<string, ExecutionContext>;
  private currentId: number;

  constructor() {
    this.workflows = new Map();
    this.settings = { ...DEFAULT_SETTINGS };
    this.executions = new Map();
    this.currentId = 1;
    this.seedDemoWorkflows();
  }

  private seedDemoWorkflows() {
    // Demo 1: Customer Support Pipeline
    const demo1: Workflow = {
      id: this.currentId++,
      name: "Customer Support Pipeline",
      description: "Multi-agent system for handling customer inquiries with routing and escalation",
      pattern: "pipeline",
      nodes: JSON.parse(JSON.stringify([
        { id: "input-1", type: "input", position: { x: 80, y: 300 }, data: { label: "User Query", type: "input", description: "Incoming customer message", config: {}, status: "idle" } },
        { id: "router-1", type: "router", position: { x: 380, y: 300 }, data: { label: "Intent Router", type: "router", description: "Classify intent: billing, technical, general", config: { routes: ["billing", "technical", "general"] }, status: "idle" } },
        { id: "llm-1", type: "llm-agent", position: { x: 720, y: 120 }, data: { label: "Billing Agent", type: "llm-agent", description: "Handles billing and payment issues", config: { model: "cloud-ru-auto", temperature: 0.3, systemPrompt: "You are a billing specialist." }, status: "idle" } },
        { id: "llm-2", type: "llm-agent", position: { x: 720, y: 320 }, data: { label: "Tech Support Agent", type: "llm-agent", description: "Resolves technical problems", config: { model: "cloud-ru-auto", temperature: 0.2, systemPrompt: "You are a technical support engineer." }, status: "idle" } },
        { id: "llm-3", type: "llm-agent", position: { x: 720, y: 520 }, data: { label: "General Agent", type: "llm-agent", description: "Handles general inquiries", config: { model: "cloud-ru-auto", temperature: 0.7, systemPrompt: "You are a friendly general assistant." }, status: "idle" } },
        { id: "tool-1", type: "tool", position: { x: 1060, y: 120 }, data: { label: "Billing API", type: "tool", description: "Look up billing records", config: { endpoint: "/api/billing" }, status: "idle" } },
        { id: "human-1", type: "human-review", position: { x: 1060, y: 320 }, data: { label: "Escalation Review", type: "human-review", description: "Human reviews complex cases", config: {}, status: "idle" } },
        { id: "validator-1", type: "validator", position: { x: 1300, y: 300 }, data: { label: "Response Validator", type: "validator", description: "Validate response structure", config: { schemaType: "json-schema", schema: '{"type":"object","required":["response","confidence"],"properties":{"response":{"type":"string"},"confidence":{"type":"number","minimum":0,"maximum":1}}}' }, status: "idle" } },
        { id: "output-1", type: "output", position: { x: 1580, y: 300 }, data: { label: "Response", type: "output", description: "Final response to customer", config: {}, status: "idle" } },
      ])),
      edges: JSON.parse(JSON.stringify([
        { id: "e1", source: "input-1", target: "router-1", animated: true },
        { id: "e2", source: "router-1", target: "llm-1", label: "billing" },
        { id: "e3", source: "router-1", target: "llm-2", label: "technical" },
        { id: "e4", source: "router-1", target: "llm-3", label: "general" },
        { id: "e5", source: "llm-1", target: "tool-1" },
        { id: "e6", source: "llm-2", target: "human-1" },
        { id: "e7", source: "tool-1", target: "validator-1" },
        { id: "e8", source: "human-1", target: "validator-1" },
        { id: "e9", source: "llm-3", target: "validator-1" },
        { id: "e10", source: "validator-1", target: "output-1" },
      ])),
    };
    this.workflows.set(demo1.id, demo1);

    // Demo 2: Blackboard Pattern
    const demo2: Workflow = {
      id: this.currentId++,
      name: "Blackboard: Research Synthesis",
      description: "Blackboard pattern — multiple specialist agents contribute to shared knowledge base",
      pattern: "blackboard",
      nodes: JSON.parse(JSON.stringify([
        { id: "input-1", type: "input", position: { x: 80, y: 320 }, data: { label: "Research Query", type: "input", description: "Research topic input", config: {}, status: "idle" } },
        { id: "bb-1", type: "blackboard", position: { x: 420, y: 320 }, data: { label: "Knowledge Base", type: "blackboard", description: "Shared blackboard — all agents read/write here", config: { fields: ["facts", "hypotheses", "evidence", "conclusion"] }, status: "idle" } },
        { id: "llm-1", type: "llm-agent", position: { x: 800, y: 100 }, data: { label: "Fact Finder", type: "llm-agent", description: "Extracts factual claims from data", config: { model: "cloud-ru-auto", temperature: 0.2, systemPrompt: "Extract verified facts from the research topic. Write to blackboard.facts." }, status: "idle" } },
        { id: "llm-2", type: "llm-agent", position: { x: 800, y: 300 }, data: { label: "Hypothesis Generator", type: "llm-agent", description: "Generates hypotheses from facts", config: { model: "cloud-ru-auto", temperature: 0.8, systemPrompt: "Generate hypotheses based on facts from the blackboard." }, status: "idle" } },
        { id: "code-1", type: "code-executor", position: { x: 800, y: 500 }, data: { label: "Data Analyzer", type: "code-executor", description: "Runs statistical analysis code", config: { language: "python", code: "# Analyze data from blackboard\nimport json\ndata = json.loads(input_data)\nresult = {'analysis': 'statistical summary', 'confidence': 0.85}\nprint(json.dumps(result))" }, status: "idle" } },
        { id: "llm-3", type: "llm-agent", position: { x: 1160, y: 320 }, data: { label: "Synthesizer", type: "llm-agent", description: "Synthesizes final conclusion from all contributions", config: { model: "cloud-ru-auto", temperature: 0.4, systemPrompt: "Read all blackboard entries and synthesize a final research conclusion." }, status: "idle" } },
        { id: "validator-1", type: "validator", position: { x: 1460, y: 320 }, data: { label: "Output Validator", type: "validator", description: "Validate structured research output", config: { schemaType: "json-schema", schema: '{"type":"object","required":["conclusion","confidence","sources"],"properties":{"conclusion":{"type":"string"},"confidence":{"type":"number"},"sources":{"type":"array","items":{"type":"string"}}}}' }, status: "idle" } },
        { id: "output-1", type: "output", position: { x: 1740, y: 320 }, data: { label: "Research Report", type: "output", description: "Final structured research output", config: {}, status: "idle" } },
      ])),
      edges: JSON.parse(JSON.stringify([
        { id: "e1", source: "input-1", target: "bb-1", animated: true },
        { id: "e2", source: "bb-1", target: "llm-1" },
        { id: "e3", source: "bb-1", target: "llm-2" },
        { id: "e4", source: "bb-1", target: "code-1" },
        { id: "e5", source: "llm-1", target: "bb-1", label: "facts", style: { strokeDasharray: "5,5" } },
        { id: "e6", source: "llm-2", target: "bb-1", label: "hypotheses", style: { strokeDasharray: "5,5" } },
        { id: "e7", source: "code-1", target: "bb-1", label: "evidence", style: { strokeDasharray: "5,5" } },
        { id: "e8", source: "bb-1", target: "llm-3" },
        { id: "e9", source: "llm-3", target: "validator-1" },
        { id: "e10", source: "validator-1", target: "output-1" },
      ])),
    };
    this.workflows.set(demo2.id, demo2);

    // Demo 3: Code Generation Pipeline
    const demo3: Workflow = {
      id: this.currentId++,
      name: "Code Generation & Review",
      description: "ReAct pattern with code generation, execution, and review",
      pattern: "react",
      nodes: JSON.parse(JSON.stringify([
        { id: "input-1", type: "input", position: { x: 80, y: 300 }, data: { label: "Task Description", type: "input", description: "Code task specification", config: {}, status: "idle" } },
        { id: "llm-1", type: "llm-agent", position: { x: 400, y: 300 }, data: { label: "Code Planner", type: "llm-agent", description: "Plans code implementation approach", config: { model: "cloud-ru-auto", temperature: 0.3, systemPrompt: "You are a senior software architect. Plan the implementation." }, status: "idle" } },
        { id: "code-1", type: "code-executor", position: { x: 740, y: 180 }, data: { label: "Code Generator", type: "code-executor", description: "Generates and executes code", config: { language: "python", code: "# Generated code will be placed here\nprint('Hello, World!')" }, status: "idle" } },
        { id: "code-2", type: "code-executor", position: { x: 740, y: 420 }, data: { label: "Test Runner", type: "code-executor", description: "Runs automated tests", config: { language: "python", code: "# Test suite\nimport unittest\n# Tests here" }, status: "idle" } },
        { id: "llm-2", type: "llm-agent", position: { x: 1080, y: 300 }, data: { label: "Code Reviewer", type: "llm-agent", description: "Reviews code quality and correctness", config: { model: "cloud-ru-auto", temperature: 0.2, systemPrompt: "Review code for bugs, security issues, and best practices." }, status: "idle" } },
        { id: "validator-1", type: "validator", position: { x: 1380, y: 300 }, data: { label: "Output Schema", type: "validator", description: "Validate final output structure", config: { schemaType: "json-schema", schema: '{"type":"object","required":["code","tests","review"],"properties":{"code":{"type":"string"},"tests":{"type":"string"},"review":{"type":"object","properties":{"score":{"type":"number"},"issues":{"type":"array"}}}}}' }, status: "idle" } },
        { id: "output-1", type: "output", position: { x: 1660, y: 300 }, data: { label: "Final Code", type: "output", description: "Reviewed and tested code output", config: {}, status: "idle" } },
      ])),
      edges: JSON.parse(JSON.stringify([
        { id: "e1", source: "input-1", target: "llm-1", animated: true },
        { id: "e2", source: "llm-1", target: "code-1" },
        { id: "e3", source: "llm-1", target: "code-2" },
        { id: "e4", source: "code-1", target: "llm-2" },
        { id: "e5", source: "code-2", target: "llm-2" },
        { id: "e6", source: "llm-2", target: "validator-1" },
        { id: "e7", source: "validator-1", target: "output-1" },
      ])),
    };
    this.workflows.set(demo3.id, demo3);
  }

  async getWorkflows(): Promise<Workflow[]> { return Array.from(this.workflows.values()); }
  async getWorkflow(id: number): Promise<Workflow | undefined> { return this.workflows.get(id); }
  async createWorkflow(wf: InsertWorkflow): Promise<Workflow> {
    const id = this.currentId++;
    const w: Workflow = { id, ...wf };
    this.workflows.set(id, w);
    return w;
  }
  async updateWorkflow(id: number, wf: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const existing = this.workflows.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...wf };
    this.workflows.set(id, updated);
    return updated;
  }
  async deleteWorkflow(id: number): Promise<boolean> { return this.workflows.delete(id); }
  async getSettings(): Promise<AppSettings> { return { ...this.settings }; }
  async updateSettings(s: Partial<AppSettings>): Promise<AppSettings> {
    this.settings = { ...this.settings, ...s };
    return { ...this.settings };
  }
  async getExecution(id: string): Promise<ExecutionContext | undefined> { return this.executions.get(id); }
  async saveExecution(id: string, ctx: ExecutionContext): Promise<void> { this.executions.set(id, ctx); }
}

export const storage = new MemStorage();
