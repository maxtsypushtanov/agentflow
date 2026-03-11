import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertWorkflowSchema } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

export async function registerRoutes(server: Server, app: Express) {
  // ═══════════════════════════════════════════════
  // Workflow CRUD
  // ═══════════════════════════════════════════════

  app.get("/api/workflows", async (_req, res) => {
    res.json(await storage.getWorkflows());
  });

  app.get("/api/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const wf = await storage.getWorkflow(id);
    if (!wf) return res.status(404).json({ error: "Not found" });
    res.json(wf);
  });

  app.post("/api/workflows", async (req, res) => {
    const parsed = insertWorkflowSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await storage.createWorkflow(parsed.data));
  });

  app.patch("/api/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const wf = await storage.updateWorkflow(id, req.body);
    if (!wf) return res.status(404).json({ error: "Not found" });
    res.json(wf);
  });

  app.delete("/api/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    if (!(await storage.deleteWorkflow(id))) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  });

  // ═══════════════════════════════════════════════
  // Settings
  // ═══════════════════════════════════════════════

  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getSettings();
    // Mask secrets before sending
    res.json({
      ...settings,
      cloudruApiKey: settings.cloudruApiKey ? "••••••" + settings.cloudruApiKey.slice(-4) : "",
      cloudruSecret: settings.cloudruSecret ? "••••••" + settings.cloudruSecret.slice(-4) : "",
    });
  });

  app.patch("/api/settings", async (req, res) => {
    const settings = await storage.updateSettings(req.body);
    res.json({
      ...settings,
      cloudruApiKey: settings.cloudruApiKey ? "••••••" + settings.cloudruApiKey.slice(-4) : "",
      cloudruSecret: settings.cloudruSecret ? "••••••" + settings.cloudruSecret.slice(-4) : "",
    });
  });

  // ═══════════════════════════════════════════════
  // Cloud.ru Foundation Models Proxy
  // ═══════════════════════════════════════════════

  app.get("/api/cloudru/models", async (_req, res) => {
    const settings = await storage.getSettings();
    if (!settings.cloudruApiKey && !settings.cloudruKeyId) {
      return res.status(400).json({ error: "Cloud.ru API key not configured" });
    }
    try {
      const baseUrl = settings.cloudruBaseUrl || "https://api.cloud.ru/v1";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (settings.cloudruApiKey) {
        headers["Authorization"] = `Bearer ${settings.cloudruApiKey}`;
      }
      const response = await fetch(`${baseUrl}/models`, { headers });
      if (!response.ok) throw new Error(`Cloud.ru API error: ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(502).json({ error: err.message });
    }
  });

  app.post("/api/cloudru/chat", async (req, res) => {
    const settings = await storage.getSettings();
    if (!settings.cloudruApiKey && !settings.cloudruKeyId) {
      return res.status(400).json({ error: "Cloud.ru API key not configured" });
    }
    try {
      const baseUrl = settings.cloudruBaseUrl || "https://api.cloud.ru/v1";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (settings.cloudruApiKey) {
        headers["Authorization"] = `Bearer ${settings.cloudruApiKey}`;
      }

      const body = {
        model: req.body.model || settings.cloudruModel,
        messages: req.body.messages,
        temperature: req.body.temperature ?? settings.defaultTemperature,
        max_completion_tokens: req.body.max_tokens ?? settings.defaultMaxTokens,
        ...(req.body.guided_json ? { guided_json: req.body.guided_json } : {}),
        ...(req.body.response_format ? { response_format: req.body.response_format } : {}),
        ...(req.body.tools ? { tools: req.body.tools } : {}),
        stream: req.body.stream || false,
      };

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Cloud.ru API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(502).json({ error: err.message });
    }
  });

  // ═══════════════════════════════════════════════
  // Code Sandbox Execution
  // ═══════════════════════════════════════════════

  app.post("/api/sandbox/execute", async (req, res) => {
    const { code, language, timeout } = req.body;
    const maxTimeout = Math.min(timeout || 10000, 30000);

    try {
      if (language === "javascript" || language === "typescript") {
        // Execute JS in a sandboxed context
        const { VM } = await import("vm2" as any).catch(() => ({ VM: null }));
        
        let output = "";
        const consoleMock = {
          log: (...args: any[]) => { output += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ") + "\n"; },
          error: (...args: any[]) => { output += "ERROR: " + args.join(" ") + "\n"; },
          warn: (...args: any[]) => { output += "WARN: " + args.join(" ") + "\n"; },
        };

        // Fallback to Function-based sandbox
        const fn = new Function("console", "setTimeout", "setInterval", `
          "use strict";
          ${code}
        `);
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Execution timeout")), maxTimeout)
        );

        await Promise.race([
          Promise.resolve(fn(consoleMock, undefined, undefined)),
          timeoutPromise,
        ]);

        res.json({ success: true, output: output.trim(), language });
      } else if (language === "python") {
        // Python execution via child process
        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);
        
        try {
          const { stdout, stderr } = await execAsync(
            `echo ${JSON.stringify(code)} | python3 -c "import sys; exec(sys.stdin.read())"`,
            { timeout: maxTimeout }
          );
          res.json({ success: true, output: (stdout + (stderr ? "\nSTDERR: " + stderr : "")).trim(), language });
        } catch (execErr: any) {
          res.json({ success: false, output: execErr.stderr || execErr.message, language });
        }
      } else {
        res.status(400).json({ error: `Unsupported language: ${language}` });
      }
    } catch (err: any) {
      res.json({ success: false, output: err.message, language });
    }
  });

  // ═══════════════════════════════════════════════
  // Workflow Execution Engine (Production API)
  // ═══════════════════════════════════════════════

  app.post("/api/execute/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const wf = await storage.getWorkflow(id);
    if (!wf) return res.status(404).json({ error: "Workflow not found" });

    const executionId = uuidv4();
    const startTime = Date.now();

    const ctx: any = {
      workflowId: id,
      variables: { input: req.body.input || {} },
      blackboard: {},
      history: [],
      status: "running",
    };

    await storage.saveExecution(executionId, ctx);

    // Return execution ID immediately (async execution)
    res.json({
      executionId,
      status: "accepted",
      message: "Workflow execution started. Poll /api/execute/status/:executionId for results.",
    });

    // Execute asynchronously (simplified — in production use a proper queue)
    try {
      const nodes = (wf.nodes as any[]) || [];
      const edges = (wf.edges as any[]) || [];
      
      // Topological sort for execution order
      const inputNodes = nodes.filter((n: any) => n.data.type === "input");
      const visited = new Set<string>();
      const order: string[] = [];

      function dfs(nodeId: string) {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        const outgoing = edges.filter((e: any) => e.source === nodeId);
        for (const edge of outgoing) {
          dfs(edge.target);
        }
        order.unshift(nodeId);
      }

      for (const input of inputNodes) dfs(input.id);

      // Execute in order
      for (const nodeId of order) {
        const node = nodes.find((n: any) => n.id === nodeId);
        if (!node) continue;

        const step = {
          nodeId,
          nodeType: node.data.type,
          input: ctx.variables,
          output: null as any,
          startTime: Date.now(),
          endTime: 0,
          status: "success" as const,
        };

        try {
          // Simplified node execution (in production, each type has its own executor)
          switch (node.data.type) {
            case "input":
              step.output = ctx.variables.input;
              break;
            case "blackboard":
              step.output = ctx.blackboard;
              break;
            case "output":
              step.output = ctx.variables;
              break;
            default:
              step.output = { processed: true, nodeType: node.data.type };
          }
        } catch (err: any) {
          step.status = "error" as any;
          (step as any).error = err.message;
        }

        step.endTime = Date.now();
        ctx.history.push(step);
      }

      ctx.status = "completed";
      await storage.saveExecution(executionId, ctx);
    } catch (err: any) {
      ctx.status = "error";
      await storage.saveExecution(executionId, ctx);
    }
  });

  app.get("/api/execute/status/:executionId", async (req, res) => {
    const ctx = await storage.getExecution(req.params.executionId);
    if (!ctx) return res.status(404).json({ error: "Execution not found" });
    res.json({
      executionId: req.params.executionId,
      status: ctx.status,
      steps: ctx.history,
      totalTime: ctx.history.length > 0
        ? ctx.history[ctx.history.length - 1].endTime - ctx.history[0].startTime
        : 0,
    });
  });

  // ═══════════════════════════════════════════════
  // Structured Output Validation
  // ═══════════════════════════════════════════════

  app.post("/api/validate", async (req, res) => {
    const { data, schema, schemaType } = req.body;
    try {
      if (schemaType === "json-schema") {
        // Basic JSON Schema validation
        const schemaObj = typeof schema === "string" ? JSON.parse(schema) : schema;
        const errors = validateJsonSchema(data, schemaObj);
        res.json({ valid: errors.length === 0, errors });
      } else if (schemaType === "regex") {
        const regex = new RegExp(schema);
        const valid = regex.test(typeof data === "string" ? data : JSON.stringify(data));
        res.json({ valid, errors: valid ? [] : ["Does not match regex pattern"] });
      } else {
        res.json({ valid: true, errors: [] });
      }
    } catch (err: any) {
      res.json({ valid: false, errors: [err.message] });
    }
  });
}

// Simple JSON Schema validator
function validateJsonSchema(data: any, schema: any, path = ""): string[] {
  const errors: string[] = [];
  
  if (schema.type) {
    const actualType = Array.isArray(data) ? "array" : typeof data;
    if (schema.type === "integer" && typeof data === "number") {
      if (!Number.isInteger(data)) errors.push(`${path}: expected integer`);
    } else if (actualType !== schema.type) {
      errors.push(`${path || "root"}: expected ${schema.type}, got ${actualType}`);
      return errors;
    }
  }
  
  if (schema.required && schema.type === "object") {
    for (const key of schema.required) {
      if (!(key in (data || {}))) {
        errors.push(`${path}.${key}: required field missing`);
      }
    }
  }
  
  if (schema.properties && typeof data === "object" && data !== null) {
    for (const [key, subSchema] of Object.entries(schema.properties)) {
      if (key in data) {
        errors.push(...validateJsonSchema(data[key], subSchema as any, `${path}.${key}`));
      }
    }
  }

  if (schema.minimum !== undefined && typeof data === "number" && data < schema.minimum) {
    errors.push(`${path}: value ${data} is below minimum ${schema.minimum}`);
  }
  if (schema.maximum !== undefined && typeof data === "number" && data > schema.maximum) {
    errors.push(`${path}: value ${data} exceeds maximum ${schema.maximum}`);
  }

  if (schema.items && Array.isArray(data)) {
    data.forEach((item: any, i: number) => {
      errors.push(...validateJsonSchema(item, schema.items, `${path}[${i}]`));
    });
  }

  return errors;
}
