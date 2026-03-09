import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register AI chat routes
  registerChatRoutes(app);

  app.get(api.tasks.list.path, async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.get("/api/tasks/:id", async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), input);
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.ai.generateTasks.path, async (req, res) => {
    try {
      const { goal } = api.ai.generateTasks.input.parse(req.body);
      
      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: "You are an AI task generator. Given a goal, generate 3-5 actionable tasks. Return ONLY valid JSON in this format: { \"tasks\": [ { \"title\": \"...\", \"description\": \"...\" } ] }" },
          { role: "user", content: goal }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0]?.message?.content || '{"tasks":[]}');
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("AI Generation Error:", err);
      res.status(500).json({ message: "Failed to generate tasks" });
    }
  });

  // Seed data if the database is empty
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const tasks = await storage.getTasks();
  if (tasks.length === 0) {
    await storage.createTask({ title: "Setup Dashboard", description: "Review the initial AI dashboard layout.", status: "completed" });
    await storage.createTask({ title: "Try AI task generation", description: "Enter a goal and let the AI break it down.", status: "pending" });
    await storage.createTask({ title: "Chat with Assistant", description: "Use the chat tab to ask for productivity tips.", status: "pending" });
  }
}
