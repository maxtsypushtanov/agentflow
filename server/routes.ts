import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertWorkflowSchema } from "@shared/schema";

export async function registerRoutes(server: Server, app: Express) {
  // Get all workflows
  app.get("/api/workflows", async (_req, res) => {
    const workflows = await storage.getWorkflows();
    res.json(workflows);
  });

  // Get single workflow
  app.get("/api/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const workflow = await storage.getWorkflow(id);
    if (!workflow) return res.status(404).json({ error: "Workflow not found" });
    res.json(workflow);
  });

  // Create workflow
  app.post("/api/workflows", async (req, res) => {
    const parsed = insertWorkflowSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const workflow = await storage.createWorkflow(parsed.data);
    res.status(201).json(workflow);
  });

  // Update workflow
  app.patch("/api/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const workflow = await storage.updateWorkflow(id, req.body);
    if (!workflow) return res.status(404).json({ error: "Workflow not found" });
    res.json(workflow);
  });

  // Delete workflow
  app.delete("/api/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const deleted = await storage.deleteWorkflow(id);
    if (!deleted) return res.status(404).json({ error: "Workflow not found" });
    res.status(204).send();
  });
}
