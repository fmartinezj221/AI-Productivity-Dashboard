import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { conversations, messages, insertConversationSchema, insertMessageSchema, type Conversation, type Message, type InsertConversation, type InsertMessage } from "./models/chat";

export { conversations, messages, insertConversationSchema, insertMessageSchema, type Conversation, type Message, type InsertConversation, type InsertMessage };

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;
